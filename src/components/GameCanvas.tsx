
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Character from './Character';
import Obstacle from './Obstacle';
import PowerUp from './PowerUp';
import Coin from './Coin';
import { GameState } from '../hooks/useGameState';

interface GameCanvasProps {
  gameState: GameState;
}

// Backgrounds for different levels
const backgroundsUrls = [
  'photo-1488590528505-98d2b5aba04b', // Tech scene
  'photo-1518770660439-4636190af475', // Circuit board
  'photo-1461749280684-dccba630e2f6', // Programming
  'photo-1486312338219-ce68d2c6f44d', // Computer
  'photo-1526374965328-7f61d2c18c5', // Matrix
];

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  // Get the current background based on the backgroundId
  const backgroundImageId = (gameState.backgroundId - 1) % backgroundsUrls.length;
  const backgroundUrl = `https://images.unsplash.com/${backgroundsUrls[backgroundImageId]}?auto=format&fit=crop`;
  
  // Create memoized backgrounds to prevent re-renders
  const backgroundLayers = useMemo(() => {
    return (
      <>
        {/* Sky/backdrop layer - use changing backgrounds based on level */}
        <div 
          className="absolute inset-0 bg-cover bg-center backdrop-blur-md"
          style={{ 
            backgroundImage: `url(${backgroundUrl})`,
            filter: 'brightness(0.5) contrast(1.2) saturate(1.2)'
          }}
        />
        
        {/* Dark gradient overlay for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-purple-900/40 to-black/50 z-10" />
        
        {/* Animated particles for "crypto" atmosphere */}
        <div className="absolute inset-0 z-20">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full bg-white/20 animate-pulse-soft"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Abstract crypto grid lines */}
        <div className="absolute inset-0 z-20 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`grid-${i}`}
              className="absolute bg-blue-400/10 backdrop-blur-sm"
              style={{
                height: '1px',
                width: '100%',
                top: `${i * 5}%`,
                transform: `translateY(${Math.sin(i) * 50}px)`,
                boxShadow: '0 0 15px rgba(0, 100, 255, 0.5)'
              }}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`vertical-grid-${i}`}
              className="absolute bg-blue-400/10 backdrop-blur-sm"
              style={{
                width: '1px',
                height: '100%',
                left: `${i * 5}%`,
                transform: `translateX(${Math.sin(i) * 50}px)`,
                boxShadow: '0 0 15px rgba(0, 100, 255, 0.5)'
              }}
            />
          ))}
        </div>
      </>
    );
  }, [backgroundUrl]);
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-indigo-900">
      {backgroundLayers}
      
      {/* Game elements */}
      <div className="relative z-30 w-full h-full">
        {/* Character */}
        <Character
          x={gameState.character.x}
          y={gameState.character.y}
          width={gameState.character.width}
          height={gameState.character.height}
          isJumping={gameState.character.isJumping}
          hasShield={gameState.character.hasShield}
          isHurt={gameState.character.isHurt}
          rotation={gameState.character.velocityY * 2} // Rotate based on velocity
        />
        
        {/* Obstacles */}
        {gameState.obstacles.map(obstacle => (
          <Obstacle
            key={obstacle.id}
            type={obstacle.type}
            x={obstacle.x}
            y={obstacle.y}
            width={obstacle.width}
            height={obstacle.height}
            rotation={obstacle.rotation}
            isBreaking={obstacle.isBreaking}
          />
        ))}
        
        {/* Power-ups */}
        {gameState.powerUps.map(powerUp => (
          <PowerUp
            key={powerUp.id}
            type={powerUp.type}
            x={powerUp.x}
            y={powerUp.y}
            width={powerUp.width}
            height={powerUp.height}
            isCollected={powerUp.isCollected}
          />
        ))}
        
        {/* Collectibles */}
        {gameState.collectibles.map(collectible => !collectible.isCollected && (
          <Coin
            key={collectible.id}
            x={collectible.x}
            y={collectible.y}
            width={collectible.width}
            height={collectible.height}
            value={collectible.value}
          />
        ))}
        
        {/* Level up effect */}
        {gameState.score > 0 && gameState.lastLevelUpScore === gameState.score && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
          >
            <div className="text-6xl font-extrabold text-white text-shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LEVEL UP!
            </div>
          </motion.div>
        )}
        
        {/* Speed up effect */}
        {gameState.score > 0 && gameState.lastSpeedUpScore === gameState.score && gameState.lastLevelUpScore !== gameState.score && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="text-4xl font-bold text-white text-shadow-lg">
              Speed Up! 💨
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
