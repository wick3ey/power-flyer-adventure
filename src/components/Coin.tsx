
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
        rotateY: [0, 360],
        scale: [1, 1.05, 1]
      }}
      transition={{
        rotateY: {
          repeat: Infinity,
          duration: 2,
          ease: "linear"
        },
        scale: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }}
    >
      <img 
        src="/lovable-uploads/e1749e2c-979e-4a6e-aefc-649394ba9a3c.png" 
        alt="Coin"
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
};

export default Coin;
