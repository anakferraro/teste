import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { binarizeImageFromUri } from "../utils/utils";

export default function GalleryScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    const stored = await AsyncStorage.getItem("photos");
    setPhotos(stored ? JSON.parse(stored) : []);
  }

  async function deletePhoto(index) {
    const updated = photos.filter((_, i) => i !== index);
    await AsyncStorage.setItem("photos", JSON.stringify(updated));
    setPhotos(updated);
  }

  async function deleteAllPhotos() {
    Alert.alert("Confirmar", "Deseja apagar todas as fotos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("photos");
          setPhotos([]);
        },
      },
    ]);
  }

  const processPhoto = async (photoUri) => {
    setIsProcessing(true);
    try {
      const processedUri = await binarizeImageFromUri(photoUri, 128);

      const stored = await AsyncStorage.getItem("photosProcessed");
      const processedPhotos = stored ? JSON.parse(stored) : [];
      processedPhotos.push(processedUri);
      await AsyncStorage.setItem("photosProcessed", JSON.stringify(processedPhotos));

      router.push("/galleryProcessed");
    } catch (e) {
      console.log("Erro ao processar a foto:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (photos.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Nenhuma foto encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={deleteAllPhotos} style={styles.deleteAllButton}>
        <Text style={styles.deleteAllText}>Apagar todas as fotos</Text>
      </TouchableOpacity>
      {isProcessing && <ActivityIndicator size="large" color="#1e90ff" />}

      <FlatList
        data={photos}
        numColumns={2}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.photoContainer}>
            <Image source={{ uri: item }} style={styles.photo} />
            <TouchableOpacity
              style={styles.processButton}
              onPress={() => processPhoto(item)}
              disabled={isProcessing}
            >
              <Text style={styles.processText}>Processar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePhoto(index)}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.gallery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  gallery: { justifyContent: "center" },
  photoContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  photo: { width: "100%", height: "100%" },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },
  deleteText: { color: "#fff", fontWeight: "bold" },
  deleteAllButton: {
    backgroundColor: "#c00",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 10,
  },
  deleteAllText: {
    color: "#fff",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  processButton: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 8,
  },
  processText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
