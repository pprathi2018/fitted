'use client';

import React from 'react';

const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center z-[9999]">
      <div className="relative">
        <h1 className="fitted-logo text-7xl animate-pulse select-none">
          Fitted
        </h1>
      </div>
    </div>
  );
};

export default GlobalLoader;