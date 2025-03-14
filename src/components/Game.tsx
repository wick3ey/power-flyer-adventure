import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';

import useGameState from '../hooks/useGameState';
import useGameControls from '../hooks/useGameControls';
import useGamePhysics from '../hooks/useGamePhysics';

import GameCanvas from './GameCanvas';
import ScorePanel from './ScorePanel';
import GameControls from './GameControls';
import GameMenu from './GameMenu';
import LevelSelect from './LevelSelect';
import Coin from './Coin';

import { generateId } from '../utils/gameUtils';
import { preloadSounds } from '../utils/soundUtils';

const Game = () => {
  // Game state and controls
  const {
    gameState,
    initializeLevel,
    startGame,
    pauseGame,
    endGame,
    completeLevel,
    jump,
    updateGameState,
    resetGame,
    addScore,
    addObstacles,
    addCoins,
    setGameState,
    collectCoin
  } = useGameState();
  
  // Game physics
  const physics = useGamePhysics();
  
  // Animation frame ref
  const animationFrameRef = useRef<number>();
  
  // Track passed obstacles to avoid double counting scores
  const [passedObstacleIds, setPassedObstacleIds] = useState<string[]>([]);
  
  // Timer for spawning obstacles
  const [lastObstacleTime, setLastObstacleTime] = useState(0);
  
  // Track the last obstacle's x position to prevent spawning too close
  const [lastObstacleX, setLastObstacleX] = useState<number | null>(null);
  
  // Track collected coins
  const [coinsCollected, setCoinsCollected] = useState(0);
  
  // UI state
  const [showMenu, setShowMenu] = useState(true);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  
  // Game dynamic difficulty scaling
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  
  // Track time played for difficulty scaling
  const [gameStartTime, setGameStartTime] = useState(0);

  // Preload game sounds
  useEffect(() => {
    preloadSounds(['/coin-sound.mp3']);
  }, []);
  
  // Handle keyboard and touch controls
  const { isMobile } = useGameControls({
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    onJump: jump,
    onPause: pauseGame,
    onStart: () => {
      if (!gameState.isPlaying) {
        if (gameState.activeLevel === null) {
          initializeLevel(1);
          setTimeout(() => {
            startGame();
            setGameStartTime(Date.now());
          }, 100);
        } else {
          startGame();
          setGameStartTime(Date.now());
        }
        setShowMenu(false);
      }
    },
    onReset: resetGame
  });
  
  // Update difficulty based on score and time
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      // Calculate time played in seconds
      const timePlayed = (Date.now() - gameStartTime) / 1000;
      
      // Increase difficulty based on both score and time played
      const scoreFactor = gameState.score > 0 ? Math.log(gameState.score + 1) * 0.3 : 0;
      const timeFactor = timePlayed > 0 ? Math.log(timePlayed + 1) * 0.2 : 0;
      
      const newDifficulty = 1 + scoreFactor + timeFactor;
      
      // Cap difficulty at 5 to prevent it from becoming impossible
      const cappedDifficulty = Math.min(5, newDifficulty);
      
      if (Math.abs(cappedDifficulty - currentDifficulty) > 0.2) {
        setCurrentDifficulty(cappedDifficulty);
        
        // Notify player of increasing difficulty at certain thresholds
        if (Math.floor(cappedDifficulty) > Math.floor(currentDifficulty)) {
          toast.info(`Difficulty increased to level ${Math.floor(cappedDifficulty)}!`);
        }
      }
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.score, gameStartTime, currentDifficulty]);
  
  // Handle coin collection
  const handleCoinCollect = (coin: any) => {
    if (!coin.isCollected) {
      // Update game state to mark the coin as collected
      const updatedCollectibles = gameState.collectibles.map(c => {
        if (c.id === coin.id) {
          return { ...c, isCollected: true };
        }
        return c;
      });
      
      // Update state
      setGameState({
        ...gameState,
        collectibles: updatedCollectibles,
        score: gameState.score + coin.value
      });
      
      // Increment collected coins counter
      setCoinsCollected(prev => prev + 1);
      
      // Visual feedback based on coin value
      let toastColor = "yellow";
      let coinMessage = "";
      
      if (coin.value >= 100) {
        toastColor = "purple";
        coinMessage = "Jackpot! +100";
      } else if (coin.value >= 50) {
        toastColor = "orange";
        coinMessage = "Bonus Coin! +50";
      } else if (coin.value >= 25) {
        toastColor = "blue";
        coinMessage = "Special Coin! +25";
      }
      
      // Show toast for special coins
      if (coinMessage) {
        toast.success(coinMessage, {
          icon: <Coins className={`text-${toastColor}-400`} />,
          duration: 1500
        });
      }
    }
  };
  
  // Game loop
  useEffect(() => {
    // Only run the game loop if the game is playing and not paused
    if (!gameState.isPlaying || gameState.isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }
    
    // Function to generate Flappy Bird style pipe obstacles with improved collision prevention
    const generateObstacles = (timestamp: number) => {
      // Generate new obstacles with variable frequency based on difficulty
      const obstacleFrequency = 2000 - (currentDifficulty * 150); // Decrease time between obstacles as difficulty increases
      const minFrequency = 1300; // Increased minimum frequency to prevent overcrowding
      const actualFrequency = Math.max(minFrequency, obstacleFrequency);
      
      // Increased minimum distance between obstacles to prevent overcrowding
      const minDistanceBetweenObstacles = window.innerWidth * 0.65; // 65% of screen width
      
      // Check if enough time has passed AND if obstacles are spaced far enough apart
      const canGenerateObstacle = timestamp - lastObstacleTime > actualFrequency;
      const isProperlySpaced = lastObstacleX === null || 
                              !gameState.obstacles.length || 
                              lastObstacleX < window.innerWidth - minDistanceBetweenObstacles;
                              
      if (canGenerateObstacle && isProperlySpaced) {
        // Double check for any obstacles near the right edge of the screen
        const hasObstaclesNearEdge = gameState.obstacles.some(obstacle => {
          // Don't generate obstacles if any are still near the right edge of the screen
          return obstacle.x + obstacle.width > window.innerWidth - 120; // Increased safety margin
        });
        
        if (!hasObstaclesNearEdge) {
          // Use the current difficulty to generate appropriate obstacles
          const newObstacles = physics.generateFlappyObstacles(
            window.innerWidth, 
            window.innerHeight,
            currentDifficulty
          );
          
          // Additional validation: Check that obstacles have a passable gap
          // Ensure at least 200px gap for the player to pass through
          const isValidObstaclePair = newObstacles.length === 2 && 
                                    newObstacles[1].y > (newObstacles[0].y + newObstacles[0].height + 200);
          
          if (isValidObstaclePair) {
            addObstacles(newObstacles);
            setLastObstacleTime(timestamp);
            setLastObstacleX(window.innerWidth); // New obstacles always start at the right edge
          } else {
            console.error("Invalid obstacle generation detected, retrying...");
            // Try again with lower difficulty to ensure a valid gap
            const fixedObstacles = physics.generateFlappyObstacles(
              window.innerWidth, 
              window.innerHeight,
              Math.max(1, currentDifficulty - 1) // Significantly lower difficulty for the retry
            );
            
            // Final safety check - only add if there's a valid gap
            if (fixedObstacles.length === 2 && 
                fixedObstacles[1].y > (fixedObstacles[0].y + fixedObstacles[0].height + 200)) {
              addObstacles(fixedObstacles);
              setLastObstacleTime(timestamp);
              setLastObstacleX(window.innerWidth);
            } else {
              console.error("Failed to generate valid obstacles even after retry. Skipping this obstacle.");
              // Skip this obstacle generation cycle
              setLastObstacleTime(timestamp);
            }
          }
        } else {
          console.log("Prevented overlapping obstacles - waiting for screen to clear");
        }
      }
    };
    
    // Generate coins - simplified and more reliable approach
    const generateCoins = () => {
      // Find pairs of obstacles that could have coins between them
      // We only want obstacles that have just entered the screen
      const obstaclePairs = [];
      
      // Group obstacles by their pair ID
      const pairMap = new Map();
      
      gameState.obstacles.forEach(obstacle => {
        // Look for pipes that are just entering the screen
        // This ensures we only generate coins once per pipe pair
        if (obstacle.x > window.innerWidth - 50 && obstacle.x < window.innerWidth + 50) {
          // Get the pipe pair ID (the timestamp-randomSuffix part)
          const pairIdParts = obstacle.id.split('-');
          // For pipe-top-12345-678 or pipe-bottom-12345-678, extract 12345-678
          const pairId = pairIdParts.slice(2).join('-');
          
          if (!pairMap.has(pairId)) {
            pairMap.set(pairId, []);
          }
          pairMap.get(pairId).push(obstacle);
        }
      });
      
      // Now find valid pairs (must have 2 obstacles - top and bottom pipe)
      pairMap.forEach((obstacles, pairId) => {
        if (obstacles.length === 2) {
          // Sort by y position to get top pipe first, bottom pipe second
          obstacles.sort((a, b) => a.y - b.y);
          obstaclePairs.push({
            pairId,
            topPipe: obstacles[0],
            bottomPipe: obstacles[1]
          });
        }
      });
      
      // For each valid pair, check if we've already generated coins
      obstaclePairs.forEach(({ pairId, topPipe, bottomPipe }) => {
        // Check if this pair already has coins
        const hasCoinsBetween = gameState.collectibles.some(coin => 
          coin.id.includes(pairId)
        );
        
        if (hasCoinsBetween) return;
        
        // Calculate the gap between pipes
        const gapTop = topPipe.y + topPipe.height;
        const gapBottom = bottomPipe.y;
        const gapHeight = gapBottom - gapTop;
        
        // Only add coins if the gap is large enough
        if (gapHeight < 100) return;
        
        // Generate a single coin in the middle of the gap
        const coinSize = 40; // Fixed size for better visibility
        const coinX = topPipe.x + (topPipe.width / 2) - (coinSize / 2);
        const coinY = gapTop + (gapHeight / 2) - (coinSize / 2);
        
        const newCoin = {
          id: `coin-${pairId}`,
          x: coinX,
          y: coinY,
          width: coinSize,
          height: coinSize,
          value: 10,
          isCollected: false
        };
        
        // Add the coin to the game state
        setGameState(prev => ({
          ...prev,
          collectibles: [...prev.collectibles, newCoin]
        }));
      });
    };
    
    // Check for coin collections
    const checkCoinCollections = () => {
      // Check if there are any collectibles
      if (gameState.collectibles.length === 0) return;
      
      const { character, collectibles } = gameState;
      
      // Find coins that haven't been collected yet
      const uncollectedCoins = collectibles.filter(coin => !coin.isCollected);
      let newCoinCount = 0;
      let pointsEarned = 0;
      
      // Check each coin for collision with character
      const updatedCollectibles = collectibles.map(coin => {
        // Skip already collected coins
        if (coin.isCollected) return coin;
        
        // Check collision
        if (
          character.x < coin.x + coin.width &&
          character.x + character.width > coin.x &&
          character.y < coin.y + coin.height &&
          character.y + character.height > coin.y
        ) {
          newCoinCount += 1;
          pointsEarned += coin.value;
          
          // Play coin collection sound via the playCoinSound utility
          // This will now be handled by the Coin component itself
          
          return { ...coin, isCollected: true };
        }
        
        return coin;
      });
      
      // Update coin counter and score
      if (newCoinCount > 0) {
        setCoinsCollected(prev => prev + newCoinCount);
        
        // Show collection milestone notifications
        if ((coinsCollected + newCoinCount) % 10 === 0) {
          toast.success(`${coinsCollected + newCoinCount} coins collected!`, {
            icon: <Coins className="text-yellow-400" />,
          });
        }
        
        // Update game state with collected coins
        setGameState(prev => ({
          ...prev,
          collectibles: updatedCollectibles,
          score: prev.score + pointsEarned
        }));
      }
    };
    
    // Check if obstacles have been passed for scoring
    const checkPassedObstacles = () => {
      const newPassedIds: string[] = [...passedObstacleIds];
      let scoreAdded = false;
      
      gameState.obstacles.forEach(obstacle => {
        if (physics.checkObstaclePassed(gameState.character, obstacle, passedObstacleIds)) {
          newPassedIds.push(obstacle.id);
          if (!scoreAdded) {
            // Award more points at higher difficulties
            const pointsGained = Math.floor(1 + (currentDifficulty * 0.5));
            addScore(pointsGained);
            scoreAdded = true; // Only add score once per pair of pipes
          }
        }
      });
      
      if (newPassedIds.length !== passedObstacleIds.length) {
        setPassedObstacleIds(newPassedIds);
      }
    };
    
    // Update last obstacle X position based on the rightmost obstacle
    const updateLastObstacleX = () => {
      if (gameState.obstacles.length === 0) {
        setLastObstacleX(null);
        return;
      }
      
      const rightmostObstacle = gameState.obstacles.reduce((rightmost, current) => {
        return current.x > rightmost.x ? current : rightmost;
      }, gameState.obstacles[0]);
      
      setLastObstacleX(rightmostObstacle.x);
    };
    
    // Game loop function
    const gameLoop = (timestamp: number) => {
      // Generate obstacles 
      generateObstacles(timestamp);
      
      // Generate coins between obstacles
      generateCoins();
      
      // Check for coin collections
      checkCoinCollections();
      
      // Update obstacle tracking
      updateLastObstacleX();
      
      // Check for scoring
      checkPassedObstacles();
      
      // Update game state (physics, collisions, etc.)
      updateGameState();
      
      // Continue the game loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Start the game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    // Clean up on unmount or when game state changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    gameState,
    gameState.isPlaying, 
    gameState.isPaused, 
    updateGameState, 
    gameState.obstacles, 
    gameState.character, 
    physics, 
    addObstacles, 
    addScore, 
    passedObstacleIds, 
    lastObstacleTime,
    currentDifficulty,
    lastObstacleX,
    coinsCollected,
    gameState.collectibles,
    setGameState
  ]);
  
  // Reset passed obstacles when game resets
  useEffect(() => {
    if (!gameState.isPlaying) {
      setPassedObstacleIds([]);
      setLastObstacleTime(0);
      setCurrentDifficulty(1);
      setLastObstacleX(null); // Reset obstacle X position tracking
      setCoinsCollected(0); // Reset coin count
    }
  }, [gameState.isPlaying]);
  
  // Handle level selection
  const handleLevelSelect = (levelId: number) => {
    initializeLevel(levelId);
    setShowLevelSelect(false);
    setShowMenu(false);
    setTimeout(() => {
      startGame();
      setGameStartTime(Date.now());
    }, 100);
  };
  
  // Directly render the coins in the game
  const renderCoins = () => {
    return gameState.collectibles.map(coin => (
      <Coin 
        key={coin.id} 
        coin={coin} 
        onCollect={handleCoinCollect} 
      />
    ));
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Game canvas */}
      <GameCanvas gameState={gameState} />
      
      {/* Render coins directly in the game div for better interaction */}
      {gameState.isPlaying && !gameState.isPaused && renderCoins()}
      
      {/* Score panel with coins display */}
      {gameState.isPlaying && (
        <ScorePanel 
          score={gameState.score}
          highScore={gameState.highScore}
          lives={gameState.lives}
          level={gameState.level}
          coins={coinsCollected}
        />
      )}
      
      {/* Difficulty indicator */}
      {gameState.isPlaying && !gameState.isPaused && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm text-white text-sm">
          <span className="font-bold">Difficulty:</span> Level {Math.floor(currentDifficulty)}
        </div>
      )}
      
      {/* Game controls */}
      <GameControls 
        isPlaying={gameState.isPlaying}
        isPaused={gameState.isPaused}
        onJump={jump}
        onPause={pauseGame}
        onStart={() => {
          if (gameState.activeLevel === null) {
            initializeLevel(1);
            setTimeout(() => {
              startGame();
              setGameStartTime(Date.now());
            }, 100);
          } else {
            startGame();
            setGameStartTime(Date.now());
          }
          setShowMenu(false);
        }}
        onReset={resetGame}
        isMobile={isMobile}
      />
      
      {/* Game menu */}
      <AnimatePresence>
        {showMenu && (
          <GameMenu 
            onStart={() => {
              initializeLevel(1);
              setTimeout(() => {
                startGame();
                setGameStartTime(Date.now());
                setShowMenu(false);
              }, 100);
            }}
            onSelectLevel={() => setShowLevelSelect(true)}
            onShowTutorial={() => toast.info("Game tutorial would be shown here!")}
            onShowSettings={() => toast.info("Game settings would be shown here!")}
            highScore={gameState.highScore}
          />
        )}
      </AnimatePresence>
      
      {/* Level select */}
      <AnimatePresence>
        {showLevelSelect && (
          <LevelSelect 
            levels={gameState.levels}
            onSelectLevel={handleLevelSelect}
            onClose={() => setShowLevelSelect(false)}
            currentLevel={gameState.level}
          />
        )}
      </AnimatePresence>
      
      {/* Game over overlay with coin stats */}
      <AnimatePresence>
        {gameState.isGameOver && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="game-card max-w-md w-full text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <h2 className="text-2xl font-bold mb-2">Game Over</h2>
              <p className="text-gray-500 mb-4">Your score: {gameState.score}</p>
              
              {gameState.score === gameState.highScore && gameState.score > 0 && (
                <div className="chip bg-yellow-100 text-yellow-800 mb-4">New High Score!</div>
              )}
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-gray-700">
                  Coins collected: <span className="font-bold">{coinsCollected}</span>
                </p>
              </div>
              
              <p className="text-sm text-gray-400 mb-4">
                You reached difficulty level {Math.floor(currentDifficulty)}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    resetGame();
                    setShowMenu(true);
                    setCoinsCollected(0);
                  }}
                  className="game-button-secondary flex-1"
                >
                  Main Menu
                </button>
                
                <button 
                  onClick={() => {
                    initializeLevel(gameState.level);
                    setCoinsCollected(0);
                    setTimeout(() => {
                      startGame();
                      setGameStartTime(Date.now());
                    }, 100);
                  }}
                  className="game-button flex-1"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Level completed overlay */}
      <AnimatePresence>
        {gameState.isLevelCompleted && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="game-card max-w-md w-full text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div className="chip bg-green-100 text-green-800 mb-2">Success!</div>
              <h2 className="text-2xl font-bold mb-2">Level Completed</h2>
              <p className="text-gray-500 mb-4">Your score: {gameState.score}</p>
              
              <div className="flex justify-center mb-6">
                {Array.from({ length: 3 }).map((_, i) => {
                  const level = gameState.levels.find(l => l.id === gameState.level);
                  const stars = level ? level.stars : 0;
                  
                  return (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ 
                        scale: i < stars ? 1 : 0.5,
                        rotate: 0
                      }}
                      transition={{ 
                        delay: i * 0.3,
                        type: 'spring',
                        damping: 10,
                        stiffness: 200
                      }}
                    >
                      <div 
                        className={`mx-2 w-12 h-12 flex items-center justify-center ${
                          i < stars 
                            ? 'text-game-warning' 
                            : 'text-gray-300'
                        }`}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path 
                            d="M12 2L14.39 8.26L21 9.27L16.5 14.14L17.77 21L12 17.77L6.23 21L7.5 14.14L3 9.27L9.61 8.26L12 2Z" 
                            fill={i < stars ? 'currentColor' : 'none'}
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    resetGame();
                    setShowMenu(true);
                  }}
                  className="game-button-secondary flex-1"
                >
                  Main Menu
                </button>
                
                <button 
                  onClick={() => {
                    // Go to next level if available
                    const nextLevel = gameState.level + 1;
                    const hasNextLevel = gameState.levels.some(l => l.id === nextLevel);
                    
                    if (hasNextLevel) {
                      initializeLevel(nextLevel);
                      setTimeout(() => startGame(), 100);
                    } else {
                      // If no next level, go back to menu
                      setShowMenu(true);
                      toast.success("You've completed all available levels!");
                    }
                  }}
                  className="game-button flex-1"
                >
                  Next Level
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
