import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GalleryProcessed() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    const stored = await AsyncStorage.getItem("photosProcessed");
    const list = stored ? JSON.parse(stored) : [];
    setPhotos(list.reverse()); // mais recente primeiro
  }

  async function deletePhoto(index) {
    const updated = photos.filter((_, i) => i !== index);
    await AsyncStorage.setItem("photosProcessed", JSON.stringify(updated));
    setPhotos(updated);
  }

  async function deleteAllPhotos() {
    Alert.alert("Confirmar", "Deseja apagar todas as fotos processadas?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("photosProcessed");
          setPhotos([]);
        },
      },
    ]);
  }

  if (!photos.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Nenhuma foto processada ainda.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão apagar todas */}
      <TouchableOpacity onPress={deleteAllPhotos} style={styles.deleteAllButton}>
        <Text style={styles.deleteAllText}>Apagar todas as fotos processadas</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ alignItems: "center", padding: 10 }}
      >
        {photos.map((uri, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePhoto(index)}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: { flex: 1 },
  photoContainer: {
    position: "relative",
    marginBottom: 20,
  },
  image: { width: 300, height: 300, borderRadius: 8 },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
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
    marginVertical: 10,
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
});
