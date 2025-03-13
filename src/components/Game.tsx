
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import useGameState from '../hooks/useGameState';
import useGameControls from '../hooks/useGameControls';
import useGamePhysics from '../hooks/useGamePhysics';

import GameCanvas from './GameCanvas';
import ScorePanel from './ScorePanel';
import GameControls from './GameControls';
import GameMenu from './GameMenu';
import LevelSelect from './LevelSelect';

import { generateId } from '../utils/gameUtils';

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
    addObstacles
  } = useGameState();
  
  // Game physics
  const physics = useGamePhysics();
  
  // Animation frame ref
  const animationFrameRef = useRef<number>();
  
  // Track passed obstacles to avoid double counting scores
  const [passedObstacleIds, setPassedObstacleIds] = useState<string[]>([]);
  
  // Timer for spawning obstacles
  const [lastObstacleTime, setLastObstacleTime] = useState(0);
  
  // UI state
  const [showMenu, setShowMenu] = useState(true);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  
  // Game dynamic difficulty scaling
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  
  // Track time played for difficulty scaling
  const [gameStartTime, setGameStartTime] = useState(0);
  
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
      // Base difficulty starts at 1, increases more rapidly as score/time goes up
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
  
  // Game loop
  useEffect(() => {
    // Only run the game loop if the game is playing and not paused
    if (!gameState.isPlaying || gameState.isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }
    
    // Function to generate Flappy Bird style pipe obstacles
    const generateObstacles = (timestamp: number) => {
      // Generate new obstacles with variable frequency based on difficulty
      const obstacleFrequency = 2000 - (currentDifficulty * 150); // Decrease time between obstacles as difficulty increases
      const minFrequency = 1200; // Never go below this minimum frequency
      const actualFrequency = Math.max(minFrequency, obstacleFrequency);
      
      if (timestamp - lastObstacleTime > actualFrequency) {
        // Use the current difficulty to generate appropriate obstacles
        const newObstacles = physics.generateFlappyObstacles(
          window.innerWidth, 
          window.innerHeight,
          currentDifficulty
        );
        
        // Validate that obstacles have a passable gap
        const isValidObstaclePair = newObstacles.length === 2 && 
                                   newObstacles[1].y > (newObstacles[0].y + newObstacles[0].height + 150);
        
        if (isValidObstaclePair) {
          addObstacles(newObstacles);
          setLastObstacleTime(timestamp);
        } else {
          console.error("Invalid obstacle generation detected, retrying...");
          // Try again immediately
          const fixedObstacles = physics.generateFlappyObstacles(
            window.innerWidth, 
            window.innerHeight,
            Math.max(1, currentDifficulty - 0.5) // Lower difficulty slightly for the retry
          );
          
          addObstacles(fixedObstacles);
          setLastObstacleTime(timestamp);
        }
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
    
    // Game loop function
    const gameLoop = (timestamp: number) => {
      // Generate obstacles 
      generateObstacles(timestamp);
      
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
    currentDifficulty
  ]);
  
  // Reset passed obstacles when game resets
  useEffect(() => {
    if (!gameState.isPlaying) {
      setPassedObstacleIds([]);
      setLastObstacleTime(0);
      setCurrentDifficulty(1);
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
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Game canvas */}
      <GameCanvas gameState={gameState} />
      
      {/* Score panel with difficulty indicator */}
      {gameState.isPlaying && (
        <ScorePanel 
          score={gameState.score}
          highScore={gameState.highScore}
          lives={gameState.lives}
          level={gameState.level}
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
      
      {/* Game over overlay */}
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
              
              <p className="text-sm text-gray-400 mb-4">
                You reached difficulty level {Math.floor(currentDifficulty)}
              </p>
              
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
                    initializeLevel(gameState.level);
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
