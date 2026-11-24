import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { formatearCOP, obtenerStockProducto } from '../data/productos';

export default function DetalleProducto({
  producto,
  todosProductos,
  esFavorito,
  suscripcionesStock,
  consultas,
  onAlternarFavorito,
  onAgregarCarrito,
  onAlternarSuscripcion,
  onSimularReposicion,
  onAgregarConsulta,
  onSimularRespuestaConsulta,
  onCalificar,
  onVerDetalle,
  onVolver,
}) {
  const [varianteId, setVarianteId] = useState(null);
  const [preguntaTexto, setPreguntaTexto] = useState('');
  const [estrellasInput, setEstrellasInput] = useState('');
  const [alertaDetalle, setAlertaDetalle] = useState('');

  useEffect(() => {
    setVarianteId(null);
    setAlertaDetalle('');
  }, [producto.id]);

  const tieneVariantes = producto.variantes && producto.variantes.length > 0;
  const varianteActiva = tieneVariantes
    ? producto.variantes.find((v) => v.id === varianteId) || null
    : null;

  const precioMostrar = varianteActiva ? varianteActiva.precio : producto.precio;
  const stockMostrar = varianteActiva
    ? varianteActiva.stock
    : obtenerStockProducto(producto);

  const agotado = tieneVariantes
    ? varianteActiva
      ? varianteActiva.stock === 0
      : stockMostrar === 0
    : producto.stock === 0;

  const keySuscripcion = varianteActiva
    ? `${producto.id}-${varianteActiva.id}`
    : producto.id;
  const estaSuscrito = suscripcionesStock.some((s) => s.key === keySuscripcion);

  const relacionados = todosProductos
    .filter(
      (p) =>
        p.categoria === producto.categoria &&
        p.id !== producto.id &&
        obtenerStockProducto(p) > 0
    )
    .slice(0, 4);

  const calificaciones = producto.calificaciones || [];
  const promedio =
    calificaciones.length > 0
      ? (calificaciones.reduce((acc, val) => acc + val, 0) / calificaciones.length).toFixed(1)
      : 'Sin valoraciones';

  const manejarAgregar = () => {
    if (tieneVariantes && !varianteActiva) {
      const msg = 'Debes seleccionar una opción (talla o color) antes de añadir al carrito.';
      setAlertaDetalle(msg);
      Alert.alert('Falta seleccionar opción', msg);
      return;
    }
    setAlertaDetalle('');
    onAgregarCarrito(producto, varianteActiva, 1);
  };

  const enviarPregunta = () => {
    if (preguntaTexto.trim().length < 10) {
      const msg = 'Escribe una pregunta de al menos 10 caracteres antes de enviar.';
      setAlertaDetalle(msg);
      Alert.alert('Pregunta incompleta', msg);
      return;
    }
    setAlertaDetalle('');
    onAgregarConsulta(producto.id, preguntaTexto.trim());
    setPreguntaTexto('');
    Alert.alert('Consulta enviada', 'Tu pregunta quedó registrada en estado Pendiente.');
  };

  const enviarResena = () => {
    const valor = Number(estrellasInput);
    if (!estrellasInput.trim() || !Number.isInteger(valor) || valor < 1 || valor > 5) {
      const msg = 'Ingresa una calificación entera entre 1 y 5 estrellas.';
      setAlertaDetalle(msg);
      Alert.alert('Valor inválido', msg);
      return;
    }
    setAlertaDetalle('');
    onCalificar(producto.id, valor);
    setEstrellasInput('');
    Alert.alert('Gracias', 'Tu calificación ha sido registrada.');
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Pressable style={styles.btnVolver} onPress={onVolver}>
        <Text style={styles.textoVolver}>Volver al catálogo</Text>
      </Pressable>

      {alertaDetalle !== '' && (
        <View style={styles.alertaBox}>
          <Text style={styles.alertaTexto}>{alertaDetalle}</Text>
        </View>
      )}

      <View style={styles.tarjeta}>
        {producto.imagen ? (
          <Image source={{ uri: producto.imagen }} style={styles.imagenDetalle} />
        ) : (
          <View style={styles.banner}>
            <Text style={styles.bannerTexto}>{producto.nombre.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}

        <Text style={styles.categoria}>
          {producto.categoria} · Marca: {producto.marca || 'Local'}
        </Text>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.precio}>{formatearCOP(precioMostrar)} COP</Text>

        <Text style={[styles.stock, agotado && styles.agotado]}>
          {agotado ? 'Agotado' : `Disponibles: ${stockMostrar} unidades`}
        </Text>

        <Text style={styles.promedio}>
          Calificación: {promedio} / 5 ({calificaciones.length} reseñas)
        </Text>

        {tieneVariantes && (
          <View style={styles.variantesBox}>
            <Text style={styles.subtitulo}>Selecciona una opción *</Text>
            <View style={styles.filaVariantes}>
              {producto.variantes.map((v) => {
                const sel = v.id === varianteId;
                return (
                  <Pressable
                    key={v.id}
                    style={[
                      styles.chipVariante,
                      sel && styles.chipVarianteActiva,
                      v.stock === 0 && styles.chipAgotada,
                    ]}
                    onPress={() => {
                      setVarianteId(v.id);
                      setAlertaDetalle('');
                    }}
                  >
                    <Text style={[styles.textoVariante, sel && styles.textoVarianteActiva]}>
                      {v.etiqueta} ({v.stock === 0 ? 'Agotado' : `${v.stock} uds`})
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <Text style={styles.subtitulo}>Descripción</Text>
        <Text style={styles.descripcion}>{producto.descripcion}</Text>

        <View style={styles.filaBotones}>
          <Pressable
            style={styles.btnFavorito}
            onPress={() => onAlternarFavorito(producto.id)}
          >
            <Text style={styles.textoFavorito}>
              {esFavorito ? 'Quitar Favorito' : 'Guardar Favorito'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.btnComprar, agotado && styles.btnBloqueado]}
            onPress={manejarAgregar}
            disabled={agotado}
          >
            <Text style={styles.textoComprar}>
              {agotado ? 'Agotado' : 'Añadir al Carrito'}
            </Text>
          </Pressable>
        </View>

        {agotado && (!tieneVariantes || varianteActiva) && (
          <View style={styles.reposicionBox}>
            <Pressable
              style={[styles.btnAvisoStock, estaSuscrito && styles.btnAvisoActivo]}
              onPress={() => onAlternarSuscripcion(producto, varianteActiva)}
            >
              <Text style={[styles.textoAvisoStock, estaSuscrito && { color: '#FFFFFF' }]}>
                {estaSuscrito ? 'Cancelar aviso de stock' : 'Avisarme cuando haya stock'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.btnSimularRepo}
              onPress={() =>
                onSimularReposicion(producto.id, varianteActiva ? varianteActiva.id : null, 5)
              }
            >
              <Text style={styles.textoSimularRepo}>
                Simular reposición (+5 unidades)
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Preguntas sobre este producto</Text>
        <View style={styles.filaInput}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu duda (mínimo 10 caracteres)"
            value={preguntaTexto}
            onChangeText={setPreguntaTexto}
          />
          <Pressable style={styles.btnSecundario} onPress={enviarPregunta}>
            <Text style={styles.textoSecundario}>Enviar</Text>
          </Pressable>
        </View>

        {consultas.length === 0 ? (
          <Text style={styles.textoSuave}>Aún no hay preguntas para este producto.</Text>
        ) : (
          consultas.map((c) => (
            <View key={c.id} style={styles.preguntaItem}>
              <Text style={styles.preguntaTexto}>
                P: {c.pregunta} ({c.fecha})
              </Text>
              {c.respuesta ? (
                <Text style={styles.respuestaTexto}>R: {c.respuesta}</Text>
              ) : (
                <View style={styles.filaPendiente}>
                  <Text style={styles.estadoPendiente}>Estado: Pendiente</Text>
                  <Pressable
                    style={styles.btnSimularResp}
                    onPress={() => onSimularRespuestaConsulta(c.id)}
                  >
                    <Text style={styles.textoSimularResp}>Simular respuesta</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Productos relacionados en {producto.categoria}</Text>
        {relacionados.length === 0 ? (
          <Text style={styles.textoSuave}>
            No hay otros productos disponibles en esta categoría.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              {relacionados.map((rel) => (
                <Pressable
                  key={rel.id}
                  style={styles.cardRel}
                  onPress={() => onVerDetalle(rel.id)}
                >
                  <Text style={styles.relNombre} numberOfLines={2}>
                    {rel.nombre}
                  </Text>
                  <Text style={styles.relPrecio}>{formatearCOP(rel.precio)}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Calificar este producto (1 a 5)</Text>
        <View style={styles.filaInput}>
          <TextInput
            style={styles.input}
            placeholder="Ej: 5"
            keyboardType="numeric"
            value={estrellasInput}
            onChangeText={setEstrellasInput}
          />
          <Pressable style={styles.btnSecundario} onPress={enviarResena}>
            <Text style={styles.textoSecundario}>Guardar nota</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 12 },
  btnVolver: { alignSelf: 'flex-start', paddingVertical: 4 },
  textoVolver: { color: '#1E3A5F', fontWeight: 'bold', fontSize: 14 },
  alertaBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
  },
  alertaTexto: { color: '#991B1B', fontSize: 12, fontWeight: '600' },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imagenDetalle: {
    width: '100%',
    height: 170,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  banner: {
    height: 110,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bannerTexto: { fontSize: 32, fontWeight: 'bold', color: '#1E3A5F' },
  categoria: { fontSize: 12, color: '#475569' },
  nombre: { fontSize: 19, fontWeight: 'bold', color: '#0F172A', marginVertical: 4 },
  precio: { fontSize: 18, fontWeight: 'bold', color: '#1E3A5F' },
  stock: { fontSize: 13, color: '#334155', marginTop: 4 },
  agotado: { color: '#DC2626', fontWeight: 'bold' },
  promedio: { fontSize: 13, color: '#475569', marginTop: 2 },
  variantesBox: { marginTop: 10 },
  filaVariantes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chipVariante: {
    borderWidth: 1,
    borderColor: '#1E3A5F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  chipVarianteActiva: { backgroundColor: '#1E3A5F' },
  chipAgotada: { borderColor: '#94A3B8', backgroundColor: '#F1F5F9' },
  textoVariante: { fontSize: 12, color: '#1E3A5F', fontWeight: '600' },
  textoVarianteActiva: { color: '#FFFFFF' },
  subtitulo: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginTop: 10, marginBottom: 4 },
  descripcion: { fontSize: 14, color: '#334155', lineHeight: 20 },
  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btnFavorito: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoFavorito: { color: '#1E3A5F', fontWeight: 'bold', fontSize: 13 },
  btnComprar: {
    flex: 1,
    backgroundColor: '#1E3A5F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnBloqueado: { backgroundColor: '#94A3B8' },
  textoComprar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  reposicionBox: { marginTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
  btnAvisoStock: {
    borderWidth: 1,
    borderColor: '#1E3A5F',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnAvisoActivo: { backgroundColor: '#1E3A5F' },
  textoAvisoStock: { color: '#1E3A5F', fontWeight: 'bold', fontSize: 12 },
  btnSimularRepo: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  textoSimularRepo: { color: '#334155', fontSize: 12, fontWeight: '600' },
  filaInput: { flexDirection: 'row', gap: 8, marginTop: 4 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnSecundario: {
    backgroundColor: '#475569',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 6,
  },
  textoSecundario: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  textoSuave: { fontSize: 12, color: '#64748B', marginTop: 6 },
  preguntaItem: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  preguntaTexto: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  respuestaTexto: { fontSize: 12, color: '#1E3A5F' },
  filaPendiente: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estadoPendiente: { fontSize: 11, color: '#D97706', fontWeight: '600' },
  btnSimularResp: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  textoSimularResp: { fontSize: 11, color: '#1E3A5F', fontWeight: 'bold' },
  cardRel: {
    width: 135,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'space-between',
  },
  relNombre: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  relPrecio: { fontSize: 12, color: '#1E3A5F', fontWeight: 'bold', marginTop: 4 },
});