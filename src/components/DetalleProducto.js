import React, { useState } from "react";
import { formatearCOP } from "../data/productos";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from "react-native";

export default function DetalleProducto({
  producto,
  esFavorito,
  onAlternarFavorito,
  onAgregarCarrito,
  onCalificar,
  onVolver,
}) {
  const [estrellasInput, setEstrellasInput] = useState("");
  const agotado = producto.stock === 0;

  const calificaciones = producto.calificaciones || [];
  const promedio =
    calificaciones.length > 0
      ? (
          calificaciones.reduce((acc, val) => acc + val, 0) /
          calificaciones.length
        ).toFixed(1)
      : "Sin valoraciones";

  const enviarResena = () => {
    const valor = Number(estrellasInput);
    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
      Alert.alert("Valor inválido", "Ingresa un número entero entre 1 y 5.");
      return;
    }
    onCalificar(producto.id, valor);
    setEstrellasInput("");
    Alert.alert("Gracias", "Tu calificación ha sido registrada.");
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Pressable style={styles.btnVolver} onPress={onVolver}>
        <Text style={styles.textoVolver}>Volver al catálogo</Text>
      </Pressable>

      <View style={styles.tarjeta}>
        {producto.imagen ? (
          <Image
            source={{ uri: producto.imagen }}
            style={styles.imagenDetalle}
          />
        ) : (
          <View style={styles.banner}>
            <Text style={styles.bannerTexto}>
              {producto.nombre.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.categoria}>{producto.categoria}</Text>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.precio}>{formatearCOP(producto.precio)} COP</Text>

        <Text style={[styles.stock, agotado && styles.agotado]}>
          {agotado
            ? "Producto Agotado"
            : `Stock disponible: ${producto.stock} unidades`}
        </Text>

        <Text style={styles.promedio}>
          Calificación promedio: {promedio} / 5 ({calificaciones.length}{" "}
          reseñas)
        </Text>

        <Text style={styles.subtitulo}>Descripción</Text>
        <Text style={styles.descripcion}>{producto.descripcion}</Text>

        <View style={styles.filaBotones}>
          <Pressable
            style={styles.btnFavorito}
            onPress={() => onAlternarFavorito(producto.id)}
          >
            <Text style={styles.textoFavorito}>
              {esFavorito ? "Quitar de Favoritos" : "Guardar en Favoritos"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.btnComprar, agotado && styles.btnBloqueado]}
            onPress={() => onAgregarCarrito(producto, 1)}
            disabled={agotado}
          >
            <Text style={styles.textoComprar}>
              {agotado ? "Agotado" : "Añadir al Carrito"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* reseñas */}
      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Calificar este producto (1 a 5)</Text>
        <View style={styles.filaResena}>
          <TextInput
            style={styles.inputEstrellas}
            placeholder="Ej: 5"
            keyboardType="numeric"
            value={estrellasInput}
            onChangeText={setEstrellasInput}
          />
          <Pressable style={styles.btnCalificar} onPress={enviarResena}>
            <Text style={styles.textoCalificar}>Guardar nota</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 12 },
  btnVolver: { alignSelf: "flex-start", paddingVertical: 6 },
  textoVolver: { color: "#1E3A5F", fontWeight: "bold", fontSize: 14 },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  banner: {
    height: 110,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  bannerTexto: { fontSize: 32, fontWeight: "bold", color: "#1E3A5F" },
  categoria: { fontSize: 12, color: "#475569" },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginVertical: 4,
  },
  precio: { fontSize: 18, fontWeight: "bold", color: "#1E3A5F" },
  stock: { fontSize: 13, color: "#334155", marginTop: 6 },
  agotado: { color: "#DC2626", fontWeight: "bold" },
  promedio: { fontSize: 13, color: "#475569", marginTop: 4 },
  subtitulo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 12,
    marginBottom: 4,
  },
  descripcion: { fontSize: 14, color: "#334155", lineHeight: 20 },
  filaBotones: { flexDirection: "row", gap: 10, marginTop: 16 },
  btnFavorito: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1E3A5F",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  textoFavorito: { color: "#1E3A5F", fontWeight: "bold", fontSize: 13 },
  btnComprar: {
    flex: 1,
    backgroundColor: "#1E3A5F",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnBloqueado: { backgroundColor: "#94A3B8" },
  textoComprar: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  filaResena: { flexDirection: "row", gap: 10, marginTop: 6 },
  inputEstrellas: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnCalificar: {
    backgroundColor: "#475569",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 8,
  },
  textoCalificar: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },

  imagenDetalle: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    resizeMode: "contain",
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },
});
