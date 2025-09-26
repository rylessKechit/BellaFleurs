'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';

interface PriceSelectorProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  defaultPrice?: number;
}

export default function PriceSelector({ 
  minPrice, 
  maxPrice, 
  onPriceChange,
  defaultPrice
}: PriceSelectorProps) {
  const [selectedPrice, setSelectedPrice] = useState(defaultPrice || minPrice);

  useEffect(() => {
    onPriceChange(selectedPrice);
  }, [selectedPrice, onPriceChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSelectedPrice(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= minPrice && value <= maxPrice) {
      setSelectedPrice(value);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold">Votre Budget</Label>
        <div className="mt-2">
          <div className="flex items-center gap-4 mb-3">
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              step="1"
              value={selectedPrice}
              onChange={handleInputChange}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center font-semibold"
            />
            <span className="text-lg font-semibold">€</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step="1"
              value={selectedPrice}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Min: {minPrice}€</span>
              <span>Max: {maxPrice}€</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #c73650;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #c73650;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}