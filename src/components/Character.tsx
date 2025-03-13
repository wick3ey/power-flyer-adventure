
import React, { useEffect, useState } from 'react';
import { PowerUpType } from '../utils/gameUtils';
import { Character } from '../hooks/useGameState';
import { motion } from 'framer-motion';

interface CharacterProps {
  character: Character;
  activePowerUps: PowerUpType[];
}

const CharacterComponent: React.FC<CharacterProps> = ({ character, activePowerUps }) => {
  const [animationState, setAnimationState] = useState<'idle' | 'jump' | 'hurt' | 'flap'>('idle');
  
  // Update animation state based on character state
  useEffect(() => {
    if (character.isHurt) {
      setAnimationState('hurt');
      // Reset hurt state after animation
      const timer = setTimeout(() => {
        setAnimationState(character.isJumping ? 'flap' : 'idle');
      }, 500);
      return () => clearTimeout(timer);
    } else if (character.isJumping) {
      setAnimationState('flap');
    } else {
      setAnimationState('idle');
    }
  }, [character.isJumping, character.isHurt]);

  // Get shield effect class if active
  const hasShield = activePowerUps.includes(PowerUpType.SHIELD);
  const hasSpeedBoost = activePowerUps.includes(PowerUpType.SPEED);

  // Bird flapping animation variants
  const flapVariants = {
    idle: { rotate: 0, y: [0, -3, 0], transition: { y: { repeat: Infinity, duration: 1.5 } } },
    flap: { 
      rotate: [-5, 15, -5], 
      y: [-8, -15, -8],
      transition: { 
        rotate: { duration: 0.3 },
        y: { duration: 0.3 }
      }
    },
    hurt: { 
      rotate: [-10, 10, -10, 10, 0], 
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="absolute z-10"
      style={{
        left: character.x,
        top: character.y,
        width: character.width,
        height: character.height,
      }}
      animate={animationState}
      variants={flapVariants}
    >
      {/* Character body */}
      <div className="relative w-full h-full">
        {/* Bird body */}
        <div 
          className={`absolute inset-0 rounded-full bg-game-primary shadow-lg
                     ${hasSpeedBoost ? 'animate-pulse-soft' : ''}`}
        >
          {/* Wings */}
          <div className={`absolute left-1 top-1/2 w-5 h-8 rounded-l-full bg-yellow-400 transform -translate-y-1/2 origin-right ${animationState === 'flap' ? 'animate-wing-flap' : ''}`}></div>
          
          {/* Eyes */}
          <div className="absolute top-1/4 left-2/3 w-6 h-6 rounded-full bg-white"></div>
          <div className="absolute top-1/4 left-2/3 w-3 h-3 rounded-full bg-black transform translate-x-1"></div>
          
          {/* Beak */}
          <div className="absolute top-[45%] left-[90%] w-6 h-4 bg-orange-500 transform -translate-y-1/2 rounded-r-md"></div>
          
          {/* Tail feathers */}
          <div className="absolute top-1/2 right-[85%] w-4 h-6 bg-blue-400 transform -translate-y-1/2 rounded-l-md"></div>
        </div>
        
        {/* Shield effect if active */}
        {hasShield && (
          <div className="absolute inset-0 rounded-full border-4 border-game-accent opacity-70 animate-pulse-soft scale-110"></div>
        )}
      </div>
      
      {/* Motion trail for flying */}
      {(animationState === 'flap' || hasSpeedBoost) && (
        <div className="absolute right-full top-1/2 transform -translate-y-1/2">
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${hasSpeedBoost ? 'bg-blue-400' : 'bg-white'} opacity-${10 - i * 2}`}
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.7 - (i * 0.2)
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CharacterComponent;
