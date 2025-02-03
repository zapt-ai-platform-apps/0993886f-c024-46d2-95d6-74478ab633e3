import ColorThief from 'colorthief';
import * as Sentry from '@sentry/browser';
import { renderArtwork } from './imageProcessor.render';

export async function analyzeImage({ imgPreview, numColors, remix, setPalette, setProcessing, canvas, pixelMe }) {
  if (!imgPreview) return;
  try {
    console.log("Starting image analysis...");
    setProcessing(true);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imgPreview;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const offCanvas = document.createElement('canvas');
    offCanvas.width = 100;
    offCanvas.height = 100;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(img, 0, 0, 100, 100);
    const imageData = offCtx.getImageData(0, 0, 100, 100).data;
    const totalPixels = 100 * 100;

    const colorThief = new ColorThief();
    const tempImg = new Image();
    tempImg.crossOrigin = 'Anonymous';
    tempImg.src = imgPreview;
    await new Promise((resolve, reject) => {
      tempImg.onload = resolve;
      tempImg.onerror = reject;
    });
    let paletteColors = [];
    try {
      paletteColors = colorThief.getPalette(tempImg, numColors);
    } catch (error) {
      console.error('Error extracting palette:', error);
      Sentry.captureException(error);
    }

    const colorDistance = (c1, c2) => {
      return Math.sqrt(
        Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
      );
    };

    let counts = new Array(paletteColors.length).fill(0);
    for (let i = 0; i < imageData.length; i += 4) {
      const pixel = [imageData[i], imageData[i + 1], imageData[i + 2]];
      let minDistance = Infinity;
      let idx = 0;
      paletteColors.forEach((col, index) => {
        const dist = colorDistance(pixel, col);
        if (dist < minDistance) {
          minDistance = dist;
          idx = index;
        }
      });
      counts[idx]++;
    }

    const percentages = counts.map((count) => (count / totalPixels) * 100);
    const paletteWithPerc = paletteColors.map((col, index) => ({
      color: `rgb(${col.join(',')})`,
      percentage: percentages[index]
    }));

    const sortedPalette = remix
      ? paletteWithPerc.sort(() => Math.random() - 0.5)
      : paletteWithPerc.sort((a, b) => a.percentage - b.percentage);

    setPalette(sortedPalette);
    renderArtwork({ canvas, colors: sortedPalette, pixelMe, remix, shape: 'rectangle' });
    console.log("Image analysis completed.");
  } catch (error) {
    console.error('Error during image analysis:', error);
    Sentry.captureException(error);
  } finally {
    setProcessing(false);
  }
}