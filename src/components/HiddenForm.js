import React, { useState } from 'react';

const HiddenForm = ({ onSave, onClose, initialValues, initialImpurities, onImpuritiesSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImpurities, setShowImpurities] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [impurities, setImpurities] = useState(initialImpurities);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: parseFloat(value) }));
  };
  
  const handleImpurityChange = (e) => {
    const { name, value } = e.target;
    console.log(value)
    setImpurities(prev => ({ ...prev, [name]: parseFloat(value) / 100 })); // Convert percentage to decimal
  };

  const handleSave = () => {
    onSave(formValues);
    setIsOpen(false);
  };

  const handleImpuritiesSave = () => {
    onImpuritiesSave(impurities);
    setShowImpurities(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Advanced Settings
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Advanced Settings</h3>
          <div className="mt-2 px-7 py-3">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bo_max</label>
                <input
                  type="number"
                  name="Bo_max"
                  value={formValues.Bo_max}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">q95</label>
                <input
                  type="number"
                  name="q95"
                  value={formValues.q95}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">kmax</label>
                <input
                  type="number"
                  name="kmax"
                  value={formValues.kmax}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowImpurities(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Impurities
              </button>
              <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Save
              </button>
              <button onClick={() => setIsOpen(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImpurities && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Impurities (%)</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(impurities).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">{key}</label>
                  <input
                    type="number"
                    name={key}
                    value={value * 100} // Convert decimal to percentage
                    onChange={handleImpurityChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={handleImpuritiesSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                Save
              </button>
              <button onClick={() => setShowImpurities(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiddenForm;