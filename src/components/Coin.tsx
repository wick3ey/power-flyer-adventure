
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
      className="absolute z-20 pointer-events-auto cursor-pointer"
      style={{
        left: coin.x,
        top: coin.y,
        width: coin.width,
        height: coin.height,
      }}
      onClick={handleCollect}
      // Enhanced animations for better visibility
      animate={{
        rotateY: [0, 360],
        scale: [1, 1.1, 1],
        y: [coin.y - 5, coin.y + 5, coin.y - 5]
      }}
      transition={{
        rotateY: {
          repeat: Infinity,
          duration: 1.5,
          ease: "linear"
        },
        scale: {
          repeat: Infinity,
          duration: 1.2,
          ease: "easeInOut"
        },
        y: {
          repeat: Infinity,
          duration: 1.8,
          ease: "easeInOut"
        }
      }}
      whileHover={{ scale: 1.3 }}
    >
      <div className="w-full h-full relative">
        {/* Gold coin with shadow and glow effect */}
        <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-70 animate-pulse" 
             style={{ filter: 'blur(4px)' }} />
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-yellow-200 flex items-center justify-center text-yellow-800 font-bold shadow-lg"
             style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.7)' }}>
          $
        </div>
      </div>
    </motion.div>
  );
};

export default Coin;
