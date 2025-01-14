import React from 'react';

const OutputPanel = ({ results,inputValues }) => {
  const formatValue = (value, decimals = 2, unit = '') => {
    if (value === undefined || value === null) return '-';
    return `${Number(value).toFixed(decimals)}${unit}`;
  };

  const outputGroups = [
    [
      ['Magnetic Field', formatValue(results?.B_in, 2, ' T')],
      ['Plasma Current', formatValue(results?.Ip_MA, 2, ' MA')],
      ['Safety Factor, q95', formatValue(results?.q_edg, 2)],
      ['Zeff', formatValue(results?.Zeff, 2)],
      ['DT Fraction', formatValue(results?.nDT_ne * 100, 2, ' %')],
    ],
    [
      ['Fusion Power', formatValue(results?.Pfus_MW, 0, ' MW')],
      ['Net Elec. Power', formatValue(results?.P_e, 0, ' MW')],
      ['Total Aux. Power', formatValue(results?.P_in_MW, 1, ' MW')],
      ['Bremsstrahlung Rad.', formatValue(results?.Pbrem_MW, 0, ' MW')],
      ['Transport Pow. Loss', formatValue(results?.Ptrans_MW, 0, ' MW')],
    ],
    [
      ['Q = Pfusion/Paux', formatValue(results?.P_in_MW ? results?.Pfus_MW / results?.P_in_MW : 0, 1)],
      ['Wall Load', formatValue(results?.n_wall, 2, ' MW/m²')],
      ['Toroidal Beta', formatValue(results?.Bet * 100, 2, ' %')],
      ['Temperature', formatValue(results?.T10_ * 10, 2, ' keV')],
      ['Density', formatValue(results?.n_new, 2, ' (10²⁰ m⁻³)')],
    ],
    [
      ['Normalized Beta', formatValue(
        results?.Ip_MA ? (results?.Bet * 100 * results?.B_in * results?.a) / results?.Ip_MA : 0,
        2,
        ' %Tm/MA'
      )],
      ['H98y2', formatValue(results?.H98y2, 2)],
      ['Greenwald Limit', formatValue(results?.n20_n20_gw, 2)],
      ['Conf. Time', formatValue(results?.Conf_t, 2, ' s')],
      ['Plasma Volume', formatValue(results?.Vol, 0, ' m³')],
    ],
  ];

  const renderOutputGroup = (outputs) => (
    <div className="grid grid-cols-1 gap-4 p-4 bg-gray-200 rounded-lg shadow-lg font-bold">
      {outputs.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between text-2xl">
          <span className=" text-gray-600 text-xl">{label}:</span>
          <span className="ml-2 text-gray-900 text-xl">{value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-400 p-4 rounded-lg">
      <h2 className="text-3xl font-bold mb-4">PLANT OUTPUT INFO</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {outputGroups.map((group, index) => (
          <div key={index}>
            {renderOutputGroup(group)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutputPanel;