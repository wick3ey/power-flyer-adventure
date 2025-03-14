import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { PowerUpType, ObstacleType, DifficultyLevel, generateId } from '../utils/gameUtils';
import useGamePhysics from './useGamePhysics';
import useSoundEffects from './useSoundEffects';

// Define the types for our game state
export interface Character {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  velocityX: number;
  isJumping: boolean;
  hasShield: boolean;
  isHurt: boolean;
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  rotation?: number;
  isBreaking?: boolean;
  health?: number;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  isCollected: boolean;
  duration: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  isCollected: boolean;
}

export interface GameLevel {
  id: number;
  name: string;
  difficulty: DifficultyLevel;
  backgroundImage: string;
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  collectibles: Collectible[];
  targetScore: number;
  completionTime: number;
  isCompleted: boolean;
  stars: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelCompleted: boolean;
  score: number;
  highScore: number;
  level: number;
  lives: number;
  character: Character;
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  collectibles: Collectible[];
  gravity: number;
  gameSpeed: number;
  levels: GameLevel[];
  activeLevel: GameLevel | null;
  activePowerUps: PowerUpType[];
}

// Initial game state
const initialCharacter: Character = {
  x: 100,
  y: 200,
  width: 50,
  height: 50,
  velocityY: 0,
  velocityX: 0,
  isJumping: false,
  hasShield: false,
  isHurt: false,
};

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  isLevelCompleted: false,
  score: 0,
  highScore: 0,
  level: 1,
  lives: 3,
  character: initialCharacter,
  obstacles: [],
  powerUps: [],
  collectibles: [],
  gravity: 0.5,
  gameSpeed: 1,
  levels: [],
  activeLevel: null,
  activePowerUps: [],
};

// Sample level data (we'll expand this later)
const sampleLevels: GameLevel[] = [
  {
    id: 1,
    name: "Forest Adventure",
    difficulty: DifficultyLevel.EASY,
    backgroundImage: "forest-bg.jpg",
    obstacles: [],
    powerUps: [],
    collectibles: [],
    targetScore: 1000,
    completionTime: 60, // seconds
    isCompleted: false,
    stars: 0,
  },
  {
    id: 2,
    name: "Desert Challenge",
    difficulty: DifficultyLevel.MEDIUM,
    backgroundImage: "desert-bg.jpg",
    obstacles: [],
    powerUps: [],
    collectibles: [],
    targetScore: 2000,
    completionTime: 90, // seconds
    isCompleted: false,
    stars: 0,
  },
  {
    id: 3,
    name: "Ice World",
    difficulty: DifficultyLevel.HARD,
    backgroundImage: "ice-bg.jpg",
    obstacles: [],
    powerUps: [],
    collectibles: [],
    targetScore: 3000,
    completionTime: 120, // seconds
    isCompleted: false,
    stars: 0,
  },
];

