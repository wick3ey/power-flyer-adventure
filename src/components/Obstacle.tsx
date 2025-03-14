
import React from 'react';
import { Obstacle } from '../hooks/useGameState';
import { ObstacleType } from '../utils/gameUtils';

interface ObstacleProps {
  obstacle: Obstacle;
}

const ObstacleComponent: React.FC<ObstacleProps> = ({ obstacle }) => {
  // Different styles based on obstacle type - no animations
  const getObstacleClasses = () => {
    switch (obstacle.type) {
      case ObstacleType.STATIC:
        return 'bg-gradient-to-b from-red-700 to-red-900 border-2 border-red-950'; // Darker, more solid pipes
      case ObstacleType.MOVING:
        return 'bg-gradient-to-b from-orange-600 to-red-800 border-2 border-red-950';
      case ObstacleType.BREAKABLE:
        return 'bg-gradient-to-b from-purple-700 to-purple-900 border-2 border-purple-950';
      case ObstacleType.ROTATING:
        return 'bg-gradient-to-b from-magenta-600 to-purple-800 border-2 border-purple-950';
      default:
        return 'bg-gradient-to-b from-red-700 to-red-900 border-2 border-red-950';
    }
  };

  // Base style properties with solid appearance
  const style: React.CSSProperties = {
    left: obstacle.x,
    top: obstacle.y,
    width: obstacle.width,
    height: obstacle.height,
    borderRadius: obstacle.type === ObstacleType.STATIC ? '4px' : '3px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
  };

  // For Flappy Bird style pipes, we need a cap on top
  const isPipe = obstacle.type === ObstacleType.STATIC;
  
  return (
    <div 
      className={`absolute ${getObstacleClasses()} shadow-lg z-10`}
      style={style}
    >
      {/* Pipe cap for Flappy Bird style obstacles - solid, no animations */}
      {isPipe && (
        <div className={`absolute -left-3 -right-3 h-8
                      ${obstacle.y > 200 ? '-top-8' : 'top-full -mt-2'} 
                      bg-gradient-to-b from-red-600 to-red-800 
                      border-2 border-red-950 rounded-md z-10`}
             style={{
               boxShadow: '0 0 5px rgba(0,0,0,0.5)',
             }}
        >
          {/* Subtle inner highlight for cap - not animated */}
          <div className="absolute inset-1 bg-gradient-to-b from-red-500/20 to-red-900/30 rounded-sm"></div>
        </div>
      )}
      
      {/* Static inner elements for depth without animations */}
      <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-white/5 to-black/10"></div>
      
      {/* Surface pattern to add texture - static */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute h-1 bg-black/80"
            style={{ 
              left: '0',
              right: '0',
              top: `${(i + 1) * 25}%`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ObstacleComponent;
