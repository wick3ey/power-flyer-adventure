
import { useRef, useCallback } from 'react';

// Hook för att hantera alla ljudeffekter i spelet
const useSoundEffects = () => {
  // Använd refs för att bevara ljudobjekt mellan renderingar
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialisera ljudfilerna första gången
  if (typeof window !== 'undefined') {
    if (!jumpSoundRef.current) {
      jumpSoundRef.current = new Audio('/sounds/jump.mp3');
    }
    
    if (!coinSoundRef.current) {
      coinSoundRef.current = new Audio('/sounds/coin.mp3');
    }
  }
  
  // Spela upp hoppljud
  const playJumpSound = useCallback(() => {
    if (jumpSoundRef.current) {
      // Återställ ljudet om det redan spelas
      jumpSoundRef.current.pause();
      jumpSoundRef.current.currentTime = 0;
      
      // Spela upp ljudet
      jumpSoundRef.current.play().catch(error => {
        console.warn('Could not play jump sound:', error);
      });
    }
  }, []);
  
  // Spela upp coin/mynt ljud
  const playCoinSound = useCallback(() => {
    if (coinSoundRef.current) {
      // Återställ ljudet om det redan spelas
      coinSoundRef.current.pause();
      coinSoundRef.current.currentTime = 0;
      
      // Spela upp ljudet
      coinSoundRef.current.play().catch(error => {
        console.warn('Could not play coin sound:', error);
      });
    }
  }, []);
  
  return {
    playJumpSound,
    playCoinSound
  };
};

export default useSoundEffects;
