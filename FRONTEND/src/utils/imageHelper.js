export const DEFAULT_LOT_IMAGE = '/images/IMG20260604134124.jpg';

export const LOT_FALLBACK_IMAGES = [
  '/images/IMG20260604134124.jpg',
  '/images/IMG20260604134315.jpg',
  '/images/IMG20260604134341.jpg',
  '/images/IMG20260604134345.jpg',
  '/images/IMG20260604134348.jpg',
  '/images/IMG20260604134353.jpg'
];

/**
 * Normalizes an image URL, converting unsupported schemes (like Flutter asset://)
 * or invalid strings to a valid public web path.
 */
export const normalizeImageUrl = (url, fallback = DEFAULT_LOT_IMAGE) => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (
    trimmed === '' || 
    trimmed.startsWith('asset://') || 
    trimmed.startsWith('file://') ||
    (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/'))
  ) {
    return fallback;
  }
  return trimmed;
};

/**
 * Normalizes an array of image URLs, filtering out any invalid paths.
 */
export const normalizeImagesList = (images, singleImageUrl = null) => {
  if (Array.isArray(images) && images.length > 0) {
    const valid = images
      .map((img) => normalizeImageUrl(img, ''))
      .filter((img) => img !== '');
    if (valid.length > 0) return valid;
  }
  const primary = normalizeImageUrl(singleImageUrl, '');
  if (primary) return [primary];
  return LOT_FALLBACK_IMAGES;
};

/**
 * Image onError handler to cleanly replace broken images with default fallback
 */
export const handleImageError = (e, fallback = DEFAULT_LOT_IMAGE) => {
  if (e?.currentTarget && e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
};
