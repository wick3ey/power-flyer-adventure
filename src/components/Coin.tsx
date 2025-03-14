
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Collectible } from '../hooks/useGameState';

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
      // Play the coin collection sound
      const coinSound = new Audio('/coin-sound.mp3');
      coinSound.volume = 0.3; // Set volume to 30%
      coinSound.play().catch(err => console.error("Error playing coin sound:", err));
      
      // Call the collect callback
      onCollect(coin);
    }
  };
  
  // Check if the coin should be collected based on collision with the character
  useEffect(() => {
    // This effect is just for potential future expansion
    // The actual collection logic is in Game.tsx
  }, [coin]);
  
  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: coin.x,
        top: coin.y,
        width: coin.width,
        height: coin.height,
      }}
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
      onAnimationComplete={handleCollect}
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
