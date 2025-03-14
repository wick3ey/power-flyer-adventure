
import { useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';
import useSoundEffects from './useSoundEffects';

interface GameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  onJump: () => void;
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
}

const useGameControls = ({
  isPlaying,
  isPaused,
  isGameOver,
  onJump,
  onPause,
  onStart,
  onReset
}: GameControlsProps) => {
  const isMobile = useIsMobile();
  const { playJumpSound } = useSoundEffects();

  // Wrapper for jump function that plays sound
  const handleJump = useCallback(() => {
    playJumpSound();
    onJump();
  }, [onJump, playJumpSound]);

  // Setup keyboard controls
  const setupKeyboardControls = useCallback(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
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
          handleJump();
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
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, handleJump, onPause, onReset, onStart]);

  // Setup touch controls for mobile
  const setupTouchControls = useCallback(() => {
    if (!isMobile) return () => {};

    const handleTouchStart = () => {
      if (!isPlaying) {
        onStart();
        return;
      }

      if (!isPaused) {
        handleJump();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, [isPlaying, isPaused, handleJump, onStart, isMobile]);

  // Cleanup all event listeners
  const cleanupControls = useCallback(() => {
    // This will be called when the component unmounts
    // The actual cleanup happens in the returned functions from setupKeyboardControls and setupTouchControls
  }, []);

  useEffect(() => {
    const keyboardCleanup = setupKeyboardControls();
    const touchCleanup = setupTouchControls();

    return () => {
      keyboardCleanup();
      touchCleanup();
      cleanupControls();
    };
  }, [setupKeyboardControls, setupTouchControls, cleanupControls]);

  return {
    isMobile,
    setupKeyboardControls,
    setupTouchControls,
    cleanupControls
  };
};

export default useGameControls;
