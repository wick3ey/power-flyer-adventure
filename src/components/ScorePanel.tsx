
import React from 'react';
import { formatScore } from '../utils/gameUtils';
import { Coins, Rocket, Heart, TrendingUp } from 'lucide-react';

interface ScorePanelProps {
  score: number;
  highScore: number;
  lives: number;
  level: number;
}

const ScorePanel: React.FC<ScorePanelProps> = ({ score, highScore, lives, level }) => {
  return (
    <div className="fixed top-4 right-4 left-4 flex justify-between items-center z-20 pointer-events-none">
      <div className="game-panel rounded-full px-4 py-2 flex items-center gap-4 pointer-events-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-blue-300">
        <div className="flex items-center gap-1">
          <Rocket className="w-5 h-5 text-yellow-300" />
          <span className="font-medium">MOONSHOT LVL {level}</span>
        </div>
      </div>

      <div className="game-panel rounded-full px-4 py-2 flex items-center gap-4 pointer-events-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-blue-300">
        <div className="flex items-center gap-1">
          <Coins className="w-5 h-5 text-yellow-300" />
          <div className="flex flex-col">
            <span className="font-medium">${formatScore(score)} $MOON</span>
            <span className="text-xs text-green-300 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +{Math.floor(score/10)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart 
              key={i}
              className={`w-5 h-5 transition-colors ${
                i < lives ? 'text-game-danger fill-game-danger' : 'text-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScorePanel;
