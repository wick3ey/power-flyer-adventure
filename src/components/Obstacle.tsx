
import React from 'react';
import { Obstacle } from '../hooks/useGameState';
import { ObstacleType } from '../utils/gameUtils';
import { motion } from 'framer-motion';

interface ObstacleProps {
  obstacle: Obstacle;
}

const ObstacleComponent: React.FC<ObstacleProps> = ({ obstacle }) => {
  // Different styles and animations based on obstacle type
  const getObstacleClasses = () => {
    switch (obstacle.type) {
      case ObstacleType.STATIC:
        return 'bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-900'; // Green pipes like in Flappy Bird
      case ObstacleType.MOVING:
        return 'bg-gradient-to-b from-yellow-500 to-amber-700 border-2 border-amber-800';
      case ObstacleType.BREAKABLE:
        return `bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-blue-700 ${obstacle.isBreaking ? 'animate-pulse' : ''}`;
      case ObstacleType.ROTATING:
        return 'bg-gradient-to-b from-purple-500 to-purple-700 border-2 border-purple-800';
      default:
        return 'bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-900';
    }
  };

  // Base style properties
  const style: React.CSSProperties = {
    left: obstacle.x,
    top: obstacle.y,
    width: obstacle.width,
    height: obstacle.height,
    borderRadius: obstacle.type === ObstacleType.STATIC ? '8px' : '4px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3), inset 2px 0 rgba(255,255,255,0.2)'
  };

  // For Flappy Bird style pipes, we need a cap on top
  const isPipe = obstacle.type === ObstacleType.STATIC;
  
  // Visual indicator for obstacle hitbox - helps players understand the collision area
  const showHitbox = false; // Set to true for debugging

  return (
    <motion.div 
      className={`absolute ${getObstacleClasses()} shadow-lg overflow-visible`}
      style={style}
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Pipe cap for Flappy Bird style obstacles */}
      {isPipe && (
        <div className={`absolute -left-3 -right-3 h-8 
                        ${obstacle.y > 200 ? '-top-6' : 'top-full -mt-2'} 
                        bg-gradient-to-b from-green-500 to-green-700 
                        border-2 border-green-900 rounded-md z-10`}>
          <div className="absolute inset-1 bg-gradient-to-b from-green-400/20 to-green-900/30 rounded-sm"></div>
        </div>
      )}
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-white/10 to-black/20"></div>
      
      {/* Visual hitbox indicator for debugging */}
      {showHitbox && (
        <div className="absolute" style={{
          left: obstacle.width * 0.15,
          top: obstacle.height * 0.15,
          right: obstacle.width * 0.15,
          bottom: obstacle.height * 0.15,
          border: '1px dashed red',
          zIndex: 100,
          pointerEvents: 'none'
        }}></div>
      )}
      
      {/* Highlight on edges for better visibility */}
      <div className="absolute inset-0 border-l-2 border-t-2 border-white/10 rounded-sm"></div>
    </motion.div>
  );
};

export default ObstacleComponent;
