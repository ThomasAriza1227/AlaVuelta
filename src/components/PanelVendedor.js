import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { CATEGORIAS, formatearCOP } from '../data/productos';

export default function PanelVendedor({ productos, onGuardarProducto }) {
  const categoriasValidas = CATEGORIAS.filter((c) => c !== 'Todas');

  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState(categoriasValidas[0]);
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const limpiarFormulario = () => {
    setIdEditando(null);
    setNombre('');
    setCategoria(categoriasValidas[0]);
    setPrecio('');
    setStock('');
    setDescripcion('');
  };

  const cargarParaEditar = (prod) => {
    setIdEditando(prod.id);
    setNombre(prod.nombre);
    setCategoria(prod.categoria);
    setPrecio(String(prod.precio));
    setStock(String(prod.stock));
    setDescripcion(prod.descripcion);
  };

  const guardar = () => {
    const precioNum = Number(precio);
    const stockNum = Number(stock);

    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio.');
      return;
    }
    if (!Number.isInteger(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'El precio debe ser un número entero mayor a 0.');
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      Alert.alert('Error', 'El stock debe ser un número entero mayor o igual a 0.');
      return;
    }
    if (descripcion.trim().length < 15) {
      Alert.alert('Error', 'La descripción debe tener al menos 15 caracteres.');
      return;
    }

    onGuardarProducto(
      {
        id: idEditando,
        nombre: nombre.trim(),
        categoria,
        precio: precioNum,
        stock: stockNum,
        descripcion: descripcion.trim(),
      },
      Boolean(idEditando)
    );

    Alert.alert('Listo', idEditando ? 'Producto actualizado.' : 'Producto creado en el catálogo.');
    limpiarFormulario();
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>
        {idEditando ? `Editando ${idEditando}` : 'Agregar Nuevo Producto'}
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          value={nombre}
          onChangeText={setNombre}
        />

        <View style={styles.filaCats}>
          {categoriasValidas.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.chip, categoria === cat && styles.chipActivo]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={[styles.chipTexto, categoria === cat && styles.chipTextoActivo]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Precio en COP (ej: 45000)"
          keyboardType="numeric"
          value={precio}
          onChangeText={setPrecio}
        />

        <TextInput
          style={styles.input}
          placeholder="Stock disponible (ej: 10)"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <TextInput
          style={styles.input}
          placeholder="Descripción (mínimo 15 caracteres)"
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Pressable style={styles.btnGuardar} onPress={guardar}>
          <Text style={styles.textoGuardar}>
            {idEditando ? 'Actualizar Producto' : 'Registrar Producto'}
          </Text>
        </Pressable>

        {idEditando && (
          <Pressable style={styles.btnCancelar} onPress={limpiarFormulario}>
            <Text style={styles.textoCancelar}>Cancelar edición</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.subtitulo}>Productos actuales (toca para editar)</Text>
      {productos.map((prod) => (
        <Pressable
          key={prod.id}
          style={styles.itemLista}
          onPress={() => cargarParaEditar(prod)}
        >
          <Text style={styles.itemNombre}>
            {prod.id} - {prod.nombre}
          </Text>
          <Text style={styles.itemSub}>
            {prod.categoria} | {formatearCOP(prod.precio)} | Stock: {prod.stock}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 10 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filaCats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipActivo: { backgroundColor: '#1E3A5F' },
  chipTexto: { fontSize: 12, color: '#334155' },
  chipTextoActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  btnGuardar: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoGuardar: { color: '#FFFFFF', fontWeight: 'bold' },
  btnCancelar: { alignItems: 'center', paddingVertical: 6 },
  textoCancelar: { color: '#475569', fontSize: 13 },
  subtitulo: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginTop: 6 },
  itemLista: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemNombre: { fontWeight: 'bold', color: '#0F172A', fontSize: 13 },
  itemSub: { fontSize: 12, color: '#475569', marginTop: 2 },
});