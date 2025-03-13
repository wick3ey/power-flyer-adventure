
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
    borderRadius: obstacle.type === ObstacleType.STATIC ? '4px' : '3px',
    boxShadow: '0 4px 20px rgba(255,0,0,0.6), inset 0px 0px 15px rgba(255,0,0,0.4)'
  };

  // For Flappy Bird style pipes, we need a cap on top
  const isPipe = obstacle.type === ObstacleType.STATIC;
  
  // Enhanced danger glow animation to emphasize the obstacle is deadly
  const dangerGlowAnimation = {
    opacity: [0.6, 1, 0.6],
    boxShadow: [
      '0 0 10px rgba(255,0,0,0.6)',
      '0 0 20px rgba(255,0,0,0.8)',
      '0 0 10px rgba(255,0,0,0.6)'
    ]
  };

  return (
    <motion.div 
      className={`absolute ${getObstacleClasses()} shadow-lg overflow-visible z-10`}
      style={style}
      initial={{ opacity: 0.5, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        ...dangerGlowAnimation
      }}
      transition={{ 
        duration: 0.3,
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {/* Pipe cap for Flappy Bird style obstacles - now also dangerous with enhanced visuals */}
      {isPipe && (
        <div className={`absolute -left-3 -right-3 h-8
                        ${obstacle.y > 200 ? '-top-8' : 'top-full -mt-2'} 
                        bg-gradient-to-b from-red-500 to-red-700 
                        border-2 border-red-900 rounded-md z-10`}
             style={{
               boxShadow: '0 0 10px rgba(255,0,0,0.5)',
             }}
        >
          {/* Inner highlight for cap */}
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
      
      {/* Subtle glow effect for better visibility */}
      <div className="absolute inset-0 bg-red-500/10 animate-pulse" 
           style={{ 
             animation: 'pulse 2s infinite',
             borderRadius: 'inherit'
           }}>
      </div>
    </motion.div>
  );
};

export default ObstacleComponent;
