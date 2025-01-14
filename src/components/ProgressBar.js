import React from 'react';

const ProgressBar = ({ value, max, label }) => {
  const safeValue = isNaN(value) || value === undefined ? 0 : value;
  const percentage = (safeValue / max) * 100;
  
  let color = 'bg-green-500';
  if (percentage >= 100) {
    color = 'bg-red-500';
  } else if (percentage >= 90) {
    color = 'bg-yellow-500';
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-xl font-medium">{label}</span>
        <span className="text-xl font-medium">{percentage.toFixed(2)}%</span>
      </div>
      <div className="w-full bg-gray-200 h-6 relative">
        <div
          className={`h-6 ${color} transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` , maxWidth: "100%" }}
        ></div>
        {label === "Boundary" && (
          <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-2 text-md text-white">
            <span>Diverted</span>
            <span>Limited</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;