import React from 'react';

const ConfigurationPanel = ({ config, onConfigChange }) => {
  const renderOptionGroup = (label, groupName, options) => (
    <div className="mb-1 p-2 bg-gray-200 rounded shadow-md">
      <h3 className="font-bold text-lg mb-4">{label}</h3>
      {Object.entries(options).map(([key, value]) => (
        <label key={key} className="flex items-center mb-2 text-2xl">
          <input
            type="radio"
            name={groupName}
            value={key}
            checked={config[groupName] === key}
            onChange={() => onConfigChange(groupName, key)}
            className="w-4 h-4 text-blue-600 transition duration-300 ease-in-out"
          />
          <span className="ml-2 text-gray-700">{key}</span>
        </label>
      ))}
    </div>
  );

  const options = {
    plantOptions: {
      'ITER_R=8m': true,
      'ITER_R=6m': false
    },
    confinementOptions: {
      'Standard': true,
      'Double': false
    },
    betaLimitOptions: {
      'Standard': true,
      'Double': false
    },
    elongationOptions: {
      'Standard': true,
      '50% Increase': false
    }
  };

  return (
    <div className="bg-gray-400 p-4 w-fit rounded-lg font-bold">
      <h2 className="text-3xl font-bold mb-4">CONFIGURATION</h2>
      {renderOptionGroup("Plant Type", 'plantType', options.plantOptions)}
      {renderOptionGroup("Confinement", 'confinement', options.confinementOptions)}
      {renderOptionGroup("Beta Limit", 'betaLimit', options.betaLimitOptions)}
      {renderOptionGroup("Elongation", 'elongation', options.elongationOptions)}
    </div>
  );
};

export default ConfigurationPanel;