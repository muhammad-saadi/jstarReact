import React, { useState, useEffect } from 'react';
import Calculations from './utils/calculations';
import ConfigurationPanel from './components/ConfigurationPanel';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import PlasmaLimitsPanel from './components/PlasmaLimitsPanel';
import NeedleGauge from './components/NeedleGauge';
import DeeCanvasComponent from './components/DeeCanvasComponent';
import HiddenForm from './components/HiddenForm';

const App = () => {
  const [calculations] = useState(() => new Calculations());

  const [config, setConfig] = useState({
    plantType: 'ITER_R=8m',
    confinement: 'Standard',
    betaLimit: 'Standard',
    elongation: 'Standard'
  });

  const [inputValues, setInputValues] = useState({
    B_in: 5.3,
    Pw_in_MW: 50,
    mdot_V_fac: 0.1
  });

  const [magnetValues, setMagnetValues] = useState({
    redM: 36,   // Inside
    greenM: 38, // Outside
    blueM: 35,  // Top-Inner
    yellowM: 23 // Bottom-Outer
  });

  const [advancedValues, setAdvancedValues] = useState({
    Bo_max: 6,
    q95: 3,
    kmax: 1.8
  });

  const [impurities, setImpurities] = useState({
    He: 0.1,
    O: 0.001,
    C: 0.01048,
    Fe: 0.0001447,
    Be: 0.0,
    Ar: 0.0
  });

  const [results, setResults] = useState({});

  useEffect(() => {
    calculations.setImpurities(impurities);
    const newResults = calculations.calculate(
      {
        sv1: magnetValues.greenM,
        sv2: magnetValues.redM,
        sv3: magnetValues.blueM,
        sv4: magnetValues.yellowM
      },
      {
        boS: (inputValues.B_in - 1) * 16,
        pwS: (inputValues.Pw_in_MW - 1) * 0.8,
        mdS: inputValues.mdot_V_fac * 80
      }
    );
    setResults(newResults);
  }, [config, inputValues, magnetValues, impurities]);

  const handleConfigChange = (name, value) => {
    setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
    const configResult = calculations.updateConfig(name, value);

    // Update magnet values if needed based on plant type
    if (configResult.needsUpdate) {
      const { sliderValues } = configResult;
      setMagnetValues({
        greenM: sliderValues.sv1,
        redM: sliderValues.sv2,
        blueM: sliderValues.sv3,
        yellowM: sliderValues.sv4
      });
    }

    // Recalculate results after config change
    const newResults = calculations.calculate(
      {
        sv1: configResult.needsUpdate ? configResult.sliderValues.sv1 : magnetValues.greenM,
        sv2: configResult.needsUpdate ? configResult.sliderValues.sv2 : magnetValues.redM,
        sv3: configResult.needsUpdate ? configResult.sliderValues.sv3 : magnetValues.blueM,
        sv4: configResult.needsUpdate ? configResult.sliderValues.sv4 : magnetValues.yellowM
      },
      {
        boS: (inputValues.B_in - 1) * 16,
        pwS: (inputValues.Pw_in_MW - 1) * 0.8,
        mdS: inputValues.mdot_V_fac * 80
      }
    );
    setResults(newResults);
  };

  const handleInputChange = (name, value) => {
    setInputValues(prevValues => ({ ...prevValues, [name]: value }));
  };

  const handleMagnetChange = (magnet, value) => {
    setMagnetValues(prev => ({ ...prev, [magnet]: value }));
  };

  const handleSliderChange = (color, value) => {
    console.log(value)
    setMagnetValues(prev => ({ ...prev, [`${color}M`]: value }));
  };

  const handleAdvancedSave = (values) => {
    setAdvancedValues(values);
    calculations.updateAdvancedValues(values);
    
    // Recalculate after advanced values update
    const newResults = calculations.calculate(
      {
        sv1: magnetValues.greenM,
        sv2: magnetValues.redM,
        sv3: magnetValues.blueM,
        sv4: magnetValues.yellowM
      },
      {
        boS: (inputValues.B_in - 1) * 16,
        pwS: (inputValues.Pw_in_MW - 1) * 0.8,
        mdS: inputValues.mdot_V_fac * 80
      }
    );
    setResults(newResults);
  };

  const handleImpuritiesSave = (newImpurities) => {
    setImpurities(newImpurities);
  };

  return (
    <div className="container flex items-center justify-center bg-gray-100 mx-auto p-20">
      <div className="w-full max-w-full p-4 bg-white shadow-lg overflow-auto">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-4 text-center">Fusion Power Plant Simulator</h1>
        <div className="flex flex-row gap-2 mb-4 lg:max-h-[650px] w-full">
          <div>
            <ConfigurationPanel config={config} onConfigChange={handleConfigChange} />
          </div>

          <div className="flex flex-col mt-0  justify-between w-full">
            <InputPanel 
              inputValues={inputValues} 
              onInputChange={handleInputChange} 
              Bo_max={advancedValues.Bo_max} 
            />
            <NeedleGauge
              label="Elec. Pow. In"
              value={results.P_e_in || 0}
              loVal={0}
              hiVal={500}
              unit="MW"
            />
          </div>

          <div>
            <DeeCanvasComponent
              ro={results.Ro || 8}
              zo={results.Zo || 0}
              a={results.a || 3}
              k={results.k || 1.1}
              d={results.d || 0}
              R_o={results.R_o || 8}
              a_o={results.a_o || 3}
              sv1={magnetValues.greenM}
              sv2={magnetValues.redM}
              sv3={magnetValues.blueM}
              sv4={magnetValues.yellowM}
              colorIndex={Math.floor((results.P_e || 0) / 100)}
              onSliderChange={handleSliderChange}
            />
          </div>

          <div className="ml-0 w-full -translate-y-8">
            <PlasmaLimitsPanel results={results} />
            <div className="flex flex-col justify-between">
              <NeedleGauge
                label="Fusion Power"
                value={(results.Pfus_MW || 0) / 1000}
                loVal={0}
                hiVal={10}
                unit="GW"
              />
              <NeedleGauge
                label="Net Elec. Pow."
                value={results.P_e || 0}
                loVal={-500}
                hiVal={1500}
                unit="MW"
              />
            </div>
          </div>
        </div>

        <div className="w-full mb-4">
          <OutputPanel results={results} inputValues={inputValues} />
        </div>

        <HiddenForm
          onSave={handleAdvancedSave}
          onImpuritiesSave={handleImpuritiesSave}
          initialValues={advancedValues}
          initialImpurities={impurities}
        />
      </div>
    </div>
  );
};

export default App;