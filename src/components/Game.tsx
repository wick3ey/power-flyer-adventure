
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameCanvas from './GameCanvas';
import GameMenu from './GameMenu';
import GameControls from './GameControls';
import ScorePanel from './ScorePanel';
import { ObstacleType, PowerUpType, generateId, DifficultyLevel } from '../utils/gameUtils';
import useGameState from '../hooks/useGameState';
import useGameControls from '../hooks/useGameControls';
import { useIsMobile } from '../hooks/use-mobile';

const INITIAL_SPAWN_DELAY = 2000; // ms before first obstacle spawns
const BASE_SPAWN_INTERVAL = 2000; // Base time between obstacles
const MIN_SPAWN_INTERVAL = 1400; // Minimum time between obstacles (for max difficulty)
const DIFFICULTY_INCREASE_RATE = 0.02; // How quickly difficulty increases
const MAX_DIFFICULTY = 10; // Cap on difficulty scaling

const Game: React.FC = () => {
  const {
    gameState, 
    startGame, 
    pauseGame, 
    updateGameState, 
    resetGame, 
    jump,
    initializeLevel,
    addObstacles,
    addCoins,
    generateCoins
  } = useGameState();
  
  const isMobile = useIsMobile();
  const controls = useGameControls({
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    isGameOver: gameState.isGameOver,
    onJump: jump,
    onPause: pauseGame,
    onStart: startGame,
    onReset: resetGame,
  });
  
  // State variables for obstacle generation
  const [lastObstacleTime, setLastObstacleTime] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [lastObstacleX, setLastObstacleX] = useState(0);
  const [passedObstacleIds, setPassedObstacleIds] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(true);
  
  // Reference to animation frame for cleanup
  const animationRef = useRef<number | null>(null);
  
  // Initialize level when component mounts
  useEffect(() => {
    initializeLevel(1); // Start with level 1
  }, [initializeLevel]);
  
  // Main game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    let lastTime = 0;
    
    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      // Update difficulty based on game time
      const gameTime = timestamp - gameStartTime;
      const newDifficulty = Math.min(
        MAX_DIFFICULTY,
        1 + (gameTime / 1000) * DIFFICULTY_INCREASE_RATE
      );
      
      if (newDifficulty !== currentDifficulty) {
        setCurrentDifficulty(newDifficulty);
      }
      
      // Generate obstacles with dynamic timing
      if (gameState.isPlaying && !gameState.isPaused) {
        // Calculate spawn interval based on current difficulty
        const difficultyFactor = (currentDifficulty - 1) / (MAX_DIFFICULTY - 1);
        const spawnInterval = BASE_SPAWN_INTERVAL - (difficultyFactor * (BASE_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL));
        
        // Check if it's time to spawn a new obstacle
        const timeSinceLastObstacle = timestamp - lastObstacleTime;
        const initialDelayPassed = gameStartTime > 0 && timestamp - gameStartTime > INITIAL_SPAWN_DELAY;
        
        // Check if enough horizontal space has passed since last obstacle
        // This ensures obstacles aren't too close together regardless of speed
        const minObstacleSpacing = window.innerWidth * 0.6; // 60% of screen width for spacing
        const enoughSpacePassed = lastObstacleX === 0 || (window.innerWidth - lastObstacleX) > minObstacleSpacing;
        
        if (
          (initialDelayPassed && timeSinceLastObstacle > spawnInterval && enoughSpacePassed) || 
          (initialDelayPassed && lastObstacleTime === 0)
        ) {
          // Generate obstacles with increasing difficulty
          const gapSize = Math.max(
            150, // Minimum gap size
            250 - (difficultyFactor * 100) // Gap shrinks as difficulty increases
          );
          
          const pipeWidth = 80;
          const pipeSpeed = 5 + (difficultyFactor * 3); // Speed increases with difficulty
          
          // Calculate random gap position
          const minGapTop = 100; // Minimum distance from top
          const maxGapBottom = window.innerHeight - 100; // Maximum distance from bottom
          const availableSpace = maxGapBottom - minGapTop - gapSize;
          const gapTop = minGapTop + (Math.random() * availableSpace);
          const gapBottom = gapTop + gapSize;
          
          // Create a top and bottom pipe
          const topPipeHeight = gapTop;
          const bottomPipeTop = gapBottom;
          const bottomPipeHeight = window.innerHeight - bottomPipeTop;
          
          const topPipeId = generateId();
          const bottomPipeId = generateId();
          
          const newObstacles = [
            {
              id: topPipeId,
              type: ObstacleType.STATIC,
              x: window.innerWidth,
              y: 0,
              width: pipeWidth,
              height: topPipeHeight,
              speed: pipeSpeed,
            },
            {
              id: bottomPipeId,
              type: ObstacleType.STATIC,
              x: window.innerWidth,
              y: bottomPipeTop,
              width: pipeWidth,
              height: bottomPipeHeight,
              speed: pipeSpeed,
            }
          ];
          
          // Check if the new obstacle pair forms a valid gap
          // This ensures the player always has a possible path
          const isValidObstaclePair = gapSize >= 150 && // Minimum gap must be at least 150px
            gapTop >= 50 && // Gap must start at least 50px from the top
            window.innerHeight - gapBottom >= 50; // Gap must end at least 50px from the bottom
          
          if (isValidObstaclePair) {
            addObstacles(newObstacles);
            
            // Generate coins between the obstacles
            if (newObstacles.length === 2) {
              const topPipe = newObstacles[0];
              const bottomPipe = newObstacles[1];
              const newCoins = generateCoins(topPipe, bottomPipe, currentDifficulty);
              if (newCoins && newCoins.length > 0) {
                addCoins(newCoins);
              }
            }
            
            setLastObstacleTime(timestamp);
            setLastObstacleX(window.innerWidth); // New obstacles always start at the right edge
          } else {
            // If not valid, try again on the next frame
            console.log("Invalid obstacle pair generated, retrying...");
          }
        }
      }
      
      // Update game state
      updateGameState();
      
      // Continue the game loop
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    // Cleanup animation frame on unmount or when game stops
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    gameState.isPlaying, 
    gameState.isPaused, 
    updateGameState, 
    addObstacles, 
    addCoins,
    gameStartTime, 
    passedObstacleIds, 
    lastObstacleTime,
    currentDifficulty,
    lastObstacleX,
    generateCoins
  ]);
  
  // Reset passed obstacles when game resets
  useEffect(() => {
    if (!gameState.isPlaying && gameState.isGameOver) {
      setPassedObstacleIds([]);
    }
  }, [gameState.isPlaying, gameState.isGameOver]);
  
  // Handle game over automatically on loss
  useEffect(() => {
    if (gameState.isGameOver && gameState.isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [gameState.isGameOver, gameState.isPlaying]);
  
  // Close menu when game starts
  useEffect(() => {
    if (gameState.isPlaying) {
      setShowMenu(false);
    }
  }, [gameState.isPlaying]);
  
  // Show menu when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      setShowMenu(true);
    }
  }, [gameState.isGameOver]);
  
  // Handle window blur/focus events to pause/resume game
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState.isPlaying && !gameState.isPaused) {
        pauseGame();
      }
    };
    
    const handleWindowBlur = () => {
      if (gameState.isPlaying && !gameState.isPaused) {
        pauseGame();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [gameState.isPlaying, gameState.isPaused, pauseGame]);
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-300 to-sky-600">
      {/* Game Canvas */}
      <div className="absolute inset-0 z-0">
        <GameCanvas gameState={gameState} />
      </div>
      
      {/* Game Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameMenu 
              onStart={() => {
                // Slight delay to avoid immediate jump on mobile
                if (isMobile) {
                  setTimeout(() => {
                    startGame();
                    setGameStartTime(Date.now());
                    setShowMenu(false);
                  }, 100);
                } else {
                  startGame();
                  setGameStartTime(Date.now());
                  setShowMenu(false);
                }
              }}
              onSelectLevel={() => {}}
              onShowTutorial={() => {}}
              onShowSettings={() => {}}
              highScore={gameState.highScore}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Score Panel (only when playing) */}
      {gameState.isPlaying && !showMenu && (
        <div className={`absolute top-0 ${isMobile ? 'left-0 right-0' : 'right-0'} p-4 z-40`}>
          <ScorePanel 
            score={gameState.score} 
            highScore={gameState.highScore}
            lives={gameState.lives}
            level={gameState.level}
          />
        </div>
      )}
      
      {/* Game Controls - only show on mobile when playing */}
      {gameState.isPlaying && !showMenu && isMobile && (
        <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center">
          <GameControls 
            isPlaying={gameState.isPlaying}
            isPaused={gameState.isPaused}
            onJump={jump}
            onPause={pauseGame}
            onStart={startGame}
            onReset={resetGame}
            isMobile={isMobile}
          />
        </div>
      )}
      
      {/* Game Instructions - only show when not on mobile */}
      {!isMobile && (
        <div className="absolute bottom-6 left-6 text-white text-shadow-md text-opacity-90 z-30">
          <p className="text-sm">Press <span className="px-2 py-1 bg-white/20 rounded">Space</span> to jump</p>
          <p className="text-sm mt-2">Press <span className="px-2 py-1 bg-white/20 rounded">P</span> to pause</p>
        </div>
      )}
      
      {/* Pause Screen */}
      {gameState.isPaused && gameState.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="text-4xl font-bold text-white animate-pulse">PAUSED</div>
        </div>
      )}
    </div>
  );
};

export default Game;
