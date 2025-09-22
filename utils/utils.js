import { getPixelData } from '@muellertek/pixel-data';
import Expo2DContext from 'expo-2d-context';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

/**
 * Binariza a imagem (preto e branco) e salva no cache do app.
 * @param {string} uri - URI da imagem original.
 * @param {number} threshold - Valor de corte para binarização (0-255).
 * @returns {Promise<string>} URI da imagem processada.
 */
export async function binarizeImageFromUri(uri, threshold = 128) {
  try {
    // Carrega o asset a partir do URI
    const asset = await Asset.fromURI(uri).downloadAsync();

    // Cria source para pixel-data
    const source = {
      asset,
      width: asset.width,
      height: asset.height,
    };

    // Cria contexto 2D
    const gl = new Expo2DContext(null, {});
    
    // Extrai dados de pixel
    const pixelData = await getPixelData({ expo2dContext: gl, source });

    const data = pixelData.data; // Uint8ClampedArray RGBA
    const width = pixelData.width;
    const height = pixelData.height;

    // Binarização simples
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const value = avg >= threshold ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      // data[i + 3] permanece alfa
    }

    // Cria nova imagem PNG
    const outputUri = `${FileSystem.cacheDirectory}processed_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(outputUri, pngEncode(data, width, height), {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outputUri;
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    throw error;
  }
}

/**
 * Função simples para converter RGBA Uint8ClampedArray em base64 PNG
 * Aqui você pode usar uma biblioteca adicional como 'fast-png' ou 'pngjs' se necessário.
 */
function pngEncode(data, width, height) {
  // Para fins de exemplo, você pode usar 'react-native-png' ou outra lib
  // Aqui retornamos vazio, substitua por implementação real
  return '';
}
