
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterComponent from './Character';
import ObstacleComponent from './Obstacle';
import PowerUpComponent from './PowerUp';
import Coin from './Coin';
import { GameState } from '../hooks/useGameState';

// Background themes with more professional, detailed settings
const BACKGROUNDS = [
  {
    id: 1,
    sky: "from-sky-400 to-blue-600",
    clouds: "bg-white",
    hills: ["bg-green-600", "bg-green-700", "bg-green-800"],
    ground: "from-green-500 to-green-800",
    groundDetails: ["bg-green-400", "bg-green-300"],
    particles: []
  },
  {
    id: 2,
    sky: "from-amber-300 to-orange-600",
    clouds: "bg-white/70",
    hills: ["bg-amber-700", "bg-amber-800", "bg-amber-900"],
    ground: "from-amber-600 to-amber-900",
    groundDetails: ["bg-amber-500", "bg-amber-400"],
    particles: ["dust"]
  },
  {
    id: 3,
    sky: "from-indigo-400 to-purple-700",
    clouds: "bg-white/60",
    hills: ["bg-indigo-800", "bg-indigo-900", "bg-purple-900"],
    ground: "from-indigo-800 to-purple-900",
    groundDetails: ["bg-indigo-700", "bg-indigo-600"],
    particles: ["stars"]
  },
  {
    id: 4,
    sky: "from-emerald-400 to-teal-700",
    clouds: "bg-white/80",
    hills: ["bg-emerald-700", "bg-emerald-800", "bg-teal-900"],
    ground: "from-emerald-600 to-teal-900",
    groundDetails: ["bg-emerald-500", "bg-emerald-400"],
    particles: ["leaves"]
  },
  {
    id: 5,
    sky: "from-rose-400 to-pink-700",
    clouds: "bg-white/70",
    hills: ["bg-rose-700", "bg-rose-800", "bg-pink-900"],
    ground: "from-rose-600 to-pink-900",
    groundDetails: ["bg-rose-500", "bg-rose-400"],
    particles: ["petals"]
  }
];

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentBackground, setCurrentBackground] = useState(BACKGROUNDS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Update background when level changes
  useEffect(() => {
    const level = gameState.level || 1;
    const backgroundIndex = Math.min(level - 1, BACKGROUNDS.length - 1);
    
    if (gameState.isPlaying && currentBackground.id !== level) {
      setIsTransitioning(true);
      
      // Short delay for smooth transition
      setTimeout(() => {
        setCurrentBackground(BACKGROUNDS[backgroundIndex]);
        setIsTransitioning(false);
      }, 500);
    } else if (!gameState.isPlaying && level === 1) {
      // Reset background to level 1 when game restarts
      setCurrentBackground(BACKGROUNDS[0]);
    }
  }, [gameState.level, gameState.isPlaying]);

  // Memoize particle effects to prevent rerenders
  const StarParticles = useMemo(() => {
    if (!currentBackground.particles.includes('stars')) return null;
    
    return (
      <div className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div 
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-pulse-soft"
            style={{ 
              top: `${Math.random() * 80}%`, 
              left: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              opacity: 0.5 + Math.random() * 0.5,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    );
  }, [currentBackground.particles]);
  
  // Memoize leaves/petals effects
  const FloatingItems = useMemo(() => {
    if (!currentBackground.particles.includes('leaves') && !currentBackground.particles.includes('petals')) return null;
    
    const isPetals = currentBackground.particles.includes('petals');
    const itemColor = isPetals ? "bg-pink-200" : "bg-green-200";
    
    return (
      <div className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div 
            key={`float-${i}`}
            className={`absolute ${isPetals ? "rounded-full" : "rounded-sm"} ${itemColor} opacity-80`}
            style={{ 
              width: isPetals ? `${5 + Math.random() * 5}px` : `${3 + Math.random() * 4}px`,
              height: isPetals ? `${5 + Math.random() * 5}px` : `${5 + Math.random() * 7}px`,
            }}
            initial={{ 
              top: `${-10 - Math.random() * 10}%`, 
              left: `${Math.random() * 100}%`,
              rotate: 0
            }}
            animate={{ 
              top: "110%", 
              left: `${Math.random() * 100}%`,
              rotate: 360
            }}
            transition={{ 
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>
    );
  }, [currentBackground.particles]);
  
  // Memoize dust particles effect
  const DustParticles = useMemo(() => {
    if (!currentBackground.particles.includes('dust')) return null;
    
    return (
      <div className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={`dust-${i}`}
            className="absolute rounded-full bg-amber-100 opacity-40"
            style={{ 
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
            initial={{ 
              top: `${30 + Math.random() * 50}%`, 
              left: "-5%",
            }}
            animate={{ 
              top: `${20 + Math.random() * 60}%`, 
              left: "105%",
            }}
            transition={{ 
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>
    );
  }, [currentBackground.particles]);

  // Memoize cloud formations for better performance
  const Clouds = useMemo(() => {
    return (
      <motion.div 
        className="absolute inset-0 z-1 will-change-transform"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear", repeatType: "loop" }}
      >
        <div className="absolute top-0 left-0 right-0 h-full">
          {/* Main cloud formations */}
          <div className={`absolute top-20 left-1/4 w-40 h-16 rounded-full ${currentBackground.clouds} opacity-80 shadow-lg blur-sm`}></div>
          <div className={`absolute top-10 left-1/2 w-56 h-20 rounded-full ${currentBackground.clouds} opacity-80 shadow-lg blur-sm`}></div>
          <div className={`absolute top-40 left-3/4 w-32 h-14 rounded-full ${currentBackground.clouds} opacity-70 shadow-lg blur-sm`}></div>
          <div className={`absolute top-60 left-1/3 w-48 h-18 rounded-full ${currentBackground.clouds} opacity-80 shadow-lg blur-sm`}></div>
          <div className={`absolute top-30 left-[85%] w-60 h-20 rounded-full ${currentBackground.clouds} opacity-70 shadow-lg blur-sm`}></div>
          
          {/* Complex cloud formations */}
          <div className="absolute top-15 left-1/5">
            <div className={`absolute w-24 h-14 rounded-full ${currentBackground.clouds} opacity-90 shadow-lg blur-sm`}></div>
            <div className={`absolute left-10 top-3 w-32 h-16 rounded-full ${currentBackground.clouds} opacity-90 shadow-lg blur-sm`}></div>
            <div className={`absolute left-20 top-1 w-28 h-14 rounded-full ${currentBackground.clouds} opacity-90 shadow-lg blur-sm`}></div>
          </div>
          
          {/* Duplicate clouds for seamless loop */}
          <div className={`absolute top-20 left-[125%] w-40 h-16 rounded-full ${currentBackground.clouds} opacity-80 shadow-lg blur-sm`}></div>
          <div className={`absolute top-10 left-[150%] w-56 h-20 rounded-full ${currentBackground.clouds} opacity-80 shadow-lg blur-sm`}></div>
          <div className={`absolute top-40 left-[175%] w-32 h-14 rounded-full ${currentBackground.clouds} opacity-70 shadow-lg blur-sm`}></div>
          <div className={`absolute top-60 left-[133%] w-48 h-18 rounded-full ${currentBackground.clouds} opacity-80 shadow-lg blur-sm`}></div>
          <div className={`absolute top-30 left-[185%] w-60 h-20 rounded-full ${currentBackground.clouds} opacity-70 shadow-lg blur-sm`}></div>
          
          {/* Duplicate complex cloud formation */}
          <div className="absolute top-15 left-[115%]">
            <div className={`absolute w-24 h-14 rounded-full ${currentBackground.clouds} opacity-90 shadow-lg blur-sm`}></div>
            <div className={`absolute left-10 top-3 w-32 h-16 rounded-full ${currentBackground.clouds} opacity-90 shadow-lg blur-sm`}></div>
            <div className={`absolute left-20 top-1 w-28 h-14 rounded-full ${currentBackground.clouds} opacity-90 shadow-lg blur-sm`}></div>
          </div>
        </div>
      </motion.div>
    );
  }, [currentBackground.clouds]);
  
  // Memoize hills for better performance
  const Hills = useMemo(() => {
    return (
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-40 z-2 will-change-transform"
        animate={{ x: [0, -800] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear", repeatType: "loop" }}
      >
        {/* Hills with overlapping shapes for natural look */}
        <div className={`absolute bottom-0 left-0 w-96 h-32 rounded-t-full ${currentBackground.hills[0]} opacity-90 shadow-lg blur-[1px]`}></div>
        <div className={`absolute bottom-0 left-64 w-80 h-28 rounded-t-full ${currentBackground.hills[1]} opacity-90 shadow-lg blur-[1px]`}></div>
        <div className={`absolute bottom-0 left-[30rem] w-96 h-36 rounded-t-full ${currentBackground.hills[2]} opacity-90 shadow-lg blur-[1px]`}></div>
        <div className={`absolute bottom-0 left-[50rem] w-80 h-30 rounded-t-full ${currentBackground.hills[1]} opacity-90 shadow-lg blur-[1px]`}></div>
        
        {/* Hills with texture - small bumps */}
        <div className="absolute bottom-20 left-[25rem] w-full h-10">
          {[...Array(8)].map((_, i) => (
            <div 
              key={`hill-texture-${i}`}
              className={`absolute rounded-t-full ${currentBackground.hills[i % 3]} opacity-80 shadow-sm blur-[0.5px]`}
              style={{
                left: `${i * 120}px`,
                width: `${40 + Math.random() * 50}px`,
                height: `${10 + Math.random() * 15}px`
              }}
            ></div>
          ))}
        </div>
        
        {/* Duplicate hills for seamless loop */}
        <div className={`absolute bottom-0 left-[70rem] w-96 h-32 rounded-t-full ${currentBackground.hills[0]} opacity-90 shadow-lg blur-[1px]`}></div>
        <div className={`absolute bottom-0 left-[86rem] w-80 h-28 rounded-t-full ${currentBackground.hills[1]} opacity-90 shadow-lg blur-[1px]`}></div>
        <div className={`absolute bottom-0 left-[100rem] w-96 h-36 rounded-t-full ${currentBackground.hills[2]} opacity-90 shadow-lg blur-[1px]`}></div>
        <div className={`absolute bottom-0 left-[120rem] w-80 h-30 rounded-t-full ${currentBackground.hills[1]} opacity-90 shadow-lg blur-[1px]`}></div>
        
        {/* Duplicate texture hills */}
        <div className="absolute bottom-20 left-[95rem] w-full h-10">
          {[...Array(8)].map((_, i) => (
            <div 
              key={`hill-dup-${i}`}
              className={`absolute rounded-t-full ${currentBackground.hills[i % 3]} opacity-80 shadow-sm blur-[0.5px]`}
              style={{
                left: `${i * 120}px`,
                width: `${40 + Math.random() * 50}px`,
                height: `${10 + Math.random() * 15}px`
              }}
            ></div>
          ))}
        </div>
      </motion.div>
    );
  }, [currentBackground.hills]);
  
  // Enhanced ground with better detail and consistency
  const Ground = useMemo(() => {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-3">
        {/* Base ground gradient */}
        <div className={`absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b ${currentBackground.ground} shadow-inner`}></div>
        
        {/* Grass layer - continuous */}
        <div className="absolute bottom-19 left-0 right-0 h-3 overflow-hidden">
          {/* Multiple layers of grass for density */}
          <div className="relative w-full h-full">
            {[...Array(80)].map((_, i) => (
              <div 
                key={`grass-tall-${i}`}
                className={`absolute bottom-0 ${currentBackground.groundDetails[0]}`}
                style={{ 
                  left: `${(i * 1.25)}%`,
                  height: `${3 + Math.sin(i * 0.5) * 3}px`, // Varying height pattern
                  width: '2px',
                  borderRadius: '2px 2px 0 0',
                  transform: `rotate(${-5 + Math.sin(i * 0.8) * 10}deg)` // Varying angle pattern
                }}
              ></div>
            ))}
          </div>
          
          {/* Short grass layer for density */}
          <div className="relative w-full h-full">
            {[...Array(100)].map((_, i) => (
              <div 
                key={`grass-short-${i}`}
                className={`absolute bottom-0 ${currentBackground.groundDetails[1]}`}
                style={{ 
                  left: `${(i * 1)}%`,
                  height: `${2 + Math.cos(i * 0.7) * 1.5}px`, // Different pattern
                  width: '1.5px',
                  borderRadius: '1px 1px 0 0',
                  transform: `rotate(${Math.cos(i) * 8}deg)` // Different angle pattern
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Ground texture - small stones and details */}
        <div className="absolute bottom-0 left-0 right-0 h-5">
          {[...Array(40)].map((_, i) => (
            <div 
              key={`stone-${i}`}
              className="absolute rounded-full bg-gray-300 opacity-20"
              style={{ 
                left: `${Math.random() * 100}%`,
                bottom: `${Math.random() * 15}px`,
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`
              }}
            ></div>
          ))}
        </div>
        
        {/* Ground pattern - subtle horizontal lines for texture */}
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div 
              key={`line-${i}`}
              className="absolute left-0 right-0 bg-black"
              style={{ 
                bottom: `${i * 2}px`,
                height: '0.5px',
              }}
            ></div>
          ))}
        </div>
      </div>
    );
  }, [currentBackground.ground, currentBackground.groundDetails]);
  
  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
    >
      <AnimatePresence>
        <motion.div 
          key={`bg-${currentBackground.id}`}
          className={`absolute inset-0 bg-gradient-to-b ${currentBackground.sky} z-0`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </AnimatePresence>
      
      {/* Background particles based on level */}
      {StarParticles}
      {FloatingItems}
      {DustParticles}
      
      {/* Clouds layer */}
      {Clouds}
      
      {/* Hills layer */}
      {Hills}
      
      {/* Ground layer with grass */}
      {Ground}
      
      {/* Game elements rendered on top of background */}
      {gameState.obstacles.map((obstacle) => (
        <ObstacleComponent key={obstacle.id} obstacle={obstacle} />
      ))}
      
      {gameState.powerUps.map((powerUp) => (
        <PowerUpComponent key={powerUp.id} powerUp={powerUp} />
      ))}
      
      {gameState.collectibles.map((coin) => (
        <Coin key={coin.id} coin={coin} />
      ))}
      
      {/* Character */}
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
      
      {/* Level indicator with animation */}
      <AnimatePresence>
        {gameState.isPlaying && gameState.level > 1 && !isTransitioning && (
          <motion.div 
            className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <div className="px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm text-white font-bold">
              Nivå {gameState.level}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Level transition effect */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            className="absolute inset-0 bg-white z-100 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameCanvas;
