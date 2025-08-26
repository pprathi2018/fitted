'use client';

import React from 'react';

const GlobalLoader = () => {
  return (
    <div className="global-loader">
      <div className="loader-container">
        <h1 className="fitted-loader-title">Fitted</h1>
        <div className="loader-pulse"></div>
      </div>
    </div>
  );
};

export default GlobalLoader;