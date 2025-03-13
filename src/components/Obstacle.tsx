
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
        return 'bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-900';
      case ObstacleType.MOVING:
        return 'bg-gradient-to-b from-yellow-500 to-amber-700 border-2 border-amber-800';
      case ObstacleType.BREAKABLE:
        return `bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-blue-700 ${obstacle.isBreaking ? 'animate-pulse' : ''}`;
      case ObstacleType.ROTATING:
        return 'bg-gradient-to-b from-purple-500 to-purple-700 border-2 border-purple-800';
      default:
        return 'bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-900';
    }
  };

  // Get animation variants based on obstacle type
  const getAnimationVariants = () => {
    switch (obstacle.type) {
      case ObstacleType.MOVING:
        return {
          animate: {
            y: [0, -30, 0],
            transition: { 
              y: { repeat: Infinity, duration: 2, ease: "easeInOut" } 
            }
          }
        };
      case ObstacleType.ROTATING:
        return {
          animate: {
            rotate: [0, 360],
            transition: { 
              rotate: { repeat: Infinity, duration: 3, ease: "linear" }
            }
          }
        };
      case ObstacleType.BREAKABLE:
        return {
          animate: obstacle.isBreaking 
            ? {
                scale: [1, 0.8, 0],
                opacity: [1, 0.8, 0],
                transition: { duration: 0.5 }
              }
            : {}
        };
      default:
        return {};
    }
  };

  // Apply specific styles based on obstacle type
  const getAdditionalStyles = () => {
    if (obstacle.type === ObstacleType.STATIC || obstacle.type === ObstacleType.MOVING) {
      // Flappy bird style pipe obstacles
      return {
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3), inset 2px 0 rgba(255,255,255,0.2)'
      };
    }
    return {};
  };

  // Base style properties
  const style: React.CSSProperties = {
    left: obstacle.x,
    top: obstacle.y,
    width: obstacle.width,
    height: obstacle.height,
    ...getAdditionalStyles()
  };

  const animationVariants = getAnimationVariants();

  return (
    <motion.div 
      className={`absolute ${getObstacleClasses()} shadow-lg`}
      style={style}
      animate={animationVariants.animate}
    >
      {/* Details for the obstacle based on type */}
      {obstacle.type === ObstacleType.STATIC && (
        <div className="absolute inset-2 rounded-sm bg-gradient-to-b from-transparent to-red-900/30"></div>
      )}
      
      {/* Add spikes for static obstacles */}
      {obstacle.type === ObstacleType.STATIC && (
        <div className="absolute -top-2 left-0 right-0 flex justify-around">
          {[...Array(Math.floor(obstacle.width / 10))].map((_, i) => (
            <div key={i} className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-900"></div>
          ))}
        </div>
      )}
      
      {/* Health indicator for breakable obstacles */}
      {obstacle.type === ObstacleType.BREAKABLE && obstacle.health !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3 bg-blue-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white"
              style={{ width: `${(obstacle.health / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Rotating obstacle details */}
      {obstacle.type === ObstacleType.ROTATING && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 rounded-full bg-purple-300"></div>
          <div className="absolute inset-2 rounded-full border-4 border-dashed border-purple-300 opacity-50"></div>
        </div>
      )}
    </motion.div>
  );
};

export default ObstacleComponent;
