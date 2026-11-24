export const TARIFAS_ENVIO = {
  Mosquera: { estandar: 6000, expres: 10000, plazoEstandar: '1 a 2 días', plazoExpres: 'Mismo día' },
  Funza: { estandar: 8000, expres: 12000, plazoEstandar: '1 a 2 días', plazoExpres: '1 a 2 días' },
  Madrid: { estandar: 10000, expres: 14000, plazoEstandar: '2 a 3 días', plazoExpres: '1 a 2 días' },
};

export const DIRECCIONES_INICIALES = [
  {
    id: 'DIR-01',
    alias: 'Casa',
    municipio: 'Mosquera',
    descripcion: 'Calle 3 # 4-15, Barrio El Poblado',
    principal: true,
  },
  {
    id: 'DIR-02',
    alias: 'Oficina',
    municipio: 'Funza',
    descripcion: 'Carrera 9 # 12-40, Centro',
    principal: false,
  },
];

export const CONSULTAS_INICIALES = [
  {
    id: 'CONS-01',
    productoId: 'PROD-001',
    pregunta: '¿Incluye cable de carga en la caja?',
    respuesta: 'Sí, incluye estuche de carga y cable USB-C.',
    fecha: '20/11/2026',
  },
];

export const PEDIDOS_INICIALES = [
  {
    codigo: 'PED-100201',
    fecha: '22/11/2026, 10:30 a. m.',
    estado: 'Confirmado',
    historialEstados: [{ estado: 'Confirmado', fecha: '22/11/2026, 10:30 a. m.' }],
    comprador: {
      nombre: 'Carlos Mendoza',
      telefono: '3105551234',
      municipio: 'Mosquera',
      direccion: 'Calle 3 # 4-15, Barrio El Poblado',
    },
    modalidadEnvio: 'estandar',
    items: [
      {
        id: 'PROD-004',
        varianteId: null,
        varianteEtiqueta: null,
        nombre: 'Lámpara LED de Escritorio',
        precio: 48000,
        cantidad: 1,
      },
    ],
    subtotal: 48000,
    descuento: 0,
    envio: 6000,
    total: 54000,
    stockReintegrado: false,
  },
];