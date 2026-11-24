import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";

import { CATEGORIAS, formatearCOP } from "../data/productos";

export default function Catalogo({
  productos,
  favoritos,
  onAlternarFavorito,
  onAgregarCarrito,
  onVerDetalle,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [ordenPrecio, setOrdenPrecio] = useState("ninguno"); // 'ninguno' | 'asc' | 'desc'

  // Filtrar por busqueda y categoria
  const productosFiltrados = productos
    .filter((p) => {
      const coincideTexto = p.nombre
        .toLowerCase()
        .includes(busqueda.trim().toLowerCase());
      const coincideCat =
        categoriaActiva === "Todas" || p.categoria === categoriaActiva;
      return coincideTexto && coincideCat;
    })
    .sort((a, b) => {
      if (ordenPrecio === "asc") return a.precio - b.precio;
      if (ordenPrecio === "desc") return b.precio - a.precio;
      return 0;
    });

  const cambiarOrden = () => {
    if (ordenPrecio === "ninguno") setOrdenPrecio("asc");
    else if (ordenPrecio === "asc") setOrdenPrecio("desc");
    else setOrdenPrecio("ninguno");
  };

  const textoOrden =
    ordenPrecio === "asc"
      ? "Orden: Menor a mayor"
      : ordenPrecio === "desc"
        ? "Orden: Mayor a menor"
        : "Ordenar por precio";

  return (
    <View style={styles.contenedor}>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar producto..."
        placeholderTextColor="#64748B"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Filtros de categoria */}
      <View style={styles.filaCategorias}>
        {CATEGORIAS.map((cat) => {
          const activa = categoriaActiva === cat;
          return (
            <Pressable
              key={cat}
              style={[styles.chip, activa && styles.chipActivo]}
              onPress={() => setCategoriaActiva(cat)}
            >
              <Text
                style={[styles.chipTexto, activa && styles.chipTextoActivo]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.botonOrden} onPress={cambiarOrden}>
        <Text style={styles.textoOrden}>{textoOrden}</Text>
      </Pressable>

      {productosFiltrados.length === 0 ? (
        <View style={styles.vacioBox}>
          <Text style={styles.vacioTexto}>No encontramos productos</Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => {
            const esFav = favoritos.includes(item.id);
            const agotado = item.stock === 0;
            const iniciales = item.nombre.slice(0, 2).toUpperCase();

            return (
              <Pressable
                style={styles.tarjeta}
                onPress={() => onVerDetalle(item.id)}
              >
                {item.imagen ? (
                  <Image
                    source={{ uri: item.imagen }}
                    style={styles.imagenProducto}
                  />
                ) : (
                  <View style={styles.recuadroImagen}>
                    <Text style={styles.inicialesProducto}>{iniciales}</Text>
                  </View>
                )}

                <View style={styles.info}>
                  <Text style={styles.categoria}>{item.categoria}</Text>
                  <Text style={styles.nombre}>{item.nombre}</Text>
                  <Text style={styles.precio}>
                    {formatearCOP(item.precio)} COP
                  </Text>
                  <Text style={[styles.stock, agotado && styles.stockAgotado]}>
                    {agotado ? "Agotado" : `Disponibles: ${item.stock}`}
                  </Text>
                </View>

                <View style={styles.acciones}>
                  <Pressable
                    style={styles.btnFav}
                    onPress={() => onAlternarFavorito(item.id)}
                  >
                    <Text style={styles.textoFav}>
                      {esFav ? "Quitar Fav" : "Favorito"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.btnAgregar,
                      agotado && styles.btnDeshabilitado,
                    ]}
                    onPress={() => onAgregarCarrito(item, 1)}
                    disabled={agotado}
                  >
                    <Text style={styles.textoAgregar}>+ Agregar</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 12 },
  buscador: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    color: "#0F172A",
  },
  filaCategorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipActivo: { backgroundColor: "#1E3A5F" },
  chipTexto: { fontSize: 12, color: "#334155", fontWeight: "600" },
  chipTextoActivo: { color: "#FFFFFF" },
  botonOrden: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  textoOrden: { fontSize: 12, color: "#1E3A5F", fontWeight: "600" },
  lista: { paddingBottom: 20, gap: 10 },
  tarjeta: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    gap: 10,
  },
  recuadroImagen: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  inicialesProducto: { fontWeight: "bold", color: "#1E3A5F", fontSize: 16 },
  info: { flex: 1 },
  categoria: { fontSize: 11, color: "#475569" },
  nombre: { fontSize: 14, fontWeight: "bold", color: "#0F172A" },
  precio: { fontSize: 14, fontWeight: "bold", color: "#1E3A5F", marginTop: 2 },
  stock: { fontSize: 12, color: "#475569" },
  stockAgotado: { color: "#DC2626", fontWeight: "bold" },
  acciones: { gap: 6, alignItems: "flex-end" },
  btnFav: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#475569",
  },
  textoFav: { fontSize: 11, color: "#475569", fontWeight: "600" },
  btnAgregar: {
    backgroundColor: "#1E3A5F",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnDeshabilitado: { backgroundColor: "#94A3B8" },
  textoAgregar: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
  vacioBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  vacioTexto: { fontSize: 15, color: "#475569" },

  imagenProducto: {
  width: 54,
  height: 54,
  borderRadius: 8,
  backgroundColor: '#E2E8F0',
},


});
