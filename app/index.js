// Tela inicial do app
// Mostra botoes para abrir camera ou galeria

import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter(); // Hook para navegar entre telas

  return (
    <View style={styles.container}>
      {/* Titulo da tela */}
      <Text style={styles.title}>Meu App de Camera</Text>

      {/* Botao para abrir camera */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/camera")}
      >
        <Text style={styles.buttonText}>Abrir Camera</Text>
      </TouchableOpacity>

      {/* Botao para abrir galeria */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/gallery")}
      >
        <Text style={styles.buttonText}>Abrir Galeria</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos da tela
const styles = StyleSheet.create({
  container: {
    flex: 1, // ocupa toda tela
    justifyContent: "center", // centraliza vertical
    alignItems: "center", // centraliza horizontal
    backgroundColor: "#000", // fundo preto
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});