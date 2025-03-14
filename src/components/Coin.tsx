
import React from 'react';
import { motion } from 'framer-motion';
import { Collectible } from '../hooks/useGameState';

interface CoinProps {
  coin: Collectible;
}

const Coin: React.FC<CoinProps> = ({ coin }) => {
  if (coin.isCollected) return null;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: coin.x,
        top: coin.y,
        width: coin.width,
        height: coin.height,
        zIndex: 10,
      }}
      animate={{
        rotate: [0, 360],
        y: [0, -5, 0],
      }}
      transition={{
        rotate: {
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        },
        y: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {/* Crypto coin image - dogecoin style */}
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden">
          <span className="text-xs font-bold text-yellow-800">
            MOON
          </span>
        </div>
        
        {/* Outer ring animation */}
        <div className="absolute inset-0 rounded-full border-2 border-yellow-300 animate-pulse"></div>
        
        {/* Inner $ symbol */}
        <div className="absolute inset-0 flex items-center justify-center text-yellow-800 font-bold">
          $
        </div>
      </div>
      
      {/* Glowing effect */}
      <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 blur-md -z-10 animate-pulse"></div>
      
      {/* Crypto value text */}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-blue-500 px-1 rounded-md shadow-lg">
        +{coin.value}
      </div>
    </motion.div>
  );
};

export default Coin;
