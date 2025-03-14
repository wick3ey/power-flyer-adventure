
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
  
  // Wrapper function that plays sound and jumps
  const handleJump = () => {
    playJumpSound(); // Play jump sound
    onJump(); // Call original jump function
  };
  
  return (
    <div className="flex justify-center items-center gap-4 z-20">
      {isPlaying ? (
        <>
          {/* Control buttons when game is active */}
          <button 
            onClick={onPause}
            className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
            aria-label={isPaused ? "Resume game" : "Pause game"}
          >
            {isPaused ? <Play className="w-6 h-6 text-blue-600" /> : <Pause className="w-6 h-6 text-blue-600" />}
          </button>
          
          {isMobile && (
            <button 
              onClick={handleJump}
              className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg" // Larger jump button for mobile
              aria-label="Jump"
            >
              <ArrowUp className="w-10 h-10 text-white" />
            </button>
          )}
          
          <button 
            onClick={onReset}
            className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
            aria-label="Reset game"
          >
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </button>
        </>
      ) : (
        /* Start button when game is not active */
        <button 
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors shadow-lg"
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
