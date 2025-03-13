
import { useCallback } from 'react';
import { Character, Obstacle, PowerUp, Collectible } from './useGameState';
import { checkCollision, clamp, lerp } from '../utils/gameUtils';

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
  gravity: 0.5,
  jumpForce: -10,
  maxVelocityY: 15,
  groundY: 400,
  worldWidth: 800,
  worldHeight: 500,
  gameSpeed: 1,
};

const useGamePhysics = (config: Partial<PhysicsConfig> = {}) => {
  // Merge default config with user config
  const physicsConfig: PhysicsConfig = { ...defaultConfig, ...config };

  // Update character physics
  const updateCharacterPhysics = useCallback((character: Character): Character => {
    // Apply gravity
    let velocityY = character.velocityY + physicsConfig.gravity;
    
    // Clamp velocity to prevent excessive speed
    velocityY = clamp(velocityY, -physicsConfig.maxVelocityY, physicsConfig.maxVelocityY);
    
    // Update position
    let y = character.y + velocityY;
    
    // Check ground collision
    const isOnGround = y >= physicsConfig.groundY - character.height;
    if (isOnGround) {
      y = physicsConfig.groundY - character.height;
      velocityY = 0;
    }
    
    return {
      ...character,
      y,
      velocityY,
      isJumping: !isOnGround,
    };
  }, [physicsConfig]);

  // Apply jump force
  const jump = useCallback((character: Character): Character => {
    // Only jump if on the ground
    if (!character.isJumping) {
      return {
        ...character,
        velocityY: physicsConfig.jumpForce,
        isJumping: true,
      };
    }
    return character;
  }, [physicsConfig.jumpForce]);

  // Update obstacle physics
  const updateObstaclePhysics = useCallback((obstacle: Obstacle): Obstacle => {
    // Move obstacle based on its speed and game speed
    const x = obstacle.x - obstacle.speed * physicsConfig.gameSpeed;
    
    // For rotating obstacles, update rotation
    const rotation = obstacle.rotation !== undefined 
      ? (obstacle.rotation + 1) % 360 
      : undefined;
    
    return {
      ...obstacle,
      x,
      rotation,
    };
  }, [physicsConfig.gameSpeed]);

  // Check collisions between character and obstacles
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

  // Check collisions between character and power-ups
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

  // Check collisions between character and collectibles
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

  // Apply physics to breakable obstacles when hit
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
    checkPowerUpCollisions,
    checkCollectibleCollisions,
    applyBreakablePhysics,
  };
};

export default useGamePhysics;
