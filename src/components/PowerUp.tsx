
import React from 'react';
import { PowerUp, PowerUpType } from '../hooks/useGameState';
import { Shield, Zap, Magnet, Clock } from 'lucide-react';

interface PowerUpProps {
  powerUp: PowerUp;
}

const PowerUpComponent: React.FC<PowerUpProps> = ({ powerUp }) => {
  if (powerUp.isCollected) return null;

  // Determine icon and color based on power-up type
  const getPowerUpContent = () => {
    switch (powerUp.type) {
      case PowerUpType.SHIELD:
        return {
          icon: <Shield className="w-6 h-6 text-white" />,
          bgColor: 'bg-blue-500'
        };
      case PowerUpType.SPEED:
        return {
          icon: <Zap className="w-6 h-6 text-white" />,
          bgColor: 'bg-yellow-500'
        };
      case PowerUpType.MAGNET:
        return {
          icon: <Magnet className="w-6 h-6 text-white" />,
          bgColor: 'bg-purple-500'
        };
      case PowerUpType.SLOW_TIME:
        return {
          icon: <Clock className="w-6 h-6 text-white" />,
          bgColor: 'bg-cyan-500'
        };
      default:
        return {
          icon: <Shield className="w-6 h-6 text-white" />,
          bgColor: 'bg-blue-500'
        };
    }
  };

  const { icon, bgColor } = getPowerUpContent();

  return (
    <div 
      className={`absolute powerup-float rounded-full ${bgColor} shadow-lg 
                  flex items-center justify-center transform-gpu`}
      style={{
        left: powerUp.x,
        top: powerUp.y,
        width: powerUp.width,
        height: powerUp.height,
        zIndex: 5
      }}
    >
      {icon}
      <div className="absolute inset-0 rounded-full border-2 border-white opacity-50 animate-pulse"></div>
    </div>
  );
};

export default PowerUpComponent;
