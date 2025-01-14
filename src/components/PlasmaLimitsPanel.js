import React from 'react';
import ProgressBar from './ProgressBar';

const PlasmaLimitsPanel = ({ results }) => {
  const densityLimit = results.n20_n20_gw || 0;
  const pressureLimit = results.n20_n20_bet || 0;
  const boundaryLimit = 1 - (results.fdiv || 0);

  return (
    <div className="bg-gray-400 p-4 w-full rounded-lg ">
      <h2 className="text-3xl font-bold mb-4">PLASMA LIMITS</h2>
      <ProgressBar label="Density" value={densityLimit} max={1} />
      <ProgressBar label="Pressure" value={pressureLimit} max={1} />
      <ProgressBar label="Boundary" value={boundaryLimit} max={1} />
      <div className="flex justify-between text-lg mt-2">
        <span>Diverted</span>
        <span>Limited</span>
      </div>
    </div>
  );
};

export default PlasmaLimitsPanel;