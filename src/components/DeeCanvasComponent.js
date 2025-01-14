import React, { useRef, useEffect, useState } from 'react';
import DeeCanvas from './DeeCanvas';

const MagnetSlider = ({ color, value, onChange, orientation }) => {
  const sliderStyles = {
    appearance: 'none',
    width: orientation === 'vertical' ? '200px' : '200px',
    height: orientation === 'vertical' ? '30px' : '30px',
    background: `linear-gradient(to right, ${color}, ${color})`,
    outline: 'none',
    opacity: '0.7',
    transition: 'opacity .2s',
    transform: orientation === 'vertical' ? 'rotate(-90deg)' : 'none',
    // borderRadius: '10px',
    position: 'relative',
  };

  // console.log(color +" "+ value)

  const thumbStyles = `
    .magnet-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      background: white;
      cursor: pointer;
      border-radius: 5px;
      border: 2px solid #d0d0d0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      position: relative;
    }
    .magnet-slider::-moz-range-thumb {
      width: 50px;
      height: 50px;
      background: white;
      cursor: pointer;
      border-radius: 5px;
      border: 2px solid #d0d0d0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      position: relative;
    }
    .magnet-slider::-webkit-slider-thumb::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      background: #808080;
      border-radius: 3px;
    }
    .magnet-slider::-moz-range-thumb::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      background: #808080;
      border-radius: 3px;
    }
  `;

  return (
    <>
      <style>{thumbStyles}</style>
      <input
        type="range"
        min="0"
        max="40"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={sliderStyles}
        className="magnet-slider"
      />
    </>
  );
};

const DeeCanvasComponent = ({
  ro, zo, a, k, d,
  sv1, sv2, sv3, sv4,
  colorIndex,
  onSliderChange
}) => {
  const canvasRef = useRef(null);
  const deeCanvasRef = useRef(null);

  const [sliders, setSliders] = useState({
    green: sv1,
    red: sv2,
    blue: sv3,
    yellow: sv4
  });

  useEffect(() => {
    if (canvasRef.current && !deeCanvasRef.current) {
      deeCanvasRef.current = new DeeCanvas(canvasRef.current.id);
    }
  }, []);

  useEffect(() => {
    if (deeCanvasRef.current) {
      deeCanvasRef.current.setAll(ro, zo, a, k, d);
      deeCanvasRef.current.setGreen(sliders.green);
      deeCanvasRef.current.setRed(sliders.red);
      deeCanvasRef.current.setBlue(sliders.blue);
      deeCanvasRef.current.setYellow(sliders.yellow);
      deeCanvasRef.current.setColorIndex(colorIndex);
    }
  }, [ro, zo, a, k, d, sliders, colorIndex]);

  useEffect(()=>{
    setSliders({
      green: sv1,
      red: sv2,
      blue: sv3,
      yellow: sv4
    });
  },[sv1,sv2,sv3,sv4])

  const handleSliderChange = (color, value) => {
    setSliders(prev => ({ ...prev, [color]: value }));
    onSliderChange(color, value);
  };

  return (
    <div className="relative min-w-[400px] h-[650px] bg-gray-100 rounded-lg shadow-lg">
      <canvas 
        ref={canvasRef} 
        id="deeCanvas" 
        // width={500} 
        // height={700}
        className="absolute h-full w-full p-14"
      />
      
      {/* Vertical sliders */}
      <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 ">
        <MagnetSlider
          color="red"
          value={sliders.red}
          onChange={(value) => handleSliderChange('red', value)}
          orientation="vertical"
        />
      </div>
      <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
        <MagnetSlider
          color="green"
          value={sliders.green}
          onChange={(value) => handleSliderChange('green', value)}
          orientation="vertical"
        />
      </div>
      
      {/* Horizontal sliders */}
      <div className="absolute top-4 left-0 transform translate-x-1/4">
        <MagnetSlider
          color="blue"
          value={sliders.blue}
          onChange={(value) => handleSliderChange('blue', value)}
          orientation="horizontal"
        />
      </div>
      <div className="absolute bottom-4 right-0 transform -translate-x-1/4">
        <MagnetSlider
          color="yellow"
          value={sliders.yellow}
          onChange={(value) => handleSliderChange('yellow', value)}
          orientation="horizontal"
        />
      </div>
    </div>
  );
};

export default DeeCanvasComponent;