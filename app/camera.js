import { Ionicons } from "@expo/vector-icons";
import { PixelData } from "@muellertek/pixel-data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CameraScreen() {
  const [camera, setCamera] = useState("back"); // "front" ou "back"
  const [photoUri, setPhotoUri] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  let cameraRef;

  // Alternar câmera
  const toggleCamera = () => setCamera(prev => (prev === "back" ? "front" : "back"));

  // Tirar foto
  const takePicture = async () => {
    if (!cameraRef) return;

    const photo = await cameraRef.takePictureAsync({ imageType: "png", quality: 1 });
    setPhotoUri(photo.uri);
  };

  // Salvar foto original
  const savePhoto = async () => {
    try {
      const stored = await AsyncStorage.getItem("photos");
      const photos = stored ? JSON.parse(stored) : [];
      photos.push(photoUri);
      await AsyncStorage.setItem("photos", JSON.stringify(photos));
      setPhotoUri("");
    } catch (e) {
      console.log("Erro ao salvar foto:", e);
    }
  };

  // Processar imagem (limiarizar / binarizar) e salvar
  const processAndSavePhoto = async () => {
    if (!photoUri) return;
    setIsProcessing(true);

    try {
      // Carregar pixels da imagem
      const pixels = await PixelData.fromImage(photoUri);

      // Limiarizar para 128
      const threshold = 128;
      for (let y = 0; y < pixels.height; y++) {
        for (let x = 0; x < pixels.width; x++) {
          const idx = (y * pixels.width + x) * 4;
          const r = pixels.data[idx];
          const g = pixels.data[idx + 1];
          const b = pixels.data[idx + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const value = gray > threshold ? 255 : 0;
          pixels.data[idx] = value;
          pixels.data[idx + 1] = value;
          pixels.data[idx + 2] = value;
          // mantém alpha
        }
      }

      // Gerar nova imagem
      const processedUri = await pixels.toDataURL(); // base64 URI
      const stored = await AsyncStorage.getItem("photosProcessed");
      const photos = stored ? JSON.parse(stored) : [];
      photos.push(processedUri);
      await AsyncStorage.setItem("photosProcessed", JSON.stringify(photos));

      setPhotoUri("");
      router.push("/galleryProcessed");
    } catch (e) {
      console.error("Erro no processamento da imagem:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (permission?.granted === false) {
    return (
      <View style={styles.center}>
        <Text>Permissão negada. Ative nas configurações do app.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={{ color: "#fff" }}>Solicitar permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {permission?.granted === true && (
        <>
          {!photoUri ? (
            <CameraView
              style={styles.camera}
              facing={camera}
              ref={ref => (cameraRef = ref)}
            >
              <TouchableOpacity style={styles.switchButton} onPress={toggleCamera}>
                <Ionicons name="camera-reverse" size={35} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureButton} onPress={takePicture} />

              <TouchableOpacity style={styles.galleryButton} onPress={() => router.push("/gallery")}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Galeria</Text>
              </TouchableOpacity>
            </CameraView>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: photoUri }} style={styles.preview} />
              {isProcessing && <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={() => setPhotoUri("")}>
                  <Text style={styles.buttonText}>Tirar Outra</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={savePhoto}>
                  <Text style={styles.buttonText}>Salvar Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={processAndSavePhoto}>
                  <Text style={styles.buttonText}>Processar & Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  switchButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#00000088",
    padding: 10,
    borderRadius: 30,
  },
  captureButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "#ccc",
  },
  galleryButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#00000088",
    padding: 10,
    borderRadius: 8,
  },
  previewContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  preview: { width: 150, height: 150, borderWidth: 2, borderColor: "#fff", marginBottom: 20 },
  buttonRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  button: { backgroundColor: "#00000088", padding: 10, borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionButton: { marginTop: 20, backgroundColor: "#007AFF", padding: 10, borderRadius: 8 },
  loadingIndicator: { position: "absolute" },
});
