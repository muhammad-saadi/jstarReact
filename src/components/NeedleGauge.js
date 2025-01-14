import React, { useRef, useEffect } from 'react';

const NeedleGauge = ({ 
  raised = false, 
  label = "Needle Gauge", 
  loVal = 0.0, 
  hiVal = 10.0, 
  divisions = 5, 
  value = 0.0,
  width = 180,
  height = 100,
  unit = ""
}) => {
  const canvasRef = useRef(null);
  const SPACING = 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawNeedleGauge(ctx, canvas, value);
  }, [value, label, loVal, hiVal, divisions, raised, unit]);

  const drawNeedleGauge = (ctx, canvas, currentValue) => {
    const d = { width: canvas.width, height: canvas.height };

    // Clear canvas and draw background
    ctx.clearRect(0, 0, d.width, d.height);
    ctx.fillStyle = "#D3D3D3";
    ctx.fillRect(0, 0, d.width, d.height);

    // Draw 3D effect
    if (raised) {
      ctx.strokeStyle = "white";
      ctx.strokeRect(0, 0, d.width - 1, d.height - 1);
    } else {
      ctx.strokeStyle = "gray";
      ctx.strokeRect(0, 0, d.width - 1, d.height - 1);
    }

    ctx.font = "14px Arial";
    let fm = ctx.measureText('M');

    var radius = Math.min(d.height - (SPACING * 3) - (fm.actualBoundingBoxAscent + fm.actualBoundingBoxDescent), (d.width / 2) - (SPACING * 2));
    let center = {x: d.width / 2, y: d.height - (SPACING * 2) - (fm.actualBoundingBoxAscent + fm.actualBoundingBoxDescent)};

    // Draw the gauge background
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, Math.PI, 0, false);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, Math.PI, 0, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius / 8, Math.PI, 0, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center.x - radius, center.y);
    ctx.lineTo(center.x + radius, center.y);
    ctx.stroke();

    // Draw divisions and numbers
    const totalDivisions = divisions + 1; // Total number of labels (including start and end)
    const midPoint = Math.floor(totalDivisions / 2); // Middle point for rotation change

    for (var i = 0; i <= divisions; i++) {
      var markAngle = ((i / divisions * 0.9 * Math.PI) - (0.9 * Math.PI / 2));
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(center.x + Math.round(0.95 * radius * Math.sin(markAngle)), center.y - Math.round(0.95 * radius * Math.cos(markAngle)));
      ctx.lineTo(center.x + Math.round(radius * Math.sin(markAngle)), center.y - Math.round(radius * Math.cos(markAngle)));
      ctx.stroke();

      if (fm.actualBoundingBoxAscent - fm.actualBoundingBoxDescent < (radius / divisions)) {
        var markText = String(loVal + ((i / divisions) * (hiVal - loVal)));
        var decPos = markText.indexOf('.', 1);
        var trimmedText = markText.substring(0, decPos !== -1 ? decPos : markText.length);

        // Save current context state
        ctx.save();
        
        // Move to the position where we want to draw the text
        const textRadius = radius * 0.75;
        const textX = center.x + Math.round(textRadius * Math.sin(markAngle));
        const textY = center.y - Math.round(textRadius * Math.cos(markAngle));
        
        ctx.translate(textX, textY);
        
        // Calculate rotation angle based on position
        // First half (3 labels) rotated one way, second half (3 labels) rotated the other way
        let rotationAngle = markAngle + Math.PI/2;
        if (i >= midPoint) {
          rotationAngle += Math.PI;
        }
        
        ctx.rotate(rotationAngle);
        
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(trimmedText, 0, 0);
        
        // Restore context to previous state
        ctx.restore();
      }
    }

    // Draw the needle
    var angle = (((Math.max(loVal, Math.min(hiVal, currentValue)) - loVal) / (hiVal - loVal)) * 0.9 * Math.PI) - (0.9 * Math.PI / 2);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + Math.round(0.65 * radius * Math.sin(angle)), center.y - Math.round(0.65 * radius * Math.cos(angle)));
    ctx.stroke();

    // Draw center circle
    ctx.fillStyle = "darkGray";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 2, 0, Math.PI * 2, false);
    ctx.fill();

    // Draw label and value
    const valueText = `${currentValue.toFixed(2)} ${unit}`;
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(label +": "+ valueText, (d.width - ctx.measureText(label).width)/100, d.height - SPACING - fm.actualBoundingBoxDescent);
  };

  return (
    <canvas ref={canvasRef} width={width} height={height} />
  );
};

export default NeedleGauge;