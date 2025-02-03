import * as Sentry from '@sentry/browser';

export function renderArtwork({ canvas, colors, pixelMe, remix, shape }) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (!pixelMe) {
    if (remix) {
      let blockHeight = height / colors.length;
      let currentY = 0;
      colors.forEach((col) => {
        ctx.fillStyle = col.color;
        ctx.fillRect(0, currentY, width, blockHeight);
        currentY += blockHeight;
      });
    } else {
      const totalPercent = colors.reduce((sum, col) => sum + col.percentage, 0);
      let currentY = 0;
      colors.forEach((col) => {
        const blockHeight = (col.percentage / totalPercent) * height;
        ctx.fillStyle = col.color;
        ctx.fillRect(0, currentY, width, blockHeight);
        currentY += blockHeight;
      });
    }
  } else {
    const gridSize = Math.floor(Math.sqrt(width * height / colors.length));
    for (let y = 0; y < height; y += gridSize) {
      for (let x = 0; x < width; x += gridSize) {
        const idx = Math.min(
          colors.length - 1,
          Math.floor((y / height) * colors.length)
        );
        ctx.fillStyle = colors[idx].color;
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }
  }
  if (shape !== 'rectangle') {
    applyShapeMask({ canvas, shape });
  }
}

function applyShapeMask({ canvas, shape }) {
  const ctx = canvas.getContext('2d');
  const temp = document.createElement('canvas');
  temp.width = canvas.width;
  temp.height = canvas.height;
  const tempCtx = temp.getContext('2d');
  tempCtx.drawImage(canvas, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  if (shape === 'circle') {
    ctx.beginPath();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  } else if (shape === 'square') {
    ctx.beginPath();
    const side = Math.min(canvas.width, canvas.height);
    const offsetX = (canvas.width - side) / 2;
    const offsetY = (canvas.height - side) / 2;
    ctx.rect(offsetX, offsetY, side, side);
    ctx.closePath();
    ctx.clip();
  }
  ctx.drawImage(temp, 0, 0);
  ctx.restore();
}

export function exportArtwork({ canvas, format }) {
  try {
    const dataURL = canvas.toDataURL(`image/${format}`, 1.0);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `artwork.${format}`;
    link.click();
  } catch (error) {
    console.error('Error exporting artwork:', error);
    Sentry.captureException(error);
  }
}

export function rgbToHex(rgbString) {
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgbString);
  if (!result) {
    return rgbString;
  }
  const r = parseInt(result[1]).toString(16).padStart(2, '0');
  const g = parseInt(result[2]).toString(16).padStart(2, '0');
  const b = parseInt(result[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}