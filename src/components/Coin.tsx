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
      className="absolute z-10"
      style={{
        left: coin.x,
        top: coin.y,
        width: coin.width,
        height: coin.height,
      }}
      animate={{
        y: [0, -5, 0],
        rotateY: [0, 180, 360],
      }}
      transition={{
        y: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        },
        rotateY: {
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        },
      }}
    >
      <div className="w-full h-full relative">
        {/* Coin outer glow */}
        <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-30 animate-pulse" 
             style={{ transform: 'scale(1.2)' }} />
        
        {/* Coin body */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 border-2 border-yellow-600 shadow-lg">
          {/* Inner coin details */}
          <div className="absolute inset-2 rounded-full border-4 border-yellow-500/30" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200/80 to-transparent" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)' }} />
        </div>
        
        {/* Coin value */}
        <div className="absolute inset-0 flex items-center justify-center text-yellow-800 font-bold text-xs">
          {coin.value}
        </div>
      </div>
    </motion.div>
  );
};

export default Coin;
