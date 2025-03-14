
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CharacterType } from '../components/CharacterSelection';

interface GameContextProps {
  selectedCharacter: CharacterType;
  setSelectedCharacter: (character: CharacterType) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('bird');

  return (
    <GameContext.Provider value={{ selectedCharacter, setSelectedCharacter }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextProps => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
