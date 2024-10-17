import { compressToBase64, decompressFromBase64 } from 'lz-string';

export const jsonCompressor = {
  compress: <T extends object>(json: T): string => {
    return compressToBase64(JSON.stringify(json));
  },
  decompress: <T extends object>(compressedJson: string): T => {
    try {
      return JSON.parse(decompressFromBase64(compressedJson));
    } catch (error) {
      console.error('Error decompressing JSON', error);
      throw error;
    }
  },
};
