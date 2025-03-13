
import React from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Star, Lock } from 'lucide-react';
import { GameLevel, DifficultyLevel } from '../hooks/useGameState';

interface LevelSelectProps {
  levels: GameLevel[];
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
  currentLevel: number;
}

const LevelSelect: React.FC<LevelSelectProps> = ({
  levels,
  onSelectLevel,
  onClose,
  currentLevel
}) => {
  // Group levels by difficulty
  const easyLevels = levels.filter(level => level.difficulty === DifficultyLevel.EASY);
  const mediumLevels = levels.filter(level => level.difficulty === DifficultyLevel.MEDIUM);
  const hardLevels = levels.filter(level => level.difficulty === DifficultyLevel.HARD);
  const expertLevels = levels.filter(level => level.difficulty === DifficultyLevel.EXPERT);

  // Get difficulty color
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'bg-green-100 text-green-800';
      case DifficultyLevel.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case DifficultyLevel.HARD:
        return 'bg-orange-100 text-orange-800';
      case DifficultyLevel.EXPERT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Render a level card
  const renderLevelCard = (level: GameLevel) => {
    // Determine if the level is locked
    // For simplicity, a level is locked if all previous levels are not completed
    // Except for the first level which is always unlocked
    const isLocked = level.id !== 1 && !levels.find(l => l.id === level.id - 1)?.isCompleted;

    return (
      <motion.div 
        key={level.id}
        className={`game-card relative overflow-hidden ${isLocked ? 'opacity-60' : ''}`}
        whileHover={!isLocked ? { scale: 1.05 } : {}}
        whileTap={!isLocked ? { scale: 0.98 } : {}}
        onClick={() => !isLocked && onSelectLevel(level.id)}
      >
        <div className="chip mb-2">
          Level {level.id}
        </div>
        <h3 className="text-lg font-semibold mb-1">{level.name}</h3>
        
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(level.difficulty)} mb-3`}>
          {level.difficulty}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star 
                key={i}
                className={`w-5 h-5 ${i < level.stars ? 'text-game-warning fill-game-warning' : 'text-gray-300'}`}
              />
            ))}
          </div>
          
          {level.isCompleted && (
            <span className="text-sm text-green-600 font-medium">Completed</span>
          )}
        </div>
        
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
            <Lock className="w-8 h-8 text-white" />
          </div>
        )}
        
        {level.id === currentLevel && (
          <div className="absolute -top-1 -right-1 bg-game-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            ✓
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Select Level</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Level sections by difficulty */}
        {easyLevels.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-green-600 mb-3">Easy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {easyLevels.map(renderLevelCard)}
            </div>
          </div>
        )}
        
        {mediumLevels.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-yellow-600 mb-3">Medium</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mediumLevels.map(renderLevelCard)}
            </div>
          </div>
        )}
        
        {hardLevels.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-orange-600 mb-3">Hard</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hardLevels.map(renderLevelCard)}
            </div>
          </div>
        )}
        
        {expertLevels.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-red-600 mb-3">Expert</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {expertLevels.map(renderLevelCard)}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <button 
            onClick={onClose}
            className="game-button"
          >
            Back to Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LevelSelect;