// Custom hook for game state management
const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    ...initialGameState,
    levels: sampleLevels,
  });
  
  // Initialize game physics
  const physics = useGamePhysics();
  
  // Initialize sound effects
  const { playJumpSound, playCoinSound } = useSoundEffects();

  // Load high score from local storage
  useEffect(() => {
    const storedHighScore = localStorage.getItem('powerHighScore');
    if (storedHighScore) {
      setGameState(prev => ({
        ...prev,
        highScore: parseInt(storedHighScore, 10)
      }));
    }
  }, []);

  // Initialize level - set up obstacles, power-ups, and collectibles
  const initializeLevel = useCallback((levelId: number) => {
    const level = gameState.levels.find(l => l.id === levelId);
    
    if (!level) {
      console.error(`Level ${levelId} not found`);
      return;
    }

    // Reset character position
    const updatedCharacter = {
      ...initialCharacter,
      x: 100,
      y: 200,
    };

    // In a real game, we would load the level data from a server or local storage
    // For now, we'll generate some random obstacles and collectibles
    
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      isLevelCompleted: false,
      character: updatedCharacter,
      obstacles: [], // we'll populate these dynamically during gameplay
      powerUps: [],  // we'll populate these dynamically during gameplay
      collectibles: [], // we'll populate these dynamically during gameplay
      activeLevel: level,
      level: levelId,
      lives: 3,
      score: 0,
      activePowerUps: []
    }));

    toast.success(`Level ${levelId}: ${level.name} loaded!`);
  }, [gameState.levels]);

  // Start game
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      isLevelCompleted: false,
    }));
    
    toast("Game started!");
  }, []);

  // Pause game
  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
    
    toast(gameState.isPaused ? "Game resumed!" : "Game paused!");
  }, [gameState.isPaused]);

  // End game
  const endGame = useCallback(() => {
    // Check if current score is higher than high score
    if (gameState.score > gameState.highScore) {
      localStorage.setItem('powerHighScore', gameState.score.toString());
      setGameState(prev => ({
        ...prev,
        highScore: gameState.score,
        isPlaying: false,
        isPaused: false,
        isGameOver: true
      }));
      
      toast.success("New high score!");
    } else {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        isGameOver: true
      }));
      
      toast.error("Game over!");
    }
  }, [gameState.score, gameState.highScore]);

  // Complete level
  const completeLevel = useCallback(() => {
    const updatedLevels = gameState.levels.map(level => {
      if (level.id === gameState.level) {
        // Calculate stars based on score
        const percentage = gameState.score / level.targetScore;
        let stars = 1;
        if (percentage >= 0.9) stars = 3;
        else if (percentage >= 0.7) stars = 2;
        
        return {
          ...level,
          isCompleted: true,
          stars: Math.max(stars, level.stars) // Keep highest star rating
        };
      }
      return level;
    });

    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isLevelCompleted: true,
      levels: updatedLevels
    }));
    
    toast.success("Level completed!");
  }, [gameState.level, gameState.levels, gameState.score]);

  // Jump action - improved for Flappy Bird mechanics
  const jump = useCallback(() => {
    setGameState(prev => {
      // Don't allow jumps if game is paused or over
      if (!prev.isPlaying || prev.isPaused || prev.isGameOver) return prev;
      
      // Play jump sound when jumping
      playJumpSound();
      
      return {
        ...prev,
        character: {
          ...prev.character,
          velocityY: -10, // Strong upward velocity
          isJumping: true
        }
      };
    });
  }, [playJumpSound]);

  // Add obstacles to the game
  const addObstacles = useCallback((obstacles: Obstacle[]) => {
    setGameState(prev => ({
      ...prev,
      obstacles: [...prev.obstacles, ...obstacles]
    }));
  }, []);
  
  // Add coins to the game - new function
  const addCoins = useCallback((coins: Collectible[]) => {
    setGameState(prev => ({
      ...prev,
      collectibles: [...prev.collectibles, ...coins]
    }));
  }, []);
  
  // Generate coins between obstacles
  const generateCoins = useCallback((topPipe: Obstacle, bottomPipe: Obstacle, difficulty: number) => {
    // Calculate gap center
    const gapTop = topPipe.y + topPipe.height;
    const gapBottom = bottomPipe.y;
    const gapHeight = gapBottom - gapTop;
    const gapCenter = gapTop + gapHeight / 2;
    
    // Generate 1-3 coins in the gap
    const coinCount = Math.min(3, Math.max(1, Math.floor(difficulty)));
    const coins: Collectible[] = [];
    
    // Coin properties
    const coinSize = 30;
    const coinX = topPipe.x + topPipe.width / 2; // Place coins in middle of pipe opening
    
    if (coinCount === 1) {
      // Just one coin in the center
      coins.push({
        id: generateId(),
        x: coinX,
        y: gapCenter - coinSize / 2,
        width: coinSize,
        height: coinSize,
        value: 10,
        isCollected: false
      });
    } else {
      // Multiple coins in a line
      const spacing = gapHeight / (coinCount + 1);
      
      for (let i = 0; i < coinCount; i++) {
        coins.push({
          id: generateId(),
          x: coinX,
          y: gapTop + spacing * (i + 1) - coinSize / 2,
          width: coinSize,
          height: coinSize,
          value: 10,
          isCollected: false
        });
      }
    }
    
    return coins;
  }, []);

  // Add to score
  const addScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points
    }));
    
    // Optional: play a sound or show a toast for feedback
    // toast.success(`+${points} points!`);
  }, []);

  // Update game state - called on each animation frame
  const updateGameState = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    setGameState(prev => {
      // Update character position with gravity
      const updatedCharacter = {
        ...prev.character,
        velocityY: prev.character.velocityY + prev.gravity,
        y: prev.character.y + prev.character.velocityY,
      };

      // Keep character within upper bound only (ceiling)
      if (updatedCharacter.y < 0) {
        updatedCharacter.y = 0;
        updatedCharacter.velocityY = 0;
      }
      
      // Check if bird has fallen completely off screen (is no longer visible)
      // The bird is considered off-screen if its top edge is below the viewport height
      const isOffScreen = updatedCharacter.y > window.innerHeight;
      
      // Game over only when bird is completely off screen
      if (isOffScreen) {
        toast.error("Game over! Bird fell off screen!");
        return {
          ...prev,
          isPlaying: false,
          isGameOver: true
        };
      }

      // Use improved collision detection from physics hook
      const { collided } = physics.checkObstacleCollisions(updatedCharacter, prev.obstacles);

      // Handle collision with obstacles - instant game over on any collision
      if (collided) {
        toast.error("Game over! You hit an obstacle!");
        return {
          ...prev,
          isPlaying: false,
          isGameOver: true,
        };
      }

      // Check for obstacles that have been passed for scoring
      let scoreAdded = 0;
      const passedObstacles = prev.obstacles.filter(obstacle => {
        if (obstacle.type === ObstacleType.STATIC && obstacle.y === 0) {
          // This is a top pipe - check if we just passed its midpoint
          const characterRightEdge = updatedCharacter.x + updatedCharacter.width;
          const obstacleMidpoint = obstacle.x + obstacle.width / 2;
          
          // Check if we just crossed the midpoint in this frame
          const justPassed = characterRightEdge > obstacleMidpoint && 
                            prev.character.x + prev.character.width <= obstacleMidpoint;
          
          if (justPassed) {
            scoreAdded += 1;
            return true;
          }
        }
        return false;
      });
      
      // If we passed any obstacles, show a notification
      if (scoreAdded > 0) {
        // Optional visual feedback for scoring
        // toast.success(`+${scoreAdded} points!`);
      }

      // Check for collisions with power-ups
      const { powerUps, activePowerUps } = prev.powerUps.reduce(
        (acc, powerUp) => {
          if (
            !powerUp.isCollected &&
            updatedCharacter.x < powerUp.x + powerUp.width &&
            updatedCharacter.x + updatedCharacter.width > powerUp.x &&
            updatedCharacter.y < powerUp.y + powerUp.height &&
            updatedCharacter.y + updatedCharacter.height > powerUp.y
          ) {
            // Collect power-up
            toast.success(`Power-up collected: ${powerUp.type}!`);
            
            // Apply power-up effect
            if (powerUp.type === PowerUpType.SHIELD) {
              updatedCharacter.hasShield = true;
            }
            
            return {
              powerUps: [...acc.powerUps, { ...powerUp, isCollected: true }],
              activePowerUps: [...acc.activePowerUps, powerUp.type]
            };
          }
          return {
            powerUps: [...acc.powerUps, powerUp],
            activePowerUps: acc.activePowerUps
          };
        },
        { powerUps: [] as PowerUp[], activePowerUps: [...prev.activePowerUps] }
      );

      // Check for collisions with collectibles
      const { collectibles, score } = prev.collectibles.reduce(
        (acc, collectible) => {
          if (
            !collectible.isCollected &&
            updatedCharacter.x < collectible.x + collectible.width &&
            updatedCharacter.x + updatedCharacter.width > collectible.x &&
            updatedCharacter.y < collectible.y + collectible.height &&
            updatedCharacter.y + updatedCharacter.height > collectible.y
          ) {
            // Collect item and play coin sound
            playCoinSound();
            
            // Show toast for coin collection
            toast.success(`+${collectible.value} points!`, {
              duration: 1000,
              position: "top-center"
            });
            
            return {
              collectibles: [...acc.collectibles, { ...collectible, isCollected: true }],
              score: acc.score + collectible.value
            };
          }
          return {
            collectibles: [...acc.collectibles, collectible],
            score: acc.score
          };
        },
        { collectibles: [] as Collectible[], score: prev.score }
      );

      // Move obstacles and remove ones that have gone off screen
      const obstacles = prev.obstacles
        .map(obstacle => ({
          ...obstacle,
          x: obstacle.x - obstacle.speed
        }))
        .filter(obstacle => obstacle.x + obstacle.width > -100); // Keep obstacles slightly beyond the left edge

      return {
        ...prev,
        character: updatedCharacter,
        obstacles,
        score: prev.score + scoreAdded,
        powerUps,
        collectibles,
        activePowerUps,
      };
    });
  }, [gameState.isPlaying, gameState.isPaused, physics, playCoinSound]);

  // Reset game to initial state
  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...initialGameState,
      highScore: prev.highScore,
      levels: prev.levels
    }));
    
    toast.info("Game reset!");
  }, []);

  return {
    gameState,
    initializeLevel,
    startGame,
    pauseGame,
    endGame,
    completeLevel,
    jump,
    updateGameState,
    resetGame,
    addObstacles,
    addCoins,
    generateCoins,
    addScore
  };
};

export default useGameState;
