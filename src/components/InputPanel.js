import React from 'react';

const InputPanel = ({ inputValues, onInputChange, Bo_max }) => {
  // Constants from Java file
  const BORAN = 80;  // Slider range for B field
  const PWRAN = 80;  // Slider range for Power
  const MDRAN = 80;  // Slider range for Fuel
  
  // Min and max values from Java
  const BOMIN = 1;
  const PWMIN = 1;
  const PWMAX = 100;
  const MDMIN = 0.0;
  const MDMAX = 1.0;

  // Conversion functions based on Java calculations
  const convertBoValue = (sliderValue) => {
    return BOMIN + ((Bo_max - BOMIN) * sliderValue / BORAN);
  };

  const convertPwValue = (sliderValue) => {
    return PWMIN + (PWMAX - PWMIN) * sliderValue / PWRAN;
  };

  const convertMdValue = (sliderValue) => {
    return MDMIN + (MDMAX - MDMIN) * sliderValue / MDRAN;
  };

  // Reverse conversion for slider position
  const getBoSliderValue = (fieldValue) => {
    return Math.round((fieldValue - BOMIN) * BORAN / (Bo_max - BOMIN));
  };

  const getPwSliderValue = (powerValue) => {
    return Math.round((powerValue - PWMIN) * PWRAN / (PWMAX - PWMIN));
  };

  const getMdSliderValue = (fuelValue) => {
    return Math.round((fuelValue - MDMIN) * MDRAN / (MDMAX - MDMIN));
  };

  const handleSliderChange = (key, rawValue) => {
    let newValue;
    switch (key) {
      case 'B_in':
        newValue = convertBoValue(rawValue);
        break;
      case 'Pw_in_MW':
        newValue = convertPwValue(rawValue);
        break;
      case 'mdot_V_fac':
        newValue = convertMdValue(rawValue);
        break;
      default:
        newValue = rawValue;
    }
    console.log(key + " " + newValue)
    onInputChange(key, newValue);
  };

  const sliderClass = "w-full h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 hover:from-blue-500 hover:to-purple-600 transition-all duration-200 ease-in-out";
  const labelClass = "block mb-2 font-bold text-2xl text-gray-700";
  const valueClass = "text-right mt-2 font-semibold text-xl text-gray-600";

  // Calculate current slider positions
  const boSliderValue = getBoSliderValue(inputValues.B_in);
  const pwSliderValue = getPwSliderValue(inputValues.Pw_in_MW);
  const mdSliderValue = getMdSliderValue(inputValues.mdot_V_fac);

  return (
    <div className="bg-white p-6 w-full rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-600">PLASMA INPUTS</h2>
      <div className="space-y-6">
        <div>
          <label className={labelClass}>B Field</label>
          <input
            type="range"
            min="0"
            max={BORAN}
            step="0.01"
            value={boSliderValue}
            onChange={(e) => handleSliderChange('B_in', Number(e.target.value))}
            className={sliderClass}
          />
          <div className={valueClass}>{inputValues.B_in?.toFixed(2)} Tesla</div>
        </div>
        <div>
          <label className={labelClass}>Power</label>
          <input
            type="range"
            min="0"
            max={PWRAN}
            step="0.1"
            value={pwSliderValue}
            onChange={(e) => handleSliderChange('Pw_in_MW', Number(e.target.value))}
            className={sliderClass}
          />
          <div className={valueClass}>{inputValues.Pw_in_MW?.toFixed(1)} MW</div>
        </div>
        <div>
          <label className={labelClass}>Fuel</label>
          <input
            type="range"
            min="0"
            max={MDRAN}
            step="0.01"
            value={mdSliderValue}
            onChange={(e) => handleSliderChange('mdot_V_fac', Number(e.target.value))}
            className={sliderClass}
          />
          <div className={valueClass}>{(inputValues.mdot_V_fac * 100)?.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;