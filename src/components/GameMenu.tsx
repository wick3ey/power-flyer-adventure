
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Award, Info, Settings, X, User } from 'lucide-react';
import CharacterSelection, { CharacterType } from './CharacterSelection';

interface GameMenuProps {
  onStart: () => void;
  onSelectLevel: () => void;
  onShowTutorial: () => void;
  onShowSettings: () => void;
  highScore: number;
  selectedCharacter?: CharacterType;
  onSelectCharacter?: (character: CharacterType) => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  onStart,
  onSelectLevel,
  onShowTutorial,
  onShowSettings,
  highScore,
  selectedCharacter = 'bird',
  onSelectCharacter = () => {}
}) => {
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);

  return (
    <>
      <motion.div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-500/90 to-purple-600/90 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="w-full max-w-md game-card"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="text-center mb-8">
            <div className="chip mb-2">Flappy Bird meets Angry Birds</div>
            <h1 className="text-4xl font-bold text-game-dark mb-2">POWER</h1>
            <p className="text-gray-500">The ultimate web-based gaming experience</p>
            
            {highScore > 0 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <Award className="w-5 h-5 text-game-warning" />
                <span className="font-medium">High Score: {highScore}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={onStart}
              className="game-button w-full"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </button>
            
            <button 
              onClick={() => setShowCharacterSelection(true)}
              className="game-button-secondary w-full"
            >
              <User className="w-5 h-5 mr-2" />
              Select Character
            </button>
            
            <button 
              onClick={onSelectLevel}
              className="game-button-secondary w-full"
            >
              <Award className="w-5 h-5 mr-2" />
              Select Level
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={onShowTutorial}
                className="game-icon-button flex-1"
                aria-label="Tutorial"
              >
                <Info className="w-5 h-5" />
              </button>
              
              <button 
                onClick={onShowSettings}
                className="game-icon-button flex-1" 
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {showCharacterSelection && (
        <CharacterSelection 
          selectedCharacter={selectedCharacter}
          onSelectCharacter={onSelectCharacter}
          onClose={() => setShowCharacterSelection(false)}
        />
      )}
    </>
  );
};

export default GameMenu;
