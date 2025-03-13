
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Game from '../components/Game';

const Index = () => {
  // Set full height for mobile browsers
  useEffect(() => {
    const setDocumentHeight = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    // Set initial height
    setDocumentHeight();

    // Update on resize or orientation change
    window.addEventListener('resize', setDocumentHeight);
    window.addEventListener('orientationchange', setDocumentHeight);

    return () => {
      window.removeEventListener('resize', setDocumentHeight);
      window.removeEventListener('orientationchange', setDocumentHeight);
    };
  }, []);

  return (
    <motion.div 
      className="w-full h-screen overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Game />
    </motion.div>
  );
};

export default Index;
