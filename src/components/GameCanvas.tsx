
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import CharacterComponent from './Character';
import ObstacleComponent from './Obstacle';
import PowerUpComponent from './PowerUp';
import { GameState } from '../hooks/useGameState';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Flappy Bird style gradient sky background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-500 z-0"></div>
      
      {/* Parallax background layers */}
      
      {/* Clouds - Far background */}
      <motion.div 
        className="absolute inset-0 z-1"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-20 left-1/4 w-40 h-16 rounded-full bg-white opacity-80"></div>
        <div className="absolute top-10 left-1/2 w-56 h-20 rounded-full bg-white opacity-80"></div>
        <div className="absolute top-40 left-3/4 w-32 h-14 rounded-full bg-white opacity-70"></div>
        <div className="absolute top-60 left-1/3 w-48 h-18 rounded-full bg-white opacity-80"></div>
        <div className="absolute top-30 left-[85%] w-60 h-20 rounded-full bg-white opacity-70"></div>
        
        {/* Duplicate clouds for seamless loop */}
        <div className="absolute top-20 left-[125%] w-40 h-16 rounded-full bg-white opacity-80"></div>
        <div className="absolute top-10 left-[150%] w-56 h-20 rounded-full bg-white opacity-80"></div>
        <div className="absolute top-40 left-[175%] w-32 h-14 rounded-full bg-white opacity-70"></div>
        <div className="absolute top-60 left-[133%] w-48 h-18 rounded-full bg-white opacity-80"></div>
        <div className="absolute top-30 left-[185%] w-60 h-20 rounded-full bg-white opacity-70"></div>
      </motion.div>
      
      {/* Hills - Middle background */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-40 z-2"
        animate={{ x: [0, -800] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute bottom-0 left-0 w-96 h-32 rounded-t-full bg-green-600 opacity-90"></div>
        <div className="absolute bottom-0 left-64 w-80 h-28 rounded-t-full bg-green-700 opacity-90"></div>
        <div className="absolute bottom-0 left-[30rem] w-96 h-36 rounded-t-full bg-green-800 opacity-90"></div>
        <div className="absolute bottom-0 left-[50rem] w-80 h-30 rounded-t-full bg-green-700 opacity-90"></div>
        
        {/* Duplicate hills for seamless loop */}
        <div className="absolute bottom-0 left-[70rem] w-96 h-32 rounded-t-full bg-green-600 opacity-90"></div>
        <div className="absolute bottom-0 left-[86rem] w-80 h-28 rounded-t-full bg-green-700 opacity-90"></div>
        <div className="absolute bottom-0 left-[100rem] w-96 h-36 rounded-t-full bg-green-800 opacity-90"></div>
        <div className="absolute bottom-0 left-[120rem] w-80 h-30 rounded-t-full bg-green-700 opacity-90"></div>
      </motion.div>
      
      {/* Ground */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-green-500 to-green-800 z-3"
        animate={{ x: [0, -500] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Ground details - grass tufts */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute top-0 w-3 h-5 bg-green-400"
            style={{ 
              left: `${i * 5 + Math.random() * 2}%`,
              height: `${4 + Math.random() * 4}px`,
              borderRadius: '2px 2px 0 0'
            }}
          ></div>
        ))}
        
        {/* Ground pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute bottom-0 h-3 bg-green-900"
              style={{ 
                left: `${i * 8}%`,
                width: '3%',
                borderRadius: '2px 2px 0 0'
              }}
            ></div>
          ))}
        </div>
      </motion.div>
      
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
      
      {/* Score counter */}
      {gameState.isPlaying && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50">
          <div className="text-6xl font-bold text-white text-shadow-lg">{gameState.score}</div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
