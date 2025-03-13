
import React, { useRef, useEffect } from 'react';
import CharacterComponent from './Character';
import ObstacleComponent from './Obstacle';
import PowerUpComponent from './PowerUp';
import { GameState } from '../hooks/useGameState';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Set up animation frame for game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // Game logic would be handled in the useGameState hook
    // This component just renders the current state
  }, [gameState.isPlaying, gameState.isPaused]);

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-blue-200 to-blue-400"
    >
      {/* Game background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-blue-400 z-0"></div>
      
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-game-secondary/90 z-1"></div>
      
      {/* Render game elements */}
      {gameState.obstacles.map((obstacle) => (
        <ObstacleComponent key={obstacle.id} obstacle={obstacle} />
      ))}
      
      {gameState.powerUps.map((powerUp) => (
        <PowerUpComponent key={powerUp.id} powerUp={powerUp} />
      ))}
      
      {/* Render character */}
      <CharacterComponent 
        character={gameState.character}
        activePowerUps={gameState.activePowerUps}
      />
    </div>
  );
};

export default GameCanvas;
