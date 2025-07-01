export interface VehicleImage {
  url: string;
  public_id: string;
}

/**
 * Convert image objects to JSON strings for database storage
 */
export function imagesToStrings(images: VehicleImage[]): string[] {
  if (!Array.isArray(images)) return [];

  return images
    .filter((img) => img && img.url && img.public_id) // Filter out invalid images
    .map((img) => JSON.stringify(img));
}

/**
 * Convert JSON strings from database to image objects
 */
export function stringsToImages(strings: string[]): VehicleImage[] {
  if (!Array.isArray(strings)) return [];

  return strings
    .map((str) => {
      try {
        const parsed = JSON.parse(str);
        // Validate the parsed object has required properties
        if (
          parsed &&
          typeof parsed.url === 'string' &&
          typeof parsed.public_id === 'string'
        ) {
          return parsed as VehicleImage;
        }
        return null;
      } catch (error) {
        console.warn('Failed to parse vehicle image:', str, error);
        return null;
      }
    })
    .filter((img): img is VehicleImage => img !== null);
}

/**
 * Validate and sanitize image array
 */
export function validateImages(images: any): VehicleImage[] {
  if (!images) return [];

  if (Array.isArray(images)) {
    // If it's already an array of objects
    if (images.length > 0 && typeof images[0] === 'object') {
      return images.filter((img) => img && img.url && img.public_id);
    }
    // If it's an array of strings (from database)
    if (images.length > 0 && typeof images[0] === 'string') {
      return stringsToImages(images);
    }
  }

  return [];
}
