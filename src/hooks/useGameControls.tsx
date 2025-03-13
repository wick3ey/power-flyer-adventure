
import { useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

interface GameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onJump: () => void;
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
}

const useGameControls = ({
  isPlaying,
  isPaused,
  onJump,
  onPause,
  onStart,
  onReset
}: GameControlsProps) => {
  const isMobile = useIsMobile();

  // Handle keyboard controls
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isPlaying) {
      // If game is not playing, space or enter starts the game
      if (event.code === 'Space' || event.code === 'Enter') {
        onStart();
      }
      return;
    }

    // Game controls when playing
    switch (event.code) {
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
        // Prevent default space action (page scroll)
        event.preventDefault();
        onJump();
        break;
      case 'Escape':
      case 'KeyP':
        onPause();
        break;
      case 'KeyR':
        onReset();
        break;
      default:
        break;
    }
  }, [isPlaying, onJump, onPause, onReset, onStart]);

  // Handle touch controls for mobile
  const handleTouchStart = useCallback(() => {
    if (!isPlaying) {
      onStart();
      return;
    }

    if (!isPaused) {
      onJump();
    }
  }, [isPlaying, isPaused, onJump, onStart]);

  useEffect(() => {
    // Set up keyboard event listeners
    window.addEventListener('keydown', handleKeyPress);

    // Set up touch event listeners for mobile
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [handleKeyPress, handleTouchStart, isMobile]);

  return {
    isMobile
  };
};

export default useGameControls;
