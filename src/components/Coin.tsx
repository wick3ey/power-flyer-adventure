
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
      {/* New coin design using CSS */}
      <div className="relative w-full h-full rounded-full bg-[#f7d14c] shadow-[0_0_0_3px_#fff,0_0_0_4px_#000] flex justify-center items-center overflow-hidden">
        {/* Inner circle border */}
        <div className="absolute w-[95%] h-[95%] rounded-full border-2 border-black"></div>
        
        {/* Right side gradient pattern */}
        <div className="absolute right-0 w-[12.5%] h-full opacity-80"
             style={{
               background: 'repeating-linear-gradient(90deg, transparent, #e6b800 2px, #f7d14c 4px, #f7d14c 6px)'
             }}
        ></div>
        
        {/* Logo with 3 bars */}
        <div className="flex flex-col justify-center items-center gap-1 w-[60%]">
          <div className="w-full h-[10%] bg-white relative shadow"
               style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}>
            <div className="absolute inset-0"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 51%, rgba(255,255,255,0) 100%)'
                 }}
            ></div>
          </div>
          <div className="w-full h-[10%] bg-white relative shadow ml-1"
               style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}>
            <div className="absolute inset-0"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 51%, rgba(255,255,255,0) 100%)'
                 }}
            ></div>
          </div>
          <div className="w-full h-[10%] bg-white relative shadow"
               style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}>
            <div className="absolute inset-0"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 51%, rgba(255,255,255,0) 100%)'
                 }}
            ></div>
          </div>
        </div>
        
        {/* Glowing effect */}
        <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 blur-sm -z-10 animate-pulse"></div>
      </div>
    </motion.div>
  );
};

export default Coin;
