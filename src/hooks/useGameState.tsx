import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { PowerUpType, ObstacleType, DifficultyLevel } from '../utils/gameUtils';

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

  // Jump action
  const jump = useCallback(() => {
    if (gameState.character.isJumping) return;
    
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        velocityY: -10,
        isJumping: true
      }
    }));
  }, [gameState.character.isJumping]);

  // Update game state - called on each animation frame
  const updateGameState = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    setGameState(prev => {
      // Update character position
      const updatedCharacter = {
        ...prev.character,
        velocityY: prev.character.velocityY + prev.gravity,
        y: prev.character.y + prev.character.velocityY,
        isJumping: prev.character.y + prev.character.velocityY < 350 // Ground level
      };

      // Keep character within bounds
      if (updatedCharacter.y > 350 - updatedCharacter.height) {
        updatedCharacter.y = 350 - updatedCharacter.height;
        updatedCharacter.velocityY = 0;
        updatedCharacter.isJumping = false;
      }

      // Check for collisions with obstacles
      const isColliding = prev.obstacles.some(obstacle => {
        if (
          updatedCharacter.x < obstacle.x + obstacle.width &&
          updatedCharacter.x + updatedCharacter.width > obstacle.x &&
          updatedCharacter.y < obstacle.y + obstacle.height &&
          updatedCharacter.y + updatedCharacter.height > obstacle.y
        ) {
          return true;
        }
        return false;
      });

      // Handle collision
      if (isColliding && !updatedCharacter.hasShield) {
        // If player has shield, ignore collision
        // Otherwise, lose a life or end game
        if (prev.lives > 1) {
          toast.warning("Ouch! You lost a life!");
          return {
            ...prev,
            lives: prev.lives - 1,
            character: {
              ...updatedCharacter,
              isHurt: true
            }
          };
        } else {
          // Game over
          toast.error("Game over!");
          return {
            ...prev,
            isPlaying: false,
            isGameOver: true,
            lives: 0
          };
        }
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
            updatedCharacter.x + collectible.width > collectible.x &&
            updatedCharacter.y < collectible.y + collectible.height &&
            updatedCharacter.y + collectible.height > collectible.y
          ) {
            // Collect item
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

      // Move obstacles
      const obstacles = prev.obstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - obstacle.speed * prev.gameSpeed
      })).filter(obstacle => obstacle.x + obstacle.width > 0);

      // Check if level completed (simplified check - in a real game, we'd have more conditions)
      const isLevelCompleted = score >= (prev.activeLevel?.targetScore || 0);

      return {
        ...prev,
        character: updatedCharacter,
        obstacles,
        powerUps,
        collectibles,
        score,
        activePowerUps,
        isLevelCompleted
      };
    });
  }, [gameState.isPlaying, gameState.isPaused]);

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
    resetGame
  };
};

export default useGameState;
