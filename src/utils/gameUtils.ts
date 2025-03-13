
// Utility functions for the Power game

// Random number generator with min/max range
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Check collision between two objects with position and size
export const checkCollision = (
  object1: { x: number; y: number; width: number; height: number },
  object2: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    object1.x < object2.x + object2.width &&
    object1.x + object1.width > object2.x &&
    object1.y < object2.y + object2.height &&
    object1.y + object1.height > object2.y
  );
};

// Easing functions for smooth animations
export const easing = {
  // Cubic ease out - decelerating to zero velocity
  easeOutCubic: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },
  // Cubic ease in - accelerating from zero velocity
  easeInCubic: (t: number): number => {
    return t * t * t;
  },
  // Cubic ease in/out - acceleration until halfway, then deceleration
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  // Elastic - overshooting effect
  elastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  // Bounce - bouncing effect
  bounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};

// Animation timing function
export const animate = (
  duration: number,
  easingFn: (t: number) => number,
  callback: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      
      callback(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    
    requestAnimationFrame(step);
  });
};

// Game level difficulty calculator
export const calculateDifficulty = (level: number): number => {
  // Base difficulty starts at 1, increases more rapidly as levels progress
  return 1 + Math.log(level + 1) * 0.5;
};

// Format score with commas for thousands
export const formatScore = (score: number): string => {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Generate a unique ID for game objects
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Calculate star rating (1-3) based on performance
export const calculateStars = (score: number, maxScore: number): number => {
  const percentage = score / maxScore;
  if (percentage >= 0.9) return 3;
  if (percentage >= 0.7) return 2;
  return 1;
};

// Lerp (Linear Interpolation) - smooth transition between values
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

// Clamp a value between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

// Power-up types
export enum PowerUpType {
  SHIELD = 'shield',
  SPEED = 'speed',
  MAGNET = 'magnet',
  SLOW_TIME = 'slow_time'
}

// Game difficulty levels
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

// Obstacle types
export enum ObstacleType {
  STATIC = 'static',
  MOVING = 'moving',
  BREAKABLE = 'breakable',
  ROTATING = 'rotating'
}
