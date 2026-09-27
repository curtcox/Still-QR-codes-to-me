import QRCode from 'qrcode';

export interface RasterArtwork { data: Uint8ClampedArray; width: number; height: number; }
export interface ArtworkOptions {
  text: string;
  artwork: RasterArtwork;
  size?: number;
  /** 0 = full-cell tonal correction. 1 = more original image between protected module centers. */
  strength?: number;
  /** Test other masks to find a better image/QR fit. */
  maskPattern?: number;
}
export interface ArtworkQR extends RasterArtwork {
  moduleCount: number;
  version: number;
  strength: number;
  maskPattern: number;
}
/**
 * Image-aware module-center projection. This is deterministic tone mapping, not diffusion.
 * Reserved cells and the quiet zone receive full correction. Elsewhere, smooth center
 * constraints leave the image's edges, microtexture and chroma visible between centers.
 */
export function composeArtwork(options: ArtworkOptions): ArtworkQR {
  const { text, artwork } = options;
  const size = options.size ?? 1024, strength = options.strength ?? .7;
  if (!text) throw new Error('Enter a payload for the image code.');
  if (!Number.isInteger(size) || size < 128 || size > 4096) throw new Error('Export size must be an integer between 128 and 4096 pixels.');
  if (!Number.isFinite(strength) || strength < 0 || strength > 1) throw new Error('Image strength must be between 0 and 1.');
  if (![artwork.width, artwork.height].every(n => Number.isInteger(n) && n > 0 && n <= 8192) || artwork.data.length !== artwork.width * artwork.height * 4) throw new Error('Artwork must contain valid RGBA pixels, with dimensions no greater than 8192.');
  if (options.maskPattern !== undefined && (!Number.isInteger(options.maskPattern) || options.maskPattern < 0 || options.maskPattern > 7)) throw new Error('QR mask must be an integer between 0 and 7.');
  // Choose among the eight legal masks to reduce tonal conflict with the source image.
  let selectedMask = options.maskPattern;
  if (selectedMask === undefined) {
    let bestScore = Infinity;
    const cropSize = Math.min(artwork.width, artwork.height);
    for (let mask = 0; mask < 8; mask++) {
      const candidate = QRCode.create(text, { errorCorrectionLevel: 'H', maskPattern: mask as QRCode.QRCodeMaskPattern });
      const count = candidate.modules.size;
      let score = 0;
      for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
        if (candidate.modules.isReserved(row, col)) continue;
        const sx = Math.min(artwork.width - 1, Math.floor((artwork.width - cropSize) / 2 + (col + 4.5) / (count + 8) * cropSize));
        const sy = Math.min(artwork.height - 1, Math.floor((artwork.height - cropSize) / 2 + (row + 4.5) / (count + 8) * cropSize));
        const index = (sy * artwork.width + sx) * 4, alpha = artwork.data[index + 3] / 255;
        const gray = (.2126 * artwork.data[index] + .7152 * artwork.data[index + 1] + .0722 * artwork.data[index + 2]) * alpha + 255 * (1 - alpha);
        score += Math.abs(gray - (candidate.modules.get(row, col) ? 40 : 230));
      }
      if (score < bestScore) { bestScore = score; selectedMask = mask; }
    }
  }
  const code = QRCode.create(text, { errorCorrectionLevel: 'H', maskPattern: selectedMask as QRCode.QRCodeMaskPattern | undefined });
  const n = code.modules.size, dimension = n + 8, pitch = size / dimension;
  const data = new Uint8ClampedArray(size * size * 4);
  const crop = Math.min(artwork.width, artwork.height), left = (artwork.width - crop) / 2, top = (artwork.height - crop) / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const mx = (x + .5) / pitch - 4, my = (y + .5) / pitch - 4;
    const col = Math.floor(mx), row = Math.floor(my);
    const quiet = col < 0 || row < 0 || col >= n || row >= n;
    const reserved = !quiet && !!code.modules.isReserved(row, col);
    const dark = !quiet && !!code.modules.get(row, col);
    const sx = Math.min(artwork.width - 1, Math.floor(left + x / size * crop));
    const sy = Math.min(artwork.height - 1, Math.floor(top + y / size * crop));
    const source = (sy * artwork.width + sx) * 4, target = (y * size + x) * 4;
    if (reserved || quiet) {
      const tone = dark ? 28 : 248;
      data[target] = data[target + 1] = data[target + 2] = tone;
      data[target + 3] = 255;
      continue;
    }
    const alpha = artwork.data[source + 3] / 255;
    const rgb = [0, 1, 2].map(c => artwork.data[source + c] * alpha + 255 * (1 - alpha));
    // Smooth radial falloff avoids tiny hard-edged central squares at high artistic strength.
    const distance = Math.hypot(mx - col - .5, my - row - .5);
    const core = .5 - strength * .28;
    const t = Math.max(0, Math.min(1, (distance - core) / (.71 - core)));
    const weight = quiet || reserved ? 1 : 1 - strength * .88 * t * t * (3 - 2 * t);
    const peak = Math.max(...rgb, 1), low = Math.min(...rgb);
    for (let c = 0; c < 3; c++) {
      // Retain hue and local microtexture while bounding the corrected RGB intensity.
      const corrected = dark ? rgb[c] * Math.min(1, 78 / peak) : rgb[c] + (255 - rgb[c]) * Math.max(0, (220 - low) / Math.max(1, 255 - low));
      data[target + c] = rgb[c] * (1 - weight) + corrected * weight;
    }
    data[target + 3] = 255;
  }
  return { data, width: size, height: size, moduleCount: n, version: code.version, strength, maskPattern: code.maskPattern! };
}
/** Only canonical PNG data URIs, produced by the raster wrappers, enter exported SVGs. */
export function artworkSVG(pngDataURI: string, size: number): string {
  if (!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(pngDataURI)) throw new Error('Expected an embedded PNG data URI.');
  if (!Number.isInteger(size) || size < 128 || size > 4096) throw new Error('Invalid image export size.');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Image-integrated QR code"><title>Image-integrated QR code</title><image width="${size}" height="${size}" href="${pngDataURI}"/></svg>`;
}
