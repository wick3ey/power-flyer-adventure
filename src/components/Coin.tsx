
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
      <img 
        src="/lovable-uploads/87d0d465-179c-48b8-a9e1-69abbd3176e1.png" 
        alt="Coin"
        className="w-full h-full object-contain"
      />
      
      {/* Glowing effect */}
      <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 blur-sm -z-10 animate-pulse"></div>
    </motion.div>
  );
};

export default Coin;
