import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTOS_INICIALES } from './src/data/productos';
import Catalogo from './src/components/Catalogo';
import DetalleProducto from './src/components/DetalleProducto';
import Carrito from './src/components/Carrito';
import Favoritos from './src/components/Favoritos';
import Historial from './src/components/Historial';
import PanelVendedor from './src/components/PanelVendedor';

export default function App() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [carrito, setCarrito] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [vistaActual, setVistaActual] = useState('catalogo');
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState(null);

  // Cargar carrito y favoritos guardados al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const carritoGuardado = await AsyncStorage.getItem('@alavuelta_carrito');
        const favoritosGuardados = await AsyncStorage.getItem('@alavuelta_favoritos');
        if (carritoGuardado) {
          const parsedCarrito = JSON.parse(carritoGuardado);
          if (Array.isArray(parsedCarrito)) setCarrito(parsedCarrito);
        }
        if (favoritosGuardados) {
          const parsedFavs = JSON.parse(favoritosGuardados);
          if (Array.isArray(parsedFavs)) setFavoritos(parsedFavs);
        }
      } catch (e) {
      }
    };
    cargarDatos();
  }, []);

  // Guardar cambios de carrito y favoritos localmente
  useEffect(() => {
    AsyncStorage.setItem('@alavuelta_carrito', JSON.stringify(carrito)).catch(() => {});
  }, [carrito]);

  useEffect(() => {
    AsyncStorage.setItem('@alavuelta_favoritos', JSON.stringify(favoritos)).catch(() => {});
  }, [favoritos]);

  const alternarFavorito = (id) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const agregarAlCarrito = (producto, cantidadAgregar = 1) => {
    if (producto.stock <= 0) {
      Alert.alert('Sin stock', 'Este producto está agotado.');
      return;
    }

    const existente = carrito.find((item) => item.id === producto.id);
    const cantidadActual = existente ? existente.cantidad : 0;

    if (cantidadActual + cantidadAgregar > producto.stock) {
      Alert.alert('Stock insuficiente', `Solo hay ${producto.stock} unidades disponibles.`);
      return;
    }

    if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidadAgregar }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidadAgregar,
        },
      ]);
    }
    Alert.alert('Carrito actualizado', `Se agregó "${producto.nombre}" al carrito.`);
  };

  const cambiarCantidadCarrito = (id, delta) => {
    const prod = productos.find((p) => p.id === id);
    const maxStock = prod ? prod.stock : 0;

    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad < 1) return item;
        if (nuevaCantidad > maxStock) {
          Alert.alert('Límite de stock', `Máximo disponible: ${maxStock} unidades.`);
          return item;
        }
        return { ...item, cantidad: nuevaCantidad };
      })
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmarCompra = (datosComprador, resumen) => {
    // Validar disponibilidad antes de descontar inventario
    for (const item of carrito) {
      const prodActual = productos.find((p) => p.id === item.id);
      if (!prodActual || prodActual.stock < item.cantidad) {
        Alert.alert(
          'Error de inventario',
          `No hay suficiente stock para "${item.nombre}". Revisa tu carrito.`
        );
        return false;
      }
    }

    // Descontar existencias del catalogo
    setProductos((prev) =>
      prev.map((prod) => {
        const comprado = carrito.find((c) => c.id === prod.id);
        if (!comprado) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - comprado.cantidad) };
      })
    );

    const codigo = 'PED-' + Date.now().toString().slice(-6);
    const nuevoPedido = {
      codigo,
      fecha: new Date().toLocaleString('es-CO'),
      comprador: { ...datosComprador },
      items: carrito.map((item) => ({ ...item })),
      subtotal: resumen.subtotal,
      descuento: resumen.descuento,
      envio: resumen.envio,
      total: resumen.total,
    };

    setHistorial([nuevoPedido, ...historial]);
    setCarrito([]);

    Alert.alert(
      'Pedido Confirmado',
      `Código: ${codigo}\nTotal: $${resumen.total}\n\nNota: Esta es una simulación académica sin cobros reales.`
    );
    return true;
  };

  const agregarCalificacion = (idProducto, estrellas) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === idProducto
          ? { ...p, calificaciones: [...(p.calificaciones || []), estrellas] }
          : p
      )
    );
  };

  const guardarProductoVendedor = (datosProducto, esEdicion) => {
    if (esEdicion) {
      setProductos((prev) =>
        prev.map((p) => (p.id === datosProducto.id ? { ...p, ...datosProducto } : p))
      );
    } else {
      const nuevoId = 'PROD-' + String(productos.length + 1).padStart(3, '0');
      setProductos([...productos, { ...datosProducto, id: nuevoId, calificaciones: [] }]);
    }
  };

  const abrirDetalle = (id) => {
    setProductoSeleccionadoId(id);
    setVistaActual('detalle');
  };

  const productoDetalle = productos.find((p) => p.id === productoSeleccionadoId);
  const totalUnidadesCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A5F" />

      {/* Encabezado de marca */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoTexto}>AV</Text>
        </View>
        <View>
          <Text style={styles.tituloMarca}>A la Vuelta</Text>
          <Text style={styles.eslogan}>Lo que buscas, cerca de ti</Text>
        </View>
      </View>

      {/* Contenido principal segun vista */}
      <View style={styles.cuerpo}>
        {vistaActual === 'catalogo' && (
          <Catalogo
            productos={productos}
            favoritos={favoritos}
            onAlternarFavorito={alternarFavorito}
            onAgregarCarrito={agregarAlCarrito}
            onVerDetalle={abrirDetalle}
          />
        )}

        {vistaActual === 'detalle' && productoDetalle && (
          <DetalleProducto
            producto={productoDetalle}
            esFavorito={favoritos.includes(productoDetalle.id)}
            onAlternarFavorito={alternarFavorito}
            onAgregarCarrito={agregarAlCarrito}
            onCalificar={agregarCalificacion}
            onVolver={() => setVistaActual('catalogo')}
          />
        )}

        {vistaActual === 'favoritos' && (
          <Favoritos
            productos={productos}
            favoritos={favoritos}
            onAlternarFavorito={alternarFavorito}
            onVerDetalle={abrirDetalle}
            onIrCatalogo={() => setVistaActual('catalogo')}
          />
        )}

        {vistaActual === 'carrito' && (
          <Carrito
            carrito={carrito}
            onCambiarCantidad={cambiarCantidadCarrito}
            onEliminar={eliminarDelCarrito}
            onConfirmarCompra={confirmarCompra}
            onIrCatalogo={() => setVistaActual('catalogo')}
          />
        )}

        {vistaActual === 'historial' && (
          <Historial
            historial={historial}
            onIrCatalogo={() => setVistaActual('catalogo')}
          />
        )}

        {vistaActual === 'vendedor' && (
          <PanelVendedor
            productos={productos}
            onGuardarProducto={guardarProductoVendedor}
          />
        )}
      </View>

      {/* Barra de navegacion inferior */}
      <View style={styles.navBar}>
        {[
          { key: 'catalogo', label: 'Inicio' },
          { key: 'favoritos', label: `Favs (${favoritos.length})` },
          { key: 'carrito', label: `Carrito (${totalUnidadesCarrito})` },
          { key: 'historial', label: 'Historial' },
          { key: 'vendedor', label: 'Panel' },
        ].map((tab) => {
          const activo = vistaActual === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.navItem, activo && styles.navItemActivo]}
              onPress={() => setVistaActual(tab.key)}
            >
              <Text style={[styles.navTexto, activo && styles.navTextoActivo]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: StatusBar.currentHeight || 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    color: '#1E3A5F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tituloMarca: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eslogan: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  cuerpo: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  navItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navItemActivo: {
    borderTopWidth: 3,
    borderTopColor: '#1E3A5F',
    backgroundColor: '#F1F5F9',
  },
  navTexto: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  navTextoActivo: {
    color: '#1E3A5F',
    fontWeight: 'bold',
  },
});