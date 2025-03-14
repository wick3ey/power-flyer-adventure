
import React from 'react';
import { motion } from 'framer-motion';
import { Collectible } from '../hooks/useGameState';
import { playCoinSound } from '../utils/soundUtils';

interface CoinProps {
  coin: Collectible;
  onCollect?: (coin: Collectible) => void;
}

const Coin: React.FC<CoinProps> = ({ coin, onCollect }) => {
  // Return null if the coin is already collected
  if (coin.isCollected) return null;
  
  // Play collection animation and trigger onCollect callback
  const handleCollect = () => {
    if (onCollect) {
      // Play the coin sound using our utility
      playCoinSound();
      
      // Call the collect callback
      onCollect(coin);
    }
  };
  
  return (
    <motion.div
      className="absolute z-10 pointer-events-auto cursor-pointer"
      style={{
        left: coin.x,
        top: coin.y,
        width: coin.width,
        height: coin.height,
      }}
      onClick={handleCollect}
      // Add more dynamic animation variants
      animate={{
        rotateY: [0, 360],
        scale: [1, 1.05, 1],
        y: [coin.y - 5, coin.y + 5, coin.y - 5]
      }}
      transition={{
        rotateY: {
          repeat: Infinity,
          duration: 2,
          ease: "linear"
        },
        scale: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        },
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }}
      whileHover={{ scale: 1.2 }}
    >
      <img 
        src="/lovable-uploads/9601a71e-a663-49ec-8571-be688805f4c7.png" 
        alt="Coin"
        className="w-full h-full object-contain"
        style={{ filter: 'drop-shadow(0px 0px 8px rgba(255, 215, 0, 0.7))' }}
      />
    </motion.div>
  );
};

export default Coin;
