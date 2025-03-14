
// Collection of sound utilities for the game

const audioCache: { [key: string]: HTMLAudioElement } = {};

// Play a sound with options for volume, rate, and detune
export const playSound = (
  url: string, 
  options: { 
    volume?: number; 
    rate?: number; 
    detune?: number;
    loop?: boolean;
  } = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Use cached audio if available to prevent memory leaks
      let audio = audioCache[url];
      if (!audio) {
        audio = new Audio(url);
        audioCache[url] = audio;
      }
      
      // Reset the audio to the beginning if it was played before
      audio.currentTime = 0;
      
      // Apply options
      audio.volume = options.volume !== undefined ? options.volume : 0.5;
      audio.loop = options.loop || false;
      
      if (options.rate !== undefined) {
        audio.playbackRate = options.rate;
      }
      
      if (options.detune !== undefined && 'detune' in audio) {
        // TypeScript doesn't know about detune, but some browsers support it
        (audio as any).detune = options.detune;
      }
      
      // Play the sound and resolve when done
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Listen for the end of audio to resolve the promise
            if (!options.loop) {
              audio.addEventListener('ended', () => resolve(), { once: true });
            } else {
              // For looping sounds, resolve immediately after it starts
              resolve();
            }
          })
          .catch(err => {
            console.error(`Error playing sound ${url}:`, err);
            reject(err);
          });
      } else {
        // Old browsers might not return a promise
        resolve();
      }
    } catch (err) {
      console.error(`Error setting up sound ${url}:`, err);
      reject(err);
    }
  });
};

// Play the coin collection sound with random variations
export const playCoinSound = () => {
  console.log("Playing coin sound");
  
  const randomPitch = 1.0 + (Math.random() * 0.2 - 0.1); // Between 0.9 and 1.1
  
  return playSound('/coin-sound.mp3', {
    volume: 0.3,
    rate: randomPitch
  });
};

// Stop a currently playing sound
export const stopSound = (url: string): void => {
  const audio = audioCache[url];
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

// Preload sounds for better performance
export const preloadSounds = (urls: string[]): void => {
  console.log("Preloading sounds:", urls);
  
  urls.forEach(url => {
    if (!audioCache[url]) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioCache[url] = audio;
      
      // Just load it, don't play
      audio.load();
    }
  });
};

// Clean up and release audio resources
export const cleanupSounds = (): void => {
  Object.values(audioCache).forEach(audio => {
    audio.pause();
    audio.src = '';
  });
  
  // Clear the cache
  Object.keys(audioCache).forEach(key => {
    delete audioCache[key];
  });
};

export default {
  playSound,
  playCoinSound,
  stopSound,
  preloadSounds,
  cleanupSounds
};
