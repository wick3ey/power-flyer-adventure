
import React, { useEffect, useState } from 'react';
import { PowerUpType } from '../utils/gameUtils';
import { Character } from '../hooks/useGameState';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';

interface CharacterProps {
  character: Character;
  activePowerUps: PowerUpType[];
}

const CharacterComponent: React.FC<CharacterProps> = ({ character, activePowerUps }) => {
  const [animationState, setAnimationState] = useState<'idle' | 'jump' | 'hurt' | 'flap'>('idle');
  const [flapped, setFlapped] = useState(false);
  const isMobile = useIsMobile();
  
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

  // Animation variants
  const movementVariants = {
    idle: { 
      y: [0, -3, 0], 
      transition: { y: { repeat: Infinity, duration: 1.5 } } 
    },
    flap: { 
      y: [-12, -18, -12],
      transition: { 
        y: { duration: 0.2 }
      }
    },
    hurt: { 
      rotate: [-5, 5, -5, 5, 0], 
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  // Calculate rotation based on velocity for realistic flight
  const velocityMultiplier = character.velocityY < 0 ? 1 : 2; 
  const rotation = character.velocityY < 0 
    ? Math.max(-15, character.velocityY * velocityMultiplier) 
    : Math.min(30, character.velocityY * velocityMultiplier);  

  // Show the character's hitbox to help players understand collision area
  const showHitbox = true;
  
  // Scale for mobile devices
  const sizeMultiplier = isMobile ? 0.7 : 1;
  const characterWidth = character.width * sizeMultiplier;
  const characterHeight = character.height * sizeMultiplier;
  
  return (
    <motion.div 
      className="absolute z-20"
      style={{
        left: character.x,
        top: character.y,
        width: characterWidth,
        height: characterHeight,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
      animate={animationState}
      variants={movementVariants}
    >
      <div className="relative w-full h-full">
        {/* Trump Character Container - scaled down to fit game */}
        <div className="relative w-full h-full scale-[0.6] origin-center">
          {/* Hair Back */}
          <div className="absolute w-[80%] h-[20%] bg-[#ffcc00] rounded-t-[20px] top-[15%] left-[10%] z-[1] rotate-[5deg]"></div>
          
          {/* Hair Side */}
          <div className="absolute w-[20%] h-[60%] bg-[#ffcc00] top-[30%] left-[10%] z-[1] -rotate-[10deg]"></div>
          
          {/* Head */}
          <div className="absolute w-[70%] h-[60%] bg-[#ffdbac] rounded-[35px] top-[25%] left-[15%] shadow-md z-[2]"></div>
          
          {/* Hair Front */}
          <div className="absolute w-[80%] h-[40%] bg-[#ffcc00] rounded-t-[40px] top-[10%] left-[10%] z-[3] -rotate-[5deg] shadow-inner"></div>
          
          {/* Hair Top */}
          <div className="absolute w-[80%] h-[30%] bg-[#ffcc00] rounded-t-[50px] top-[5%] left-[10%] z-[4] -rotate-[2deg]"></div>
          
          {/* Face Elements */}
          <div className="absolute w-[70%] h-[60%] top-[25%] left-[15%] z-[5]">
            {/* Eyebrows */}
            <div className="absolute w-[15%] h-[4%] bg-[#ffcc00] top-[30%] left-[20%] rounded-[2.5px] -rotate-[10deg]"></div>
            <div className="absolute w-[15%] h-[4%] bg-[#ffcc00] top-[30%] right-[20%] rounded-[2.5px] rotate-[10deg]"></div>
            
            {/* Eyes */}
            <div className="absolute w-[12.5%] h-[6%] bg-white top-[38%] left-[20%] rounded-full border border-gray-400">
              <div className="absolute w-[40%] h-[83%] bg-[#1c77c3] rounded-full top-[8%] left-[32%]">
                <div className="absolute w-[40%] h-[40%] bg-black rounded-full top-[30%] left-[30%]"></div>
              </div>
            </div>
            <div className="absolute w-[12.5%] h-[6%] bg-white top-[38%] right-[20%] rounded-full border border-gray-400">
              <div className="absolute w-[40%] h-[83%] bg-[#1c77c3] rounded-full top-[8%] left-[32%]">
                <div className="absolute w-[40%] h-[40%] bg-black rounded-full top-[30%] left-[30%]"></div>
              </div>
            </div>
            
            {/* Nose */}
            <div className="absolute w-[15%] h-[20%] bg-[#ffdbac] rounded-[15px] top-[43%] left-[42.5%] shadow-md"></div>
            
            {/* Mouth */}
            <div className="absolute w-[30%] h-[12.5%] bg-white top-[70%] left-[35%] rounded-b-[15px] border border-gray-300 overflow-hidden">
              <div className="absolute w-[100%] h-[60%] bg-[#ffccab] rounded-t-[14.5px] bottom-0 left-0"></div>
            </div>
          </div>
          
          {/* Body */}
          <div className={`absolute w-[50%] h-[60%] bg-[#14213d] rounded-[25px] bottom-0 left-[25%] z-[1] shadow-lg
                          ${hasSpeedBoost ? 'animate-pulse-soft' : ''}`}></div>
          
          {/* Shirt */}
          <div className="absolute w-[25%] h-[40%] bg-white bottom-[10%] left-[37.5%] rounded-t-[10px] z-[2]"></div>
          
          {/* Tie */}
          <div className="absolute w-[10%] h-[35%] bg-[#e63946] bottom-[15%] left-[45%] z-[3]" 
               style={{clipPath: "polygon(0 0, 100% 0, 80% 50%, 100% 100%, 50% 85%, 0 100%, 20% 50%)"}}></div>
        </div>
        
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
      
      {/* Motion trail for flying */}
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
      
      {/* Jump effect particles */}
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
