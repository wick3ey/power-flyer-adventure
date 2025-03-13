
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

import { PowerUpType, ObstacleType, generateId } from '../utils/gameUtils';

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
    resetGame
  } = useGameState();
  
  // Game physics
  const physics = useGamePhysics();
  
  // Animation frame ref
  const animationFrameRef = useRef<number>();
  
  // UI state
  const [showMenu, setShowMenu] = useState(true);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
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
          setTimeout(() => startGame(), 100);
        } else {
          startGame();
        }
        setShowMenu(false);
      }
    },
    onReset: resetGame
  });
  
  // Game loop
  useEffect(() => {
    // Only run the game loop if the game is playing and not paused
    if (!gameState.isPlaying || gameState.isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }
    
    // Function to generate random obstacles
    const generateObstacles = () => {
      if (Math.random() < 0.02) { // 2% chance each frame
        const obstacleTypes = [
          ObstacleType.STATIC,
          ObstacleType.MOVING,
          ObstacleType.BREAKABLE,
          ObstacleType.ROTATING
        ];
        
        const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        const obstacle = {
          id: generateId(),
          type: randomType,
          x: window.innerWidth,
          y: Math.random() * 300 + 50, // Random position between 50 and 350
          width: 50,
          height: 50,
          speed: 2 + Math.random() * 3, // Random speed between 2 and 5
          rotation: randomType === ObstacleType.ROTATING ? 0 : undefined,
          health: randomType === ObstacleType.BREAKABLE ? 3 : undefined
        };
        
        const newObstacles = [...gameState.obstacles, obstacle];
        
        // Update game state with new obstacle
        // This is a simplified approach - in a real game we'd have more sophisticated obstacle patterns
        updateGameState();
      }
    };
    
    // Function to generate random power-ups
    const generatePowerUps = () => {
      if (Math.random() < 0.005) { // 0.5% chance each frame
        const powerUpTypes = [
          PowerUpType.SHIELD,
          PowerUpType.SPEED,
          PowerUpType.MAGNET,
          PowerUpType.SLOW_TIME
        ];
        
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        const powerUp = {
          id: generateId(),
          type: randomType,
          x: window.innerWidth,
          y: Math.random() * 250 + 50, // Random position between 50 and 300
          width: 40,
          height: 40,
          isCollected: false,
          duration: 5000 // 5 seconds
        };
        
        const newPowerUps = [...gameState.powerUps, powerUp];
        
        // Update game state with new power-up
        updateGameState();
      }
    };
    
    // Game loop function
    const gameLoop = () => {
      // Generate obstacles and power-ups
      generateObstacles();
      generatePowerUps();
      
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
  }, [gameState.isPlaying, gameState.isPaused, updateGameState, gameState.obstacles, gameState.powerUps]);
  
  // Handle level selection
  const handleLevelSelect = (levelId: number) => {
    initializeLevel(levelId);
    setShowLevelSelect(false);
    setShowMenu(false);
    setTimeout(() => startGame(), 100);
  };
  
  // Handle showing tutorial
  const handleShowTutorial = () => {
    setShowTutorial(true);
    toast.info("Game tutorial would be shown here!");
    setTimeout(() => setShowTutorial(false), 1000);
  };
  
  // Handle showing settings
  const handleShowSettings = () => {
    setShowSettings(true);
    toast.info("Game settings would be shown here!");
    setTimeout(() => setShowSettings(false), 1000);
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Game canvas */}
      <GameCanvas gameState={gameState} />
      
      {/* Score panel */}
      {gameState.isPlaying && (
        <ScorePanel 
          score={gameState.score}
          highScore={gameState.highScore}
          lives={gameState.lives}
          level={gameState.level}
        />
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
            setTimeout(() => startGame(), 100);
          } else {
            startGame();
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
                setShowMenu(false);
              }, 100);
            }}
            onSelectLevel={() => setShowLevelSelect(true)}
            onShowTutorial={handleShowTutorial}
            onShowSettings={handleShowSettings}
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
                    setTimeout(() => startGame(), 100);
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
