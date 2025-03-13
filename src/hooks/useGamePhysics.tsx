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
  gravity: 0.7,
  jumpForce: -12,
  maxVelocityY: 18,
  groundY: 480,
  worldWidth: 800,
  worldHeight: 600,
  gameSpeed: 2.5,
};

const useGamePhysics = (config: Partial<PhysicsConfig> = {}) => {
  const physicsConfig: PhysicsConfig = { ...defaultConfig, ...config };

  const updateCharacterPhysics = useCallback((character: Character): Character => {
    let velocityY = character.velocityY + physicsConfig.gravity;
    velocityY = clamp(velocityY, -physicsConfig.maxVelocityY, physicsConfig.maxVelocityY);
    let y = character.y + velocityY;
    if (y < 0) {
      y = 0;
      velocityY = Math.abs(velocityY * 0.5);
    }
    const isOnGround = y >= physicsConfig.groundY - character.height;
    if (isOnGround) {
      y = physicsConfig.groundY - character.height;
      velocityY = 0;
    }
    return {
      ...character,
      y,
      velocityY,
      isJumping: true,
    };
  }, [physicsConfig]);

  const jump = useCallback((character: Character): Character => {
    return {
      ...character,
      velocityY: physicsConfig.jumpForce,
      isJumping: true,
    };
  }, [physicsConfig.jumpForce]);

  const generateFlappyObstacles = useCallback((worldWidth: number, worldHeight: number) => {
    const gapSize = 160;
    const gapPosition = Math.random() * (worldHeight - gapSize - 200) + 100;
    const topPipe: Obstacle = {
      id: `pipe-top-${Date.now()}`,
      type: 'static',
      x: worldWidth,
      y: 0,
      width: 80,
      height: gapPosition,
      speed: physicsConfig.gameSpeed,
    };
    const bottomPipe: Obstacle = {
      id: `pipe-bottom-${Date.now()}`,
      type: 'static',
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
    if (obstacle.type === 'static' && obstacle.y === 0) {
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
