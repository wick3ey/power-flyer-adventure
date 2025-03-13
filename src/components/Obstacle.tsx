import React from 'react';
import { Obstacle } from '../hooks/useGameState';
import { ObstacleType } from '../utils/gameUtils';

interface ObstacleProps {
  obstacle: Obstacle;
}

const ObstacleComponent: React.FC<ObstacleProps> = ({ obstacle }) => {
  // Different styles and animations based on obstacle type
  const getObstacleClasses = () => {
    switch (obstacle.type) {
      case ObstacleType.STATIC:
        return 'bg-game-danger shadow-lg';
      case ObstacleType.MOVING:
        return 'bg-game-warning shadow-lg obstacle-move';
      case ObstacleType.BREAKABLE:
        return `bg-game-secondary shadow-lg ${obstacle.isBreaking ? 'animate-pulse' : ''}`;
      case ObstacleType.ROTATING:
        return 'bg-game-info shadow-lg';
      default:
        return 'bg-game-danger shadow-lg';
    }
  };

  // Apply rotation if needed
  const style: React.CSSProperties = {
    left: obstacle.x,
    top: obstacle.y,
    width: obstacle.width,
    height: obstacle.height,
    transform: obstacle.rotation ? `rotate(${obstacle.rotation}deg)` : undefined,
    transition: 'transform 0.1s ease-out'
  };

  return (
    <div 
      className={`absolute rounded-lg ${getObstacleClasses()}`}
      style={style}
    >
      {/* Health indicator for breakable obstacles */}
      {obstacle.type === ObstacleType.BREAKABLE && obstacle.health !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white"
              style={{ width: `${(obstacle.health / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObstacleComponent;
