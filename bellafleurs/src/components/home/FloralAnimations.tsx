'use client';

import { useEffect, useState } from 'react';

export default function FloralAnimations() {
  const [petals, setPetals] = useState<Array<{
    id: number;
    emoji: string;
    left: number;
    animationDuration: number;
    animationDelay: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const petalEmojis = ['🌸', '🌺', '🌼', '🌻', '🌷', '💐', '🌹', '🥀', '🍀', '🌿'];
    
    // Créer des pétales initiaux
    const initialPetals = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: petalEmojis[Math.floor(Math.random() * petalEmojis.length)],
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 10, // 8-18 secondes
      animationDelay: Math.random() * 5, // 0-5 secondes de délai
      size: 16 + Math.random() * 16, // 16-32px
    }));
    
    setPetals(initialPetals);

    // Ajouter de nouveaux pétales périodiquement
    const interval = setInterval(() => {
      setPetals(currentPetals => {
        // Garder seulement les 20 pétales les plus récents
        const filteredPetals = currentPetals.slice(-15);
        
        // Ajouter de nouveaux pétales
        const newPetals = Array.from({ length: 3 }, (_, i) => ({
          id: Date.now() + i,
          emoji: petalEmojis[Math.floor(Math.random() * petalEmojis.length)],
          left: Math.random() * 100,
          animationDuration: 8 + Math.random() * 10,
          animationDelay: 0,
          size: 16 + Math.random() * 16,
        }));
        
        return [...filteredPetals, ...newPetals];
      });
    }, 3000); // Nouveau pétale toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-petal-fall opacity-60"
          style={{
            left: `${petal.left}%`,
            fontSize: `${petal.size}px`,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.animationDelay}s`,
            top: '-10vh',
          }}
        >
          {petal.emoji}
        </div>
      ))}
      
      {/* Pétales statiques décoratifs dans les coins */}
      <div className="absolute top-10 left-10 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>
        🌸
      </div>
      <div className="absolute top-20 right-16 text-2xl opacity-15 animate-pulse" style={{ animationDuration: '4s' }}>
        🌺
      </div>
      <div className="absolute bottom-20 left-20 text-4xl opacity-10 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
        🌼
      </div>
      <div className="absolute bottom-32 right-10 text-2xl opacity-20 animate-pulse" style={{ animationDuration: '3s', animationDelay: '2s' }}>
        🌷
      </div>
      
      {/* Cercles décoratifs flous */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-200 rounded-full opacity-10 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-15 animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/6 w-20 h-20 bg-purple-200 rounded-full opacity-10 animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }}></div>
    </div>
  );
}