/**
 * Extract dominant colors from an image using canvas sampling.
 * Uses a simple k-means-like approach with median cut.
 */
export function extractColorsFromImage(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  sampleCount: number = 5
): [number, number, number][] {
  const canvas = document.createElement('canvas');
  const size = 100; // Downsample for performance
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(imageSource, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  const pixels: [number, number, number][] = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];
    // Skip transparent or near-transparent pixels
    if (a < 128) continue;
    pixels.push([r, g, b]);
  }

  if (pixels.length === 0) return [];
  return medianCut(pixels, sampleCount);
}

/**
 * Median cut color quantization.
 * Recursively splits the color space along the axis with the greatest range.
 */
function medianCut(
  pixels: [number, number, number][],
  targetCount: number
): [number, number, number][] {
  type Bucket = [number, number, number][];

  const buckets: Bucket[] = [pixels];

  while (buckets.length < targetCount) {
    // Find the bucket with the largest range in any channel
    let maxRange = -1;
    let maxBucketIdx = 0;
    let splitChannel = 0;

    buckets.forEach((bucket, idx) => {
      if (bucket.length < 2) return;
      for (let ch = 0; ch < 3; ch++) {
        const values = bucket.map((p) => p[ch]);
        const range = Math.max(...values) - Math.min(...values);
        if (range > maxRange) {
          maxRange = range;
          maxBucketIdx = idx;
          splitChannel = ch;
        }
      }
    });

    if (maxRange <= 0) break;

    const bucket = buckets.splice(maxBucketIdx, 1)[0];
    bucket.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const mid = Math.floor(bucket.length / 2);
    buckets.push(bucket.slice(0, mid), bucket.slice(mid));
  }

  // Average each bucket to get representative colors
  return buckets.map((bucket) => {
    const sum = [0, 0, 0];
    bucket.forEach((p) => {
      sum[0] += p[0];
      sum[1] += p[1];
      sum[2] += p[2];
    });
    const len = bucket.length;
    return [
      Math.round(sum[0] / len),
      Math.round(sum[1] / len),
      Math.round(sum[2] / len),
    ] as [number, number, number];
  });
}

/**
 * Get the color at a specific pixel coordinate from a canvas.
 */
export function getPixelColor(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): [number, number, number] | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  return [pixel[0], pixel[1], pixel[2]];
}
