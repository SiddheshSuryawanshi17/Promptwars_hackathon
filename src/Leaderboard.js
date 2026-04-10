import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

export const Leaderboard = ({ userPoints, userName }) => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Simulate fetching leaderboard data from backend
    const mockLeaderboard = [
      { rank: 1, name: 'Alex Chen', points: 1250, trend: 'up' },
      { rank: 2, name: 'Jordan Smith', points: 1180, trend: 'up' },
      { rank: 3, name: 'Casey Johnson', points: 1050, trend: 'down' },
      { rank: 4, name: 'Sam Taylor', points: 950, trend: 'up' },
      { rank: 5, name: userName || 'You', points: userPoints, trend: 'up' }
    ];

    // Sort by points
    setLeaderboard(mockLeaderboard.sort((a, b) => b.points - a.points).map((item, idx) => ({
      ...item,
      rank: idx + 1
    })));
  }, [userPoints, userName]);

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}️⃣`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-white">Fan Leaderboard</h3>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`p-3 rounded flex items-center justify-between transition ${
              entry.name === userName
                ? 'bg-yellow-900 bg-opacity-40 border border-yellow-500'
                : 'bg-slate-700 bg-opacity-50 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                {getMedalEmoji(entry.rank)}
              </span>
              <div>
                <p className="text-white font-semibold text-sm">
                  {entry.name}
                  {entry.name === userName && <span className="text-yellow-400 ml-2">(You)</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-yellow-400 font-bold text-lg">{entry.points}</span>
              {entry.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <div className="w-4 h-4 text-red-400">
                  <TrendingUp className="w-4 h-4 transform rotate-180" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded border border-blue-500">
        <p className="text-blue-200 text-sm">
          💡 <span className="font-semibold">Tip:</span> Report queue info to climb the leaderboard!
        </p>
      </div>
    </div>
  );
};
