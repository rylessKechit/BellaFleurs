'use client';

import { useEffect, useState } from 'react';

// Configuration des emojis de Noël
const CHRISTMAS_EMOJIS = ['🎅', '🎄', '❄️', '🎁', '⭐', '🔔', '🤶', '🦌', '🧑‍🎄'];

interface ChristmasDecorationProps {
  enabled?: boolean;
  density?: 'light' | 'medium' | 'heavy';
  className?: string;
}

interface FallingEmoji {
  id: number;
  emoji: string;
  left: number;
  animationDelay: number;
  animationDuration: number;
  size: number;
}

export default function ChristmasDecoration({ 
  enabled = true, 
  density = 'medium',
  className = ''
}: ChristmasDecorationProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [emojis, setEmojis] = useState<FallingEmoji[]>([]);

  // Densité des emojis
  const getDensityCount = () => {
    switch (density) {
      case 'light': return 6;
      case 'medium': return 10;
      case 'heavy': return 15;
      default: return 10;
    }
  };

  useEffect(() => {
    setIsMounted(true);
    
    if (!enabled) return;

    // Générer les emojis fixes pour éviter l'hydration mismatch
    const generateEmojis = (): FallingEmoji[] => {
      const count = getDensityCount();
      return Array.from({ length: count }, (_, i) => {
        // Valeurs fixes basées sur l'index pour éviter Math.random()
        const positions = [15, 25, 35, 45, 55, 65, 75, 85, 95, 5, 20, 30, 40, 60, 80];
        const delays = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];
        const durations = [4, 4.5, 5, 5.5, 6, 4.2, 4.8, 5.2, 5.8, 4.3, 4.7, 5.3, 5.7, 4.1, 4.9];
        const sizes = [16, 18, 20, 22, 16, 18, 20, 16, 18, 22, 20, 16, 18, 20, 22];
        
        return {
          id: i,
          emoji: CHRISTMAS_EMOJIS[i % CHRISTMAS_EMOJIS.length],
          left: positions[i % positions.length],
          animationDelay: delays[i % delays.length],
          animationDuration: durations[i % durations.length],
          size: sizes[i % sizes.length]
        };
      });
    };

    setEmojis(generateEmojis());
  }, [enabled, density]);

  if (!enabled || !isMounted) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-10 overflow-hidden ${className}`}>
      {/* Emojis qui tombent */}
      {emojis.map((item) => (
        <div
          key={item.id}
          className="absolute animate-christmas-fall opacity-80"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDelay: `${item.animationDelay}s`,
            animationDuration: `${item.animationDuration}s`,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}