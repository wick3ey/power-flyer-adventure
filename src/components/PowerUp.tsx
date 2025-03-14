import React from 'react';
import { PowerUp } from '../hooks/useGameState';
import { PowerUpType } from '../utils/gameUtils';
import { Shield, Zap, Magnet, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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
          icon: <Shield className="w-7 h-7 text-white stroke-[2.5]" />,
          bgColor: 'bg-blue-500',
          glow: 'shadow-blue-400',
          particles: 'bg-blue-300'
        };
      case PowerUpType.SPEED:
        return {
          icon: <Zap className="w-7 h-7 text-white stroke-[2.5]" />,
          bgColor: 'bg-yellow-500',
          glow: 'shadow-yellow-400',
          particles: 'bg-yellow-300'
        };
      case PowerUpType.MAGNET:
        return {
          icon: <Magnet className="w-7 h-7 text-white stroke-[2.5]" />,
          bgColor: 'bg-purple-500',
          glow: 'shadow-purple-400',
          particles: 'bg-purple-300'
        };
      case PowerUpType.SLOW_TIME:
        return {
          icon: <Clock className="w-7 h-7 text-white stroke-[2.5]" />,
          bgColor: 'bg-cyan-500',
          glow: 'shadow-cyan-400',
          particles: 'bg-cyan-300'
        };
      default:
        return {
          icon: <Shield className="w-7 h-7 text-white stroke-[2.5]" />,
          bgColor: 'bg-blue-500',
          glow: 'shadow-blue-400',
          particles: 'bg-blue-300'
        };
    }
  };

  const { icon, bgColor, glow, particles } = getPowerUpContent();
  
  return (
    <motion.div 
      className={`absolute rounded-full ${bgColor} shadow-lg shadow-${glow} 
                  flex items-center justify-center transform-gpu z-5`}
      style={{
        left: powerUp.x,
        top: powerUp.y,
        width: powerUp.width,
        height: powerUp.height,
      }}
      animate={{
        y: [0, -10, 0],
        scale: [1, 1.05, 1],
        boxShadow: [
          `0 0 10px rgba(255,255,255,0.5)`,
          `0 0 20px rgba(255,255,255,0.7)`,
          `0 0 10px rgba(255,255,255,0.5)`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Power-up icon */}
      {icon}
      
      {/* Pulsing border effect */}
      <div className="absolute inset-0 rounded-full border-4 border-white opacity-50 animate-pulse"></div>
      
      {/* Particle effects */}
      <div className="absolute">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${particles}`}
            initial={{ opacity: 0.8, x: 0, y: 0 }}
            animate={{
              opacity: [0.8, 0],
              x: [0, (i % 2 === 0 ? 20 : -20) * Math.sin(i * 60 * Math.PI / 180)],
              y: [0, -20 * Math.cos(i * 60 * Math.PI / 180)]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PowerUpComponent;
