
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Award, Info, Settings } from 'lucide-react';

interface GameMenuProps {
  onStart: () => void;
  onSelectLevel: () => void;
  onShowTutorial: () => void;
  onShowSettings: () => void;
  highScore: number;
}

const GameMenu: React.FC<GameMenuProps> = ({
  onStart,
  onSelectLevel,
  onShowTutorial,
  onShowSettings,
  highScore
}) => {
  return (
    <motion.div 
      className="w-full max-w-md game-card bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-2">Flappy Bird meets Angry Birds</div>
        <h1 className="text-4xl font-bold text-blue-800 mb-2">POWER</h1>
        <p className="text-gray-500">The ultimate web-based gaming experience</p>
        
        {highScore > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">High Score: {highScore}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={onStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Game
        </button>
        
        <button 
          onClick={onSelectLevel}
          className="w-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
        >
          <Award className="w-5 h-5 mr-2" />
          Select Level
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={onShowTutorial}
            className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Tutorial"
          >
            <Info className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onShowSettings}
            className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors" 
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameMenu;
