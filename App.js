import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import { PRODUCTOS_INICIALES } from './src/data/productos';
import { DIRECCIONES_INICIALES, CONSULTAS_INICIALES, PEDIDOS_INICIALES } from './src/data/datosIniciales';
import Catalogo from './src/components/Catalogo';
import DetalleProducto from './src/components/DetalleProducto';
import Comparador from './src/components/Comparador';
import Favoritos from './src/components/Favoritos';
import Carrito from './src/components/Carrito';
import Direcciones from './src/components/Direcciones';
import Historial from './src/components/Historial';
import Notificaciones from './src/components/Notificaciones';
import CentroAyuda from './src/components/CentroAyuda';
import PanelVendedor from './src/components/PanelVendedor';

export default function App() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [carrito, setCarrito] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [comparacion, setComparacion] = useState([]);
  const [direcciones, setDirecciones] = useState(DIRECCIONES_INICIALES);
  const [dirId, setDirId] = useState('DIR-01');
  const [historial, setHistorial] = useState(PEDIDOS_INICIALES);
  const [notificaciones, setNotificaciones] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
  const [consultas, setConsultas] = useState(CONSULTAS_INICIALES);
  const [tickets, setTickets] = useState([]);
  const [vista, setVista] = useState('catalogo');
  const [detalleId, setDetalleId] = useState(null);

  // Función única para sumar o restar stock en productos y variantes
  const ajustarStock = (lista, cambios) =>
    lista.map((p) => {
      const movs = cambios.filter((c) => c.id === p.id);
      if (!movs.length) return p;
      if (p.variantes?.length) {
        const vars = p.variantes.map((v) => {
          const m = movs.find((x) => x.varianteId === v.id);
          return m ? { ...v, stock: Math.max(0, v.stock + m.delta) } : v;
        });
        return { ...p, variantes: vars, stock: vars.reduce((s, v) => s + v.stock, 0) };
      }
      return { ...p, stock: Math.max(0, p.stock + movs[0].delta) };
    });

  const notificar = (eventoKey, tipo, mensaje) => {
    setNotificaciones((prev) =>
      prev.some((n) => n.eventoKey === eventoKey)
        ? prev
        : [{ id: 'NOT-' + Date.now() + prev.length, eventoKey, tipo, mensaje, fecha: new Date().toLocaleString('es-CO'), leida: false }, ...prev]
    );
  };

  const alternarLista = (lista, setLista, id, max = null) => {
    if (lista.includes(id)) return setLista(lista.filter((x) => x !== id));
    if (max && lista.length >= max) return Alert.alert('Límite', `Máximo ${max} elementos.`);
    setLista([...lista, id]);
  };

  const agregarAlCarrito = (producto, variante = null, cant = 1) => {
    if (producto.variantes?.length && !variante) {
      return Alert.alert('Elige una opción', 'Selecciona una variante antes de agregar.');
    }
    const maxStock = variante ? variante.stock : producto.stock;
    if (maxStock <= 0) return Alert.alert('Sin stock', 'Opción agotada.');

    const keyUnico = variante ? `${producto.id}-${variante.id}` : producto.id;
    const actual = carrito.find((i) => i.keyUnico === keyUnico);
    if ((actual ? actual.cantidad : 0) + cant > maxStock) {
      return Alert.alert('Stock insuficiente', `Solo hay ${maxStock} unidades disponibles.`);
    }

    setCarrito(
      actual
        ? carrito.map((i) => (i.keyUnico === keyUnico ? { ...i, cantidad: i.cantidad + cant } : i))
        : [...carrito, { keyUnico, id: producto.id, varianteId: variante?.id || null, varianteEtiqueta: variante?.etiqueta || null, nombre: producto.nombre, precio: variante ? variante.precio : producto.precio, cantidad: cant }]
    );
    Alert.alert('Carrito actualizado', `Se agregó "${producto.nombre}".`);
  };

  const cambiarCantidadCarrito = (keyUnico, delta) => {
    const item = carrito.find((i) => i.keyUnico === keyUnico);
    const prod = productos.find((p) => p.id === item?.id);
    const maxStock = item?.varianteId ? prod?.variantes?.find((v) => v.id === item.varianteId)?.stock || 0 : prod?.stock || 0;

    setCarrito((prev) =>
      prev.map((i) => {
        if (i.keyUnico !== keyUnico || i.cantidad + delta < 1) return i;
        if (i.cantidad + delta > maxStock) {
          Alert.alert('Límite de stock', `Máximo disponible: ${maxStock}.`);
          return i;
        }
        return { ...i, cantidad: i.cantidad + delta };
      })
    );
  };

  const confirmarCompra = (comprador, resumen, modalidadEnvio) => {
    for (const item of carrito) {
      const p = productos.find((x) => x.id === item.id);
      const disp = item.varianteId ? p?.variantes?.find((v) => v.id === item.varianteId)?.stock : p?.stock;
      if (!disp || disp < item.cantidad) {
        Alert.alert('Sin stock suficiente', `Revisa "${item.nombre}".`);
        return false;
      }
    }

    setProductos((prev) => ajustarStock(prev, carrito.map((c) => ({ id: c.id, varianteId: c.varianteId, delta: -c.cantidad }))));
    const codigo = 'PED-' + Date.now().toString().slice(-6);
    const fecha = new Date().toLocaleString('es-CO');

    setHistorial([{ codigo, fecha, estado: 'Confirmado', historialEstados: [{ estado: 'Confirmado', fecha }], comprador, modalidadEnvio, items: [...carrito], ...resumen, stockReintegrado: false }, ...historial]);
    setCarrito([]);
    notificar(`${codigo}-Confirmado`, 'Pedido Confirmado', `Pedido ${codigo} confirmado por $${resumen.total}.`);
    Alert.alert('Pedido Confirmado', `Código: ${codigo}\nSimulación académica sin cobros reales.`);
    return true;
  };

  const avanzarEstadoPedido = (codigo) => {
    const pasos = ['Confirmado', 'Preparando', 'En camino', 'Entregado'];
    const ped = historial.find((p) => p.codigo === codigo);
    const idx = pasos.indexOf(ped?.estado);
    if (idx === -1 || idx >= pasos.length - 1) return Alert.alert('Estado final', 'No admite más cambios.');

    const siguiente = pasos[idx + 1];
    const fecha = new Date().toLocaleString('es-CO');
    setHistorial((prev) => prev.map((p) => (p.codigo === codigo ? { ...p, estado: siguiente, historialEstados: [...p.historialEstados, { estado: siguiente, fecha }] } : p)));
    notificar(`${codigo}-${siguiente}`, 'Actualización', `El pedido ${codigo} pasó a: ${siguiente}.`);
  };

  const cancelarPedido = (codigo) => {
    const ped = historial.find((p) => p.codigo === codigo);
    if (!ped || ped.estado === 'En camino' || ped.estado === 'Entregado') {
      return Alert.alert('No permitido', 'El pedido ya va en camino o fue entregado.');
    }
    if (ped.estado === 'Cancelado' || ped.stockReintegrado) return;

    setProductos((prev) => ajustarStock(prev, ped.items.map((i) => ({ id: i.id, varianteId: i.varianteId, delta: i.cantidad }))));
    const fecha = new Date().toLocaleString('es-CO');
    setHistorial((prev) => prev.map((p) => (p.codigo === codigo ? { ...p, estado: 'Cancelado', stockReintegrado: true, historialEstados: [...p.historialEstados, { estado: 'Cancelado', fecha }] } : p)));
    notificar(`${codigo}-Cancelado`, 'Pedido Cancelado', `El pedido ${codigo} fue cancelado y se devolvió su stock.`);
  };

  const alternarSuscripcion = (prod, variante = null) => {
    const key = variante ? `${prod.id}-${variante.id}` : prod.id;
    if (suscripciones.some((s) => s.key === key)) {
      setSuscripciones(suscripciones.filter((s) => s.key !== key));
      Alert.alert('Aviso cancelado', 'Suscripción eliminada.');
    } else {
      setSuscripciones([...suscripciones, { key, nombre: variante ? `${prod.nombre} (${variante.etiqueta})` : prod.nombre }]);
      Alert.alert('Aviso activado', 'Te notificaremos cuando haya stock.');
    }
  };

  const simularReposicion = (productoId, varianteId = null, unidades = 5) => {
    const key = varianteId ? `${productoId}-${varianteId}` : productoId;
    const sub = suscripciones.find((s) => s.key === key);
    setProductos((prev) => ajustarStock(prev, [{ id: productoId, varianteId, delta: unidades }]));
    if (sub) {
      notificar(`repo-${key}-${Date.now()}`, 'Reposición', `"${sub.nombre}" vuelve a estar disponible.`);
      setSuscripciones((prev) => prev.filter((s) => s.key !== key));
    }
    Alert.alert('Reposición simulada', `Se agregaron ${unidades} unidades.`);
  };

  const productoDetalle = productos.find((p) => p.id === detalleId);
  const sinLeer = notificaciones.filter((n) => !n.leida).length;
  const totalCarrito = carrito.reduce((s, i) => s + i.cantidad, 0);

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A5F" />
      <View style={styles.header}>
        <View style={styles.logoBox}><Text style={styles.logoTexto}>AV</Text></View>
        <View>
          <Text style={styles.tituloMarca}>A la Vuelta</Text>
          <Text style={styles.eslogan}>Lo que buscas, cerca de ti</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {vista === 'catalogo' && (
          <Catalogo
            productos={productos}
            favoritos={favoritos}
            comparacion={comparacion}
            onAlternarFavorito={(id) => alternarLista(favoritos, setFavoritos, id)}
            onAlternarComparacion={(id) => alternarLista(comparacion, setComparacion, id, 3)}
            onAgregarCarrito={(p) => agregarAlCarrito(p, null, 1)}
            onVerDetalle={(id) => { setDetalleId(id); setVista('detalle'); }}
          />
        )}
        {vista === 'detalle' && productoDetalle && (
          <DetalleProducto
            producto={productoDetalle}
            todosProductos={productos}
            esFavorito={favoritos.includes(productoDetalle.id)}
            suscripcionesStock={suscripciones}
            consultas={consultas.filter((c) => c.productoId === productoDetalle.id)}
            onAlternarFavorito={(id) => alternarLista(favoritos, setFavoritos, id)}
            onAgregarCarrito={agregarAlCarrito}
            onAlternarSuscripcion={alternarSuscripcion}
            onSimularReposicion={simularReposicion}
            onAgregarConsulta={(productoId, pregunta) => setConsultas([{ id: 'C-' + Date.now(), productoId, pregunta, respuesta: null, fecha: new Date().toLocaleDateString('es-CO') }, ...consultas])}
            onSimularRespuestaConsulta={(id) => setConsultas((prev) => prev.map((c) => (c.id === id ? { ...c, respuesta: 'Respuesta simulada: Producto disponible con garantía local.' } : c)))}
            onCalificar={(id, est) => setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, calificaciones: [...(p.calificaciones || []), est] } : p)))}
            onVerDetalle={(id) => setDetalleId(id)}
            onVolver={() => setVista('catalogo')}
          />
        )}
        {vista === 'comparador' && (
          <Comparador
            productos={productos}
            comparacion={comparacion}
            onQuitarComparacion={(id) => alternarLista(comparacion, setComparacion, id)}
            onVerDetalle={(id) => { setDetalleId(id); setVista('detalle'); }}
            onIrCatalogo={() => setVista('catalogo')}
          />
        )}
        {vista === 'favoritos' && (
          <Favoritos
            productos={productos}
            favoritos={favoritos}
            onAlternarFavorito={(id) => alternarLista(favoritos, setFavoritos, id)}
            onVerDetalle={(id) => { setDetalleId(id); setVista('detalle'); }}
            onIrCatalogo={() => setVista('catalogo')}
          />
        )}
        {vista === 'carrito' && (
          <Carrito
            carrito={carrito}
            direcciones={direcciones}
            direccionActual={direcciones.find((d) => d.id === dirId) || null}
            onSeleccionarDireccion={setDirId}
            onIrDirecciones={() => setVista('direcciones')}
            onCambiarCantidad={cambiarCantidadCarrito}
            onEliminar={(k) => setCarrito((prev) => prev.filter((i) => i.keyUnico !== k))}
            onConfirmarCompra={confirmarCompra}
            onIrCatalogo={() => setVista('catalogo')}
          />
        )}
        {vista === 'direcciones' && (
          <Direcciones
            direcciones={direcciones}
            direccionSeleccionadaId={dirId}
            onSeleccionarDireccion={setDirId}
            onGuardarDireccion={(d, edit) =>
              edit
                ? setDirecciones((prev) => prev.map((x) => (x.id === d.id ? { ...x, ...d } : x)))
                : setDirecciones([...direcciones, { ...d, id: 'DIR-' + Date.now().toString().slice(-4), principal: direcciones.length === 0 }])
            }
            onMarcarPrincipal={(id) => setDirecciones((prev) => prev.map((d) => ({ ...d, principal: d.id === id })))}
          />
        )}
        {vista === 'historial' && (
          <Historial historial={historial} onAvanzarEstado={avanzarEstadoPedido} onCancelarPedido={cancelarPedido} onIrCatalogo={() => setVista('catalogo')} />
        )}
        {vista === 'notificaciones' && (
          <Notificaciones notificaciones={notificaciones} onMarcarLeida={(id) => setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))} />
        )}
        {vista === 'ayuda' && (
          <CentroAyuda
            historial={historial}
            tickets={tickets}
            onCrearTicket={(t) => setTickets([{ ...t, id: 'TCK-' + Date.now().toString().slice(-4), estado: 'Abierto', respuesta: null }, ...tickets])}
            onSimularRespuestaTicket={(id) => setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, estado: 'Respondido', respuesta: 'Caso atendido en modo demostración.' } : t)))}
          />
        )}
        {vista === 'vendedor' && (
          <PanelVendedor
            productos={productos}
            onGuardarProducto={(d, edit) =>
              edit
                ? setProductos((prev) => prev.map((p) => (p.id === d.id ? { ...p, ...d } : p)))
                : setProductos([...productos, { ...d, id: 'PROD-' + String(productos.length + 1).padStart(3, '0'), calificaciones: [] }])
            }
          />
        )}
      </View>

      <View style={styles.navBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            ['catalogo', 'Inicio'],
            ['comparador', `Comparar (${comparacion.length})`],
            ['favoritos', `Favs (${favoritos.length})`],
            ['carrito', `Carrito (${totalCarrito})`],
            ['direcciones', 'Direcciones'],
            ['historial', 'Pedidos'],
            ['notificaciones', `Avisos (${sinLeer})`],
            ['ayuda', 'Ayuda'],
            ['vendedor', 'Panel'],
          ].map(([key, label]) => (
            <Pressable key={key} style={[styles.navItem, vista === key && styles.navActivo]} onPress={() => setVista(key)}>
              <Text style={[styles.navTexto, vista === key && styles.navTextoActivo]}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: StatusBar.currentHeight || 30 },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A5F', padding: 12, gap: 10 },
  logoBox: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  logoTexto: { color: '#1E3A5F', fontWeight: 'bold', fontSize: 15 },
  tituloMarca: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  eslogan: { color: '#CBD5E1', fontSize: 12 },
  navBar: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#CBD5E1' },
  navItem: { paddingVertical: 11, paddingHorizontal: 13 },
  navActivo: { borderTopWidth: 3, borderTopColor: '#1E3A5F', backgroundColor: '#F1F5F9' },
  navTexto: { fontSize: 12, color: '#475569', fontWeight: '600' },
  navTextoActivo: { color: '#1E3A5F', fontWeight: 'bold' },
});