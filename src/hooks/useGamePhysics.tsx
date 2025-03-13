
import { useCallback } from 'react';
import { Character, Obstacle, PowerUp, Collectible } from './useGameState';
import { checkCollision, clamp, lerp, ObstacleType } from '../utils/gameUtils';

interface PhysicsConfig {
  gravity: number;
  jumpForce: number;
  maxVelocityY: number;
  groundY: number;
  worldWidth: number;
  worldHeight: number;
  gameSpeed: number;
}

const defaultConfig: PhysicsConfig = {
  gravity: 0.6,  // Reduced slightly for better control
  jumpForce: -10,  // Less powerful jump for more control
  maxVelocityY: 15,
  groundY: 2000,  // Extremely high value to essentially remove the ground
  worldWidth: 800,
  worldHeight: 2000,  // Increased world height to match new ground concept
  gameSpeed: 2.2,  // Slightly slower game speed for better playability
};

const useGamePhysics = (config: Partial<PhysicsConfig> = {}) => {
  const physicsConfig: PhysicsConfig = { ...defaultConfig, ...config };

  const updateCharacterPhysics = useCallback((character: Character): Character => {
    let velocityY = character.velocityY + physicsConfig.gravity;
    velocityY = clamp(velocityY, -physicsConfig.maxVelocityY, physicsConfig.maxVelocityY);
    let y = character.y + velocityY;
    
    // Only stop at ceiling, no ground collision
    if (y < 0) {
      y = 0;
      velocityY = Math.abs(velocityY * 0.5);
    }
    
    // No ground detection or stopping - let the bird fall indefinitely
    return {
      ...character,
      y,
      velocityY,
      isJumping: velocityY < 0, // Only consider jumping if moving upward
    };
  }, [physicsConfig]);

  const jump = useCallback((character: Character): Character => {
    // Add a small randomness to make jumps feel more natural
    const jumpVariance = Math.random() * 0.4 - 0.2; // Between -0.2 and 0.2
    return {
      ...character,
      velocityY: physicsConfig.jumpForce + jumpVariance,
      isJumping: true,
    };
  }, [physicsConfig.jumpForce]);

  const generateFlappyObstacles = useCallback((worldWidth: number, worldHeight: number) => {
    // Even larger gap for easier navigation
    const gapSize = 320; // Increased from 280 to 320 for much more room to maneuver
    // Make sure gap is within a reasonable part of the screen
    const minGapPosition = 120; // Keep away from the very top
    const maxGapPosition = worldHeight - gapSize - 120; // Keep away from the bottom
    const gapPosition = Math.random() * (maxGapPosition - minGapPosition) + minGapPosition;
    
    const topPipe: Obstacle = {
      id: `pipe-top-${Date.now()}`,
      type: ObstacleType.STATIC,
      x: worldWidth,
      y: 0,
      width: 80,
      height: gapPosition,
      speed: physicsConfig.gameSpeed,
    };
    const bottomPipe: Obstacle = {
      id: `pipe-bottom-${Date.now()}`,
      type: ObstacleType.STATIC,
      x: worldWidth,
      y: gapPosition + gapSize,
      width: 80,
      height: worldHeight - (gapPosition + gapSize),
      speed: physicsConfig.gameSpeed,
    };
    return [topPipe, bottomPipe];
  }, [physicsConfig.gameSpeed]);

  const updateObstaclePhysics = useCallback((obstacle: Obstacle): Obstacle => {
    const x = obstacle.x - obstacle.speed;
    const rotation = obstacle.rotation !== undefined 
      ? (obstacle.rotation + 1) % 360 
      : undefined;
    return {
      ...obstacle,
      x,
      rotation,
    };
  }, []);

  const checkObstacleCollisions = useCallback((
    character: Character,
    obstacles: Obstacle[]
  ): { collided: boolean; collidedWith: Obstacle | null } => {
    for (const obstacle of obstacles) {
      if (checkCollision(character, obstacle)) {
        return { collided: true, collidedWith: obstacle };
      }
    }
    return { collided: false, collidedWith: null };
  }, []);

  const checkObstaclePassed = useCallback((
    character: Character,
    obstacle: Obstacle,
    passedObstacleIds: string[]
  ): boolean => {
    if (obstacle.type === ObstacleType.STATIC && obstacle.y === 0) {
      const characterRightEdge = character.x + character.width;
      const obstacleMiddleX = obstacle.x + (obstacle.width / 2);
      if (characterRightEdge > obstacleMiddleX && !passedObstacleIds.includes(obstacle.id)) {
        return true;
      }
    }
    return false;
  }, []);

  const checkPowerUpCollisions = useCallback((
    character: Character,
    powerUps: PowerUp[]
  ): { collided: boolean; collected: PowerUp[] } => {
    const collected: PowerUp[] = [];
    for (const powerUp of powerUps) {
      if (!powerUp.isCollected && checkCollision(character, powerUp)) {
        collected.push(powerUp);
      }
    }
    return { 
      collided: collected.length > 0,
      collected 
    };
  }, []);

  const checkCollectibleCollisions = useCallback((
    character: Character,
    collectibles: Collectible[]
  ): { collided: boolean; collected: Collectible[] } => {
    const collected: Collectible[] = [];
    for (const collectible of collectibles) {
      if (!collectible.isCollected && checkCollision(character, collectible)) {
        collected.push(collectible);
      }
    }
    return { 
      collided: collected.length > 0,
      collected 
    };
  }, []);

  const applyBreakablePhysics = useCallback((
    obstacle: Obstacle,
    impactForce: number
  ): Obstacle => {
    if (obstacle.type !== 'breakable') return obstacle;
    const health = (obstacle.health || 1) - impactForce;
    return {
      ...obstacle,
      health,
      isBreaking: health <= 0,
    };
  }, []);

  return {
    updateCharacterPhysics,
    jump,
    updateObstaclePhysics,
    checkObstacleCollisions,
    checkObstaclePassed,
    generateFlappyObstacles,
    checkPowerUpCollisions,
    checkCollectibleCollisions,
    applyBreakablePhysics,
  };
};

export default useGamePhysics;
