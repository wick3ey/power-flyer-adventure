
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
        return 'bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-900'; // Red dangerous pipes
      case ObstacleType.MOVING:
        return 'bg-gradient-to-b from-orange-500 to-red-700 border-2 border-red-800';
      case ObstacleType.BREAKABLE:
        return `bg-gradient-to-b from-purple-600 to-purple-800 border-2 border-purple-900 ${obstacle.isBreaking ? 'animate-pulse' : ''}`;
      case ObstacleType.ROTATING:
        return 'bg-gradient-to-b from-magenta-500 to-purple-700 border-2 border-purple-800';
      default:
        return 'bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-900';
    }
  };

  // Base style properties with improved visibility and danger appearance
  const style: React.CSSProperties = {
    left: obstacle.x,
    top: obstacle.y,
    width: obstacle.width,
    height: obstacle.height,
    borderRadius: obstacle.type === ObstacleType.STATIC ? '6px' : '4px',
    boxShadow: '0 4px 20px rgba(255,0,0,0.6), inset 2px 0 rgba(255,0,0,0.3)'
  };

  // For Flappy Bird style pipes, we need a cap on top
  const isPipe = obstacle.type === ObstacleType.STATIC;
  
  // No visual indicator for obstacle hitbox - entire object is dangerous
  const showHitbox = false;

  return (
    <motion.div 
      className={`absolute ${getObstacleClasses()} shadow-lg overflow-visible z-10`}
      style={style}
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Pipe cap for Flappy Bird style obstacles - now also dangerous */}
      {isPipe && (
        <div className={`absolute -left-4 -right-4 h-10 
                        ${obstacle.y > 200 ? '-top-8' : 'top-full -mt-2'} 
                        bg-gradient-to-b from-red-500 to-red-700 
                        border-2 border-red-900 rounded-md z-10`}>
          <div className="absolute inset-1 bg-gradient-to-b from-red-400/20 to-red-900/30 rounded-sm"></div>
        </div>
      )}
      
      {/* Inner shadow for depth - more dangerous looking */}
      <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-white/20 to-black/20"></div>
      
      {/* Surface pattern to add texture - danger indicators */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute h-1 bg-black/60"
            style={{ 
              left: '0',
              right: '0',
              top: `${(i + 1) * 20}%`,
            }}
          ></div>
        ))}
      </div>
      
      {/* Highlight on edges for better visibility */}
      <div className="absolute inset-0 border-l-2 border-t-2 border-red-400/30 rounded-sm"></div>
      
      {/* Warning glow effect to indicate danger */}
      <div className="absolute inset-0 animate-pulse" 
           style={{ 
             boxShadow: 'inset 0 0 15px rgba(255,0,0,0.3)',
             animation: 'pulse 2s infinite' 
           }}>
      </div>
    </motion.div>
  );
};

export default ObstacleComponent;
