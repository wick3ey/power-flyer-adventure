
import { useCallback } from 'react';
import { Character, Obstacle, PowerUp, Collectible } from './useGameState';
import { checkCollision, clamp, lerp, ObstacleType, generateId } from '../utils/gameUtils';

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

  const generateFlappyObstacles = useCallback((worldWidth: number, worldHeight: number, difficulty: number = 1) => {
    // Scale gap size based on difficulty (smaller gaps at higher difficulty)
    // Increased minimum gap size to ensure playability
    const baseGapSize = 350; // Base gap size
    const minGapSize = 220; // Increased minimum gap size to ensure playability
    const gapSize = Math.max(minGapSize, baseGapSize - (difficulty * 10)); // Reduced difficulty impact
    
    // Make sure gap is within a reasonable part of the screen
    const minGapPosition = 120; // Minimum gap position from top
    const maxGapPosition = worldHeight - gapSize - 120; // Maximum gap position
    
    // Generate a valid gap position that ensures the bird can always pass through
    let gapPosition = Math.floor(Math.random() * (maxGapPosition - minGapPosition) + minGapPosition);
    
    // Ensure minimum space at top and bottom
    gapPosition = clamp(gapPosition, minGapPosition, maxGapPosition);
    
    // Calculate pipe width based on difficulty (wider pipes at higher difficulty)
    // Cap the maximum width to ensure playability
    const baseWidth = 80;
    const maxWidth = 100; // Maximum pipe width to ensure playability
    const pipeWidth = Math.min(maxWidth, baseWidth + (difficulty * 2)); // Reduced difficulty impact
    
    // Calculate pipe speed based on difficulty - capped for playability
    const baseSpeed = physicsConfig.gameSpeed;
    const maxSpeed = baseSpeed + 1.5; // Maximum speed cap
    const pipeSpeed = Math.min(maxSpeed, baseSpeed + (difficulty * 0.12)); // Reduced difficulty impact
    
    // Create obstacle ID with timestamp to ensure uniqueness
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    // Create top pipe (ceiling to gap)
    const topPipe: Obstacle = {
      id: `pipe-top-${timestamp}-${randomSuffix}`,
      type: ObstacleType.STATIC,
      x: worldWidth,
      y: 0,
      width: pipeWidth,
      height: gapPosition,
      speed: pipeSpeed,
    };
    
    // Create bottom pipe (gap to bottom)
    const bottomPipe: Obstacle = {
      id: `pipe-bottom-${timestamp}-${randomSuffix}`,
      type: ObstacleType.STATIC,
      x: worldWidth,
      y: gapPosition + gapSize,
      width: pipeWidth,
      height: worldHeight - (gapPosition + gapSize),
      speed: pipeSpeed,
    };

    // Validation: Ensure the pipes don't overlap
    if (bottomPipe.y <= topPipe.y + topPipe.height) {
      console.error("Fixing overlapping pipes! Gap position:", gapPosition, "Gap size:", gapSize);
      bottomPipe.y = topPipe.y + topPipe.height + gapSize;
    }
    
    // Validation: Ensure the bottom pipe doesn't go below screen
    if (bottomPipe.y >= worldHeight) {
      console.error("Bottom pipe is off-screen! Fixing...");
      // Recalculate positions to ensure bottom pipe starts before world height
      const maxTopHeight = worldHeight - gapSize - 50; // Ensure 50px minimum height for bottom pipe
      topPipe.height = Math.min(topPipe.height, maxTopHeight);
      bottomPipe.y = topPipe.height + gapSize;
      bottomPipe.height = worldHeight - bottomPipe.y;
    }
    
    // Validation: Double-check that the effective gap is at least the minimum size
    const effectiveGap = bottomPipe.y - (topPipe.y + topPipe.height);
    if (effectiveGap < minGapSize) {
      console.error(`Gap too small: ${effectiveGap}px. Minimum required: ${minGapSize}px. Fixing...`);
      // Ensure minimal gap size by adjusting bottom pipe position
      bottomPipe.y = topPipe.y + topPipe.height + minGapSize;
      bottomPipe.height = worldHeight - bottomPipe.y;
    }
    
    // FINAL VALIDATION: Run a sanity check to ensure the pipes are valid
    if (
      topPipe.height <= 0 || 
      bottomPipe.height <= 0 || 
      bottomPipe.y <= topPipe.y + topPipe.height ||
      bottomPipe.y - (topPipe.y + topPipe.height) < minGapSize
    ) {
      console.error("Invalid pipe configuration detected! Generating safe fallback pipes.");
      
      // Create a safe fallback configuration with a guaranteed passable gap
      return [
        {
          id: `pipe-top-safe-${timestamp}-${randomSuffix}`,
          type: ObstacleType.STATIC,
          x: worldWidth,
          y: 0,
          width: baseWidth,
          height: Math.floor(worldHeight * 0.3), // Top 30% of screen
          speed: baseSpeed,
        },
        {
          id: `pipe-bottom-safe-${timestamp}-${randomSuffix}`,
          type: ObstacleType.STATIC,
          x: worldWidth,
          y: Math.floor(worldHeight * 0.3) + minGapSize,
          width: baseWidth,
          height: worldHeight - (Math.floor(worldHeight * 0.3) + minGapSize),
          speed: baseSpeed,
        }
      ];
    }
    
    return [topPipe, bottomPipe];
  }, [physicsConfig.gameSpeed]);

  const checkObstacleCollisions = useCallback((
    character: Character,
    obstacles: Obstacle[]
  ): { collided: boolean; collidedWith: Obstacle | null } => {
    // Create character hitbox with exact dimensions for precise collision detection
    // No more forgiving hitboxes - any touch is a collision
    const characterHitbox = {
      x: character.x,
      y: character.y,
      width: character.width,
      height: character.height
    };
    
    for (const obstacle of obstacles) {
      // For all obstacles, use exact dimensions to detect collisions
      // Every part of the obstacle is dangerous
      const obstacleHitbox = {
        x: obstacle.x,
        y: obstacle.y,
        width: obstacle.width,
        height: obstacle.height
      };
      
      // Check for collision with the main body of the obstacle
      if (checkCollision(characterHitbox, obstacleHitbox)) {
        return { collided: true, collidedWith: obstacle };
      }
      
      // Special case for the pipe caps (Flappy Bird style obstacles)
      if (obstacle.type === ObstacleType.STATIC) {
        // Top pipe cap
        if (obstacle.y === 0) {
          const capHitbox = {
            x: obstacle.x - 16, // Cap extends 16px to the left of the pipe
            y: obstacle.y + obstacle.height - 8, // Cap is at the bottom of the top pipe
            width: obstacle.width + 32, // Cap extends 16px on both sides
            height: 10 // Cap height
          };
          
          if (checkCollision(characterHitbox, capHitbox)) {
            return { collided: true, collidedWith: obstacle };
          }
        } 
        // Bottom pipe cap
        else {
          const capHitbox = {
            x: obstacle.x - 16, // Cap extends 16px to the left of the pipe
            y: obstacle.y, // Cap is at the top of the bottom pipe
            width: obstacle.width + 32, // Cap extends 16px on both sides
            height: 10 // Cap height
          };
          
          if (checkCollision(characterHitbox, capHitbox)) {
            return { collided: true, collidedWith: obstacle };
          }
        }
      }
    }
    
    return { collided: false, collidedWith: null };
  }, []);

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
