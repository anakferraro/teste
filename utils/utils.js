import { getPixelData } from '@muellertek/pixel-data';
import Expo2DContext from 'expo-2d-context';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';


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


function pngEncode(data, width, height) {

  return '';
}

