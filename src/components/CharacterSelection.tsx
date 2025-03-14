
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export type CharacterType = 'bird' | 'trump';

interface CharacterSelectionProps {
  selectedCharacter: CharacterType;
  onSelectCharacter: (character: CharacterType) => void;
  onClose: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  selectedCharacter,
  onSelectCharacter,
  onClose
}) => {
  const [currentCharacter, setCurrentCharacter] = useState<CharacterType>(selectedCharacter);
  
  const characters: CharacterType[] = ['bird', 'trump'];
  
  const handleNext = () => {
    const currentIndex = characters.indexOf(currentCharacter);
    const nextIndex = (currentIndex + 1) % characters.length;
    setCurrentCharacter(characters[nextIndex]);
  };
  
  const handlePrevious = () => {
    const currentIndex = characters.indexOf(currentCharacter);
    const previousIndex = (currentIndex - 1 + characters.length) % characters.length;
    setCurrentCharacter(characters[previousIndex]);
  };
  
  const handleConfirm = () => {
    onSelectCharacter(currentCharacter);
    onClose();
  };
  
  return (
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
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Character</h2>
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handlePrevious}
            className="game-icon-button"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="relative w-64 h-64 bg-gradient-to-b from-blue-400/30 to-purple-500/30 rounded-xl flex items-center justify-center overflow-hidden">
            {currentCharacter === 'bird' ? (
              <div className="w-40 h-40 rounded-full bg-yellow-500 flex items-center justify-center relative">
                {/* Bird character visualization */}
                <div className="absolute w-6 h-6 rounded-full bg-white top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute w-3 h-3 rounded-full bg-black top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="absolute w-8 h-4 bg-orange-500 top-1/2 left-[80%] transform -translate-y-1/2 rounded-r-md"></div>
                <div className="absolute left-0 top-1/2 w-6 h-8 rounded-l-full bg-yellow-400 transform -translate-y-1/2 origin-right"></div>
              </div>
            ) : (
              <div className="trump-character relative w-full h-full">
                {/* Trump head */}
                <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[140px] h-[170px] bg-gradient-to-b from-[#f9c7a1] to-[#e89b6b] rounded-[50%_50%_45%_45%_/_60%_60%_40%_40%] z-10"></div>
                
                {/* Trump hair */}
                <div className="absolute top-[5%] left-[50%] transform -translate-x-1/2 w-[120px] h-[100px] bg-gradient-to-r from-[#f7d794] to-[#e6b800] rounded-t-full skew-x-[-10deg] z-20"></div>
                
                {/* Eyebrows */}
                <div className="absolute top-[25%] left-[35%] w-[40px] h-[12px] bg-[#d4a017] rounded-full transform rotate-[15deg] z-20"></div>
                <div className="absolute top-[25%] right-[35%] w-[40px] h-[12px] bg-[#d4a017] rounded-full transform rotate-[-15deg] z-20"></div>
                
                {/* Eyes */}
                <div className="absolute top-[32%] left-[38%] w-[25px] h-[15px] bg-white rounded-full z-20">
                  <div className="absolute top-[50%] left-[50%] w-[8px] h-[8px] bg-[#4682b4] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="absolute top-[32%] right-[38%] w-[25px] h-[15px] bg-white rounded-full z-20">
                  <div className="absolute top-[50%] left-[50%] w-[8px] h-[8px] bg-[#4682b4] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                {/* Nose */}
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[25px] h-[40px] bg-[#e89b6b] rounded-[20%_20%_50%_50%] z-20"></div>
                
                {/* Mouth */}
                <div className="absolute top-[55%] left-[50%] transform -translate-x-1/2 w-[50px] h-[20px] bg-[#d9534f] rounded-[10px_10px_50%_50%] z-20">
                  <div className="absolute top-[4px] left-[50%] transform -translate-x-1/2 w-[35px] h-[8px] bg-white rounded-[5px]"></div>
                </div>
                
                {/* Suit */}
                <div className="absolute top-[65%] left-[50%] transform -translate-x-1/2 w-[150px] h-[100px] bg-[#1a252f] rounded-t-[10px] z-0">
                  <div className="absolute top-0 left-[50%] transform -translate-x-1/2 w-[100px] h-[80px] bg-white clip-path-[polygon(0_0,_100%_0,_80%_100%,_20%_100%)]"></div>
                </div>
                
                {/* Tie */}
                <div className="absolute top-[70%] left-[50%] transform -translate-x-1/2 w-[60px] h-[80px] bg-red-600 clip-path-[polygon(20%_0,_80%_0,_100%_100%,_0%_100%)] z-10"></div>
              </div>
            )}
            
            {/* Selected indicator */}
            <div className="absolute top-4 right-4">
              {currentCharacter === selectedCharacter && (
                <div className="bg-green-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleNext}
            className="game-icon-button"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {currentCharacter === 'bird' ? 'Flappy Bird' : 'Donald Trump'}
          </h3>
          <p className="text-sm text-gray-200">
            {currentCharacter === 'bird' 
              ? 'The classic character that started it all!' 
              : 'Make your game great again!'}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="game-button-secondary flex-1"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleConfirm}
            className="game-button flex-1"
          >
            {currentCharacter === selectedCharacter ? 'Confirm' : 'Select'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CharacterSelection;
