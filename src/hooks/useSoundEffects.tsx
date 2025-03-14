
import { useRef, useCallback } from 'react';

// Hook för att hantera alla ljudeffekter i spelet
const useSoundEffects = () => {
  // Använd refs för att bevara ljudobjekt mellan renderingar
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialisera ljudfilen första gången
  if (typeof window !== 'undefined' && !jumpSoundRef.current) {
    jumpSoundRef.current = new Audio('/sounds/jump.mp3');
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
  
  return {
    playJumpSound
  };
};

export default useSoundEffects;
