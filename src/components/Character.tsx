
import React, { useEffect, useState } from 'react';
import { PowerUpType } from '../utils/gameUtils';
import { Character } from '../hooks/useGameState';

interface CharacterProps {
  character: Character;
  activePowerUps: PowerUpType[];
}

const CharacterComponent: React.FC<CharacterProps> = ({ character, activePowerUps }) => {
  const [animationState, setAnimationState] = useState<'idle' | 'jump' | 'hurt'>('idle');
  
  // Update animation state based on character state
  useEffect(() => {
    if (character.isHurt) {
      setAnimationState('hurt');
      // Reset hurt state after animation
      const timer = setTimeout(() => {
        setAnimationState('idle');
      }, 500);
      return () => clearTimeout(timer);
    } else if (character.isJumping) {
      setAnimationState('jump');
    } else {
      setAnimationState('idle');
    }
  }, [character.isJumping, character.isHurt]);

  // Get shield effect class if active
  const hasShield = activePowerUps.includes(PowerUpType.SHIELD);
  const hasSpeedBoost = activePowerUps.includes(PowerUpType.SPEED);

  return (
    <div 
      className={`absolute ${animationState === 'idle' ? 'character-idle' : ''} 
                 ${animationState === 'jump' ? 'character-jump' : ''} 
                 ${animationState === 'hurt' ? 'character-hurt' : ''} 
                 transition-all duration-300 ease-game-bounce`}
      style={{
        left: character.x,
        top: character.y,
        width: character.width,
        height: character.height,
        zIndex: 10
      }}
    >
      {/* Character body */}
      <div className="relative w-full h-full">
        {/* Basic character shape */}
        <div 
          className={`absolute inset-0 rounded-full bg-game-primary shadow-lg
                     ${hasSpeedBoost ? 'animate-pulse-soft' : ''}`}
        >
          {/* Face */}
          <div className="absolute top-1/4 left-1/2 w-6 h-6 rounded-full bg-white transform -translate-x-1/2"></div>
          <div className="absolute top-1/4 left-1/2 w-4 h-4 rounded-full bg-game-dark transform -translate-x-1/2"></div>
        </div>
        
        {/* Shield effect if active */}
        {hasShield && (
          <div className="absolute inset-0 rounded-full border-4 border-game-accent opacity-70 animate-pulse-soft scale-110"></div>
        )}
      </div>
    </div>
  );
};

export default CharacterComponent;
