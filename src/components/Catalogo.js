import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { CATEGORIAS, formatearCOP, obtenerStockProducto } from '../data/productos';

export default function Catalogo({
  productos,
  favoritos,
  comparacion,
  onAlternarFavorito,
  onAlternarComparacion,
  onAgregarCarrito,
  onVerDetalle,
}) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [marcaActiva, setMarcaActiva] = useState('Todas');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno');

  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');
  const [rangoAplicado, setRangoAplicado] = useState({ min: null, max: null });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const marcasDisponibles = [
    'Todas',
    ...Array.from(new Set(productos.map((p) => p.marca).filter(Boolean))),
  ];

  const aplicarRangoPrecios = () => {
    const min = minInput.trim() !== '' ? Number(minInput) : null;
    const max = maxInput.trim() !== '' ? Number(maxInput) : null;

    if ((min !== null && isNaN(min)) || (max !== null && isNaN(max))) {
      Alert.alert('Dato inválido', 'Ingresa valores numéricos válidos para el precio.');
      return;
    }

    if (min !== null && max !== null && min > max) {
      Alert.alert('Rango inválido', 'El precio mínimo no puede ser mayor que el máximo.');
      return;
    }

    setRangoAplicado({ min, max });
  };

  const restablecerFiltros = () => {
    setBusqueda('');
    setCategoriaActiva('Todas');
    setMarcaActiva('Todas');
    setSoloDisponibles(false);
    setOrdenPrecio('ninguno');
    setMinInput('');
    setMaxInput('');
    setRangoAplicado({ min: null, max: null });
  };

  const productosFiltrados = productos
    .filter((p) => {
      const stockTotal = obtenerStockProducto(p);
      const coincideTexto = p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase());
      const coincideCat = categoriaActiva === 'Todas' || p.categoria === categoriaActiva;
      const coincideMarca = marcaActiva === 'Todas' || p.marca === marcaActiva;
      const coincideStock = !soloDisponibles || stockTotal > 0;
      const coincideMin = rangoAplicado.min === null || p.precio >= rangoAplicado.min;
      const coincideMax = rangoAplicado.max === null || p.precio <= rangoAplicado.max;

      return (
        coincideTexto &&
        coincideCat &&
        coincideMarca &&
        coincideStock &&
        coincideMin &&
        coincideMax
      );
    })
    .sort((a, b) => {
      if (ordenPrecio === 'asc') return a.precio - b.precio;
      if (ordenPrecio === 'desc') return b.precio - a.precio;
      return 0;
    });

  const cambiarOrden = () => {
    if (ordenPrecio === 'ninguno') setOrdenPrecio('asc');
    else if (ordenPrecio === 'asc') setOrdenPrecio('desc');
    else setOrdenPrecio('ninguno');
  };

  const textoOrden =
    ordenPrecio === 'asc'
      ? 'Menor a mayor'
      : ordenPrecio === 'desc'
      ? 'Mayor a menor'
      : 'Ordenar precio';

  return (
    <View style={styles.contenedor}>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar producto..."
        placeholderTextColor="#64748B"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <View style={styles.filaCategorias}>
        {CATEGORIAS.map((cat) => {
          const activa = categoriaActiva === cat;
          return (
            <Pressable
              key={cat}
              style={[styles.chip, activa && styles.chipActivo]}
              onPress={() => setCategoriaActiva(cat)}
            >
              <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>{cat}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.filaControles}>
        <Pressable style={styles.botonOrden} onPress={cambiarOrden}>
          <Text style={styles.textoOrden}>{textoOrden}</Text>
        </Pressable>

        <Pressable
          style={[styles.botonOrden, mostrarFiltros && styles.chipActivo]}
          onPress={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <Text style={[styles.textoOrden, mostrarFiltros && styles.chipTextoActivo]}>
            {mostrarFiltros ? 'Ocultar filtros' : 'Más filtros'}
          </Text>
        </Pressable>

        <Pressable style={styles.botonRestablecer} onPress={restablecerFiltros}>
          <Text style={styles.textoRestablecer}>Restablecer</Text>
        </Pressable>
      </View>

      {mostrarFiltros && (
        <View style={styles.panelFiltros}>
          <Text style={styles.labelFiltro}>Marca:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {marcasDisponibles.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.chip, marcaActiva === m && styles.chipActivo]}
                  onPress={() => setMarcaActiva(m)}
                >
                  <Text style={[styles.chipTexto, marcaActiva === m && styles.chipTextoActivo]}>
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.labelFiltro}>Rango de precio (COP):</Text>
          <View style={styles.filaRango}>
            <TextInput
              style={styles.inputPrecio}
              placeholder="Mínimo"
              keyboardType="numeric"
              value={minInput}
              onChangeText={setMinInput}
            />
            <TextInput
              style={styles.inputPrecio}
              placeholder="Máximo"
              keyboardType="numeric"
              value={maxInput}
              onChangeText={setMaxInput}
            />
            <Pressable style={styles.btnAplicarRango} onPress={aplicarRangoPrecios}>
              <Text style={styles.textoAplicarRango}>Filtrar</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.chip, soloDisponibles && styles.chipActivo, { alignSelf: 'flex-start' }]}
            onPress={() => setSoloDisponibles(!soloDisponibles)}
          >
            <Text style={[styles.chipTexto, soloDisponibles && styles.chipTextoActivo]}>
              Solo productos con stock
            </Text>
          </Pressable>
        </View>
      )}

      {productosFiltrados.length === 0 ? (
        <View style={styles.vacioBox}>
          <Text style={styles.vacioTexto}>No encontramos productos con esos filtros</Text>
          <Pressable style={styles.btnAplicarRango} onPress={restablecerFiltros}>
            <Text style={styles.textoAplicarRango}>Ver todo el catálogo</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => {
            const esFav = favoritos.includes(item.id);
            const enComp = comparacion.includes(item.id);
            const stockTotal = obtenerStockProducto(item);
            const agotado = stockTotal === 0;
            const iniciales = item.nombre.slice(0, 2).toUpperCase();
            const tieneVariantes = item.variantes && item.variantes.length > 0;

            return (
              <Pressable style={styles.tarjeta} onPress={() => onVerDetalle(item.id)}>
                {item.imagen ? (
                  <Image source={{ uri: item.imagen }} style={styles.imagenProducto} />
                ) : (
                  <View style={styles.recuadroImagen}>
                    <Text style={styles.inicialesProducto}>{iniciales}</Text>
                  </View>
                )}

                <View style={styles.info}>
                  <Text style={styles.categoria}>
                    {item.categoria} · {item.marca || 'Local'}
                  </Text>
                  <Text style={styles.nombre}>{item.nombre}</Text>
                  <Text style={styles.precio}>{formatearCOP(item.precio)} COP</Text>
                  <Text style={[styles.stock, agotado && styles.stockAgotado]}>
                    {agotado ? 'Agotado' : `Disponibles: ${stockTotal}`}
                  </Text>
                </View>

                <View style={styles.acciones}>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Pressable
                      style={[styles.btnMini, enComp && styles.btnMiniActivo]}
                      onPress={() => onAlternarComparacion(item.id)}
                    >
                      <Text style={[styles.textoMini, enComp && styles.textoMiniActivo]}>
                        {enComp ? 'Comparando' : 'Comparar'}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[styles.btnMini, esFav && styles.btnMiniActivo]}
                      onPress={() => onAlternarFavorito(item.id)}
                    >
                      <Text style={[styles.textoMini, esFav && styles.textoMiniActivo]}>
                        {esFav ? 'Fav' : '+Fav'}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={[styles.btnAgregar, agotado && styles.btnDeshabilitado]}
                    onPress={() =>
                      tieneVariantes ? onVerDetalle(item.id) : onAgregarCarrito(item)
                    }
                    disabled={agotado}
                  >
                    <Text style={styles.textoAgregar}>
                      {tieneVariantes ? 'Elegir opción' : '+ Agregar'}
                    </Text>
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    color: '#0F172A',
  },
  filaCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  chipActivo: { backgroundColor: '#1E3A5F' },
  chipTexto: { fontSize: 12, color: '#334155', fontWeight: '600' },
  chipTextoActivo: { color: '#FFFFFF' },
  filaControles: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  botonOrden: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  textoOrden: { fontSize: 12, color: '#1E3A5F', fontWeight: '600' },
  botonRestablecer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  textoRestablecer: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  panelFiltros: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 8,
    gap: 6,
  },
  labelFiltro: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
  filaRango: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  inputPrecio: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 12,
  },
  btnAplicarRango: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  textoAplicarRango: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  lista: { paddingBottom: 20, gap: 10 },
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 10,
  },
  imagenProducto: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  recuadroImagen: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicialesProducto: { fontWeight: 'bold', color: '#1E3A5F', fontSize: 16 },
  info: { flex: 1 },
  categoria: { fontSize: 11, color: '#475569' },
  nombre: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  precio: { fontSize: 14, fontWeight: 'bold', color: '#1E3A5F', marginTop: 2 },
  stock: { fontSize: 12, color: '#475569' },
  stockAgotado: { color: '#DC2626', fontWeight: 'bold' },
  acciones: { gap: 6, alignItems: 'flex-end' },
  btnMini: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  btnMiniActivo: { backgroundColor: '#1E3A5F', borderColor: '#1E3A5F' },
  textoMini: { fontSize: 10, color: '#475569', fontWeight: '600' },
  textoMiniActivo: { color: '#FFFFFF' },
  btnAgregar: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnDeshabilitado: { backgroundColor: '#94A3B8' },
  textoAgregar: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  vacioBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  vacioTexto: { fontSize: 14, color: '#475569' },
});