
import React from 'react';
import { formatScore } from '../utils/gameUtils';
import { Heart, Star, Trophy } from 'lucide-react';

interface ScorePanelProps {
  score: number;
  highScore: number;
  lives: number;
  level: number;
}

const ScorePanel: React.FC<ScorePanelProps> = ({ score, highScore, lives, level }) => {
  return (
    <div className="flex justify-between items-center w-full z-20 pointer-events-none">
      <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4 pointer-events-auto shadow-md">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">Level {level}</span>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4 pointer-events-auto shadow-md">
        <div className="flex items-center gap-1">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">{formatScore(score)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart 
              key={i}
              className={`w-5 h-5 transition-colors ${
                i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScorePanel;
