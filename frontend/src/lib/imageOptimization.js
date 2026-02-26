/**
 * Image Optimization Utility
 * Compresses and resizes images before upload to reduce file size
 */

// Maximum dimensions for uploaded images
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8; // 80% quality

/**
 * Compress and resize an image
 * @param {string} base64Image - Base64 encoded image string
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Compressed base64 image string
 */
export const compressImage = (base64Image, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = MAX_WIDTH,
      maxHeight = MAX_HEIGHT,
      quality = QUALITY,
      outputFormat = 'image/jpeg'
    } = options;

    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed base64
      const compressedBase64 = canvas.toDataURL(outputFormat, quality);
      
      // Log compression results
      const originalSize = Math.round(base64Image.length * 0.75 / 1024);
      const compressedSize = Math.round(compressedBase64.length * 0.75 / 1024);
      console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${Math.round((1 - compressedSize/originalSize) * 100)}% reduction)`);
      
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = base64Image;
  });
};

/**
 * Compress multiple images
 * @param {string[]} images - Array of base64 images
 * @param {Object} options - Compression options
 * @returns {Promise<string[]>} - Array of compressed base64 images
 */
export const compressImages = async (images, options = {}) => {
  const compressed = await Promise.all(
    images.map(img => compressImage(img, options))
  );
  return compressed;
};

/**
 * Get file size from base64 string
 * @param {string} base64 - Base64 encoded string
 * @returns {number} - Size in KB
 */
export const getBase64Size = (base64) => {
  // Remove data URL prefix if present
  const base64Data = base64.split(',')[1] || base64;
  // Base64 encoding increases size by ~33%, so divide by 1.33
  return Math.round(base64Data.length * 0.75 / 1024);
};

/**
 * Check if image needs compression
 * @param {string} base64Image - Base64 encoded image
 * @param {number} maxSizeKB - Maximum size in KB (default 500KB)
 * @returns {boolean}
 */
export const needsCompression = (base64Image, maxSizeKB = 500) => {
  return getBase64Size(base64Image) > maxSizeKB;
};

/**
 * Auto-compress image if it exceeds size limit
 * @param {string} base64Image - Base64 encoded image
 * @param {number} maxSizeKB - Maximum size in KB
 * @returns {Promise<string>} - Compressed or original image
 */
export const autoCompressImage = async (base64Image, maxSizeKB = 500) => {
  if (!needsCompression(base64Image, maxSizeKB)) {
    return base64Image;
  }
  
  // Start with higher quality and reduce if needed
  let quality = 0.9;
  let compressed = base64Image;
  
  while (needsCompression(compressed, maxSizeKB) && quality > 0.3) {
    compressed = await compressImage(base64Image, { quality });
    quality -= 0.1;
  }
  
  return compressed;
};

export default {
  compressImage,
  compressImages,
  getBase64Size,
  needsCompression,
  autoCompressImage
};
