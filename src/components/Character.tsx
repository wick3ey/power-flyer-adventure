
import React, { useEffect, useState } from 'react';
import { PowerUpType } from '../utils/gameUtils';
import { Character } from '../hooks/useGameState';
import { motion } from 'framer-motion';
import { CharacterType } from './CharacterSelection';

interface CharacterProps {
  character: Character;
  activePowerUps: PowerUpType[];
  characterType?: CharacterType;
}

const CharacterComponent: React.FC<CharacterProps> = ({ 
  character, 
  activePowerUps,
  characterType = 'bird'
}) => {
  const [animationState, setAnimationState] = useState<'idle' | 'jump' | 'hurt' | 'flap'>('idle');
  const [flapped, setFlapped] = useState(false);
  
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
      setFlapped(true);
      
      // Reset flap animation after a short time to allow for repeated jumps
      const timer = setTimeout(() => {
        setFlapped(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('idle');
    }
  }, [character.isJumping, character.isHurt, character.velocityY]);

  // Get shield effect class if active
  const hasShield = activePowerUps.includes(PowerUpType.SHIELD);
  const hasSpeedBoost = activePowerUps.includes(PowerUpType.SPEED);

  // Bird flapping animation variants - now more dynamic and responsive
  const flapVariants = {
    idle: { 
      rotate: 0, 
      y: [0, -3, 0], 
      transition: { y: { repeat: Infinity, duration: 1.5 } } 
    },
    flap: { 
      rotate: [-5, 10, -5], 
      y: [-12, -18, -12],
      transition: { 
        rotate: { duration: 0.2 },
        y: { duration: 0.2 }
      }
    },
    hurt: { 
      rotate: [-10, 10, -10, 10, 0], 
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  // Calculate rotation based on velocity for realistic flight - more responsive now
  const velocityMultiplier = character.velocityY < 0 ? 2 : 3.5; // More dramatic falling rotation
  const rotation = character.velocityY < 0 
    ? Math.max(-25, character.velocityY * velocityMultiplier) // Rotate up when rising (limited to -25deg)
    : Math.min(80, character.velocityY * velocityMultiplier);  // Rotate down when falling (up to 80deg)

  // Show the character's hitbox to help players understand collision area
  const showHitbox = true;
  
  return (
    <motion.div 
      className="absolute z-20"
      style={{
        left: character.x,
        top: character.y,
        width: character.width,
        height: character.height,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
      animate={animationState}
      variants={flapVariants}
    >
      {/* Character body based on selected character type */}
      <div className="relative w-full h-full">
        {characterType === 'bird' ? (
          /* Bird character */
          <div 
            className={`absolute inset-0 rounded-full bg-yellow-500 shadow-lg
                      ${hasSpeedBoost ? 'animate-pulse-soft' : ''}`}
          >
            {/* Wings */}
            <div 
              className={`absolute left-1 top-1/2 w-5 h-8 rounded-l-full bg-yellow-400 transform -translate-y-1/2 origin-right 
                        ${flapped ? 'animate-wing-flap' : ''}`}
              style={{ 
                transformStyle: 'preserve-3d',
              }}
            ></div>
            
            {/* Eyes */}
            <div className="absolute top-1/4 left-2/3 w-6 h-6 rounded-full bg-white"></div>
            <div className="absolute top-1/4 left-2/3 w-3 h-3 rounded-full bg-black transform translate-x-1"></div>
            
            {/* Beak */}
            <div className="absolute top-[45%] left-[90%] w-6 h-4 bg-orange-500 transform -translate-y-1/2 rounded-r-md"></div>
            
            {/* Tail feathers */}
            <div className="absolute top-1/2 right-[85%] w-4 h-6 bg-yellow-400 transform -translate-y-1/2 rounded-l-md"></div>
            
            {/* Body details - feather texture */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute h-3 bg-yellow-600/30 rounded-full"
                  style={{ 
                    width: '140%',
                    left: '-20%',
                    top: `${i * 20 + 10}%`,
                    transform: `rotate(${i * 5}deg)`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        ) : (
          /* Trump character */
          <div className="absolute inset-0">
            {/* Trump head */}
            <div className="absolute inset-0 rounded-full bg-[#f9c7a1] shadow-lg">
              {/* Hair */}
              <div className="absolute top-[-15%] left-[-10%] w-[120%] h-[60%] bg-[#f7d794] rounded-t-[80%] skew-x-[-10deg]"></div>
              
              {/* Eyebrows */}
              <div className="absolute top-[20%] left-[15%] w-[30%] h-[8%] bg-[#d4a017] rounded-full transform rotate-[15deg]"></div>
              <div className="absolute top-[20%] right-[15%] w-[30%] h-[8%] bg-[#d4a017] rounded-full transform rotate-[-15deg]"></div>
              
              {/* Eyes */}
              <div className="absolute top-[30%] left-[25%] w-[20%] h-[10%] bg-white rounded-full">
                <div className="absolute top-[50%] left-[50%] w-[40%] h-[40%] bg-[#4682b4] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              <div className="absolute top-[30%] right-[25%] w-[20%] h-[10%] bg-white rounded-full">
                <div className="absolute top-[50%] left-[50%] w-[40%] h-[40%] bg-[#4682b4] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Nose */}
              <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[20%] h-[20%] bg-[#e89b6b] rounded-[20%_20%_50%_50%]"></div>
              
              {/* Mouth */}
              <div className="absolute top-[65%] left-[50%] transform -translate-x-1/2 w-[40%] h-[10%] bg-[#d9534f] rounded-[10px_10px_50%_50%]">
                <div className="absolute top-[25%] left-[50%] transform -translate-x-1/2 w-[70%] h-[40%] bg-white rounded-[5px]"></div>
              </div>
              
              {/* Suit (visible below the head) */}
              <div className="absolute top-[90%] left-0 right-0 h-[40%] bg-[#1a252f]">
                {/* Red tie */}
                <div className="absolute top-0 left-[50%] transform -translate-x-1/2 w-[30%] h-[100%] bg-red-600 clip-path-[polygon(20%_0,_80%_0,_100%_100%,_0%_100%)]"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Hitbox visualization */}
        {showHitbox && (
          <div className="absolute" style={{
            left: character.width * 0.25,
            top: character.height * 0.25,
            right: character.width * 0.25, 
            bottom: character.height * 0.25,
            border: '2px dashed rgba(50, 200, 50, 0.6)',
            borderRadius: '50%',
            zIndex: 9,
            pointerEvents: 'none'
          }}></div>
        )}
        
        {/* Shield effect if active */}
        {hasShield && (
          <div className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-70 animate-pulse-soft scale-110"></div>
        )}
      </div>
      
      {/* Motion trail for flying - now more dynamic and responsive */}
      {(animationState === 'flap' || hasSpeedBoost) && (
        <div className="absolute right-full top-1/2 transform -translate-y-1/2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${hasSpeedBoost ? 'bg-blue-400' : 'bg-white'} opacity-${10 - i * 2}`}
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.8 - (i * 0.2),
                  transform: `translateY(${Math.sin(i) * 3}px)`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
      
      {/* Jump effect particles - only shows briefly when jumping */}
      {character.isJumping && flapped && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/40"
              style={{
                width: `${4 - i * 0.5}px`,
                height: `${4 - i * 0.5}px`,
                bottom: `${i * 4}px`,
                left: `${Math.sin(i * 2) * 8}px`,
                opacity: 1 - (i * 0.15),
                animation: 'particleFade 0.5s forwards',
              }}
            ></div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CharacterComponent;
