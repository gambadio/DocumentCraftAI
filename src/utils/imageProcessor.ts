import { ImageElement } from '../types';

export class ImageProcessor {
  static async downloadImages(images: ImageElement[]): Promise<ImageElement[]> {
    const processedImages: ImageElement[] = [];
    
    for (const image of images) {
      try {
        if (image.url.startsWith('http')) {
          const response = await fetch(image.url);
          if (response.ok) {
            const blob = await response.blob();
            processedImages.push({
              ...image,
              blob
            });
          } else {
            // Keep original if download fails
            processedImages.push(image);
          }
        } else {
          // Local or data URL - keep as is
          processedImages.push(image);
        }
      } catch (error) {
        console.warn(`Failed to download image: ${image.url}`, error);
        processedImages.push(image);
      }
    }
    
    return processedImages;
  }

  static async convertToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      
      img.src = url;
    });
  }
}