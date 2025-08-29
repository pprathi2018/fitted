'use client';

import React from 'react';

const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 bg-fitted-gradient flex items-center justify-center z-[9999]">
      <div className="relative text-center">
        <h1 className="font-playfair text-fitted-loader font-black italic bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent animate-breathe select-none">
          Fitted
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-gradient-radial from-white/10 to-transparent animate-pulse pointer-events-none" />
      </div>
    </div>
  );
};

export default GlobalLoader;