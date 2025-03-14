
import React from 'react';
import { Play, Pause, RefreshCw, ArrowUp } from 'lucide-react';
import useSoundEffects from '../hooks/useSoundEffects';

interface GameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onJump: () => void;
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
  isMobile: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  isPaused,
  onJump,
  onPause,
  onStart,
  onReset,
  isMobile
}) => {
  const { playJumpSound } = useSoundEffects();
  
  // Skapa en wrapper-funktion som spelar ljudet och hoppar
  const handleJump = () => {
    playJumpSound(); // Spela hoppljud
    onJump(); // Anropa ursprunglig hoppfunktion
  };
  
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-20">
      {isPlaying ? (
        <>
          {/* Control buttons when game is active */}
          <button 
            onClick={onPause}
            className="game-icon-button"
            aria-label={isPaused ? "Resume game" : "Pause game"}
          >
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>
          
          {isMobile && (
            <button 
              onClick={handleJump}
              className="game-icon-button w-20 h-20" // Larger jump button for mobile
              aria-label="Jump"
            >
              <ArrowUp className="w-10 h-10" />
            </button>
          )}
          
          <button 
            onClick={onReset}
            className="game-icon-button"
            aria-label="Reset game"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </>
      ) : (
        /* Start button when game is not active */
        <button 
          onClick={onStart}
          className="game-button"
          aria-label="Start game"
        >
          <Play className="w-5 h-5 mr-2" />
          {isPaused ? "Resume" : "Start Game"}
        </button>
      )}
    </div>
  );
};

export default GameControls;
