// Datos ficticios para la maqueta. Reemplazarlos antes de publicar el sitio.
export const datosRestaurante = {
  direccion: 'Carrera 50 # 48-20, Ciudad Córdoba, Cali (dirección ficticia de ejemplo)',
  telefono: '300 000 0000 (número ficticio; no llamar)',
  horario: 'Lunes a domingo, 12:00 m. a 10:00 p. m. (horario de ejemplo)',
};

export const categoriasPlatos = ['Entradas', 'Platos fuertes', 'Bebidas'];
export const categoriasMenu = ['Todos', ...categoriasPlatos, 'Nuevos'];

// Catálogo fijo. Los precios son números (pesos colombianos) y se formatean al mostrarlos.
export const platos = [
  { id: 1, categoria: 'Entradas', nombre: 'Bofe con papa y guacamole', descripcion: 'Bofe dorado, papa salada y guacamole preparado en casa.', precio: 30000, foto: require('../img/menu/bofe-con-papa.jpg') },
  { id: 2, categoria: 'Entradas', nombre: 'Chorizo a la parrilla', descripcion: 'Chorizo artesanal asado, servido con limón y arepa.', precio: 18000, foto: require('../img/menu/chorizo-a-la-parrilla.jpg') },
  { id: 3, categoria: 'Entradas', nombre: 'Empanadas de carne', descripcion: 'Tres empanadas crocantes de carne con ají de la casa.', precio: 16000, foto: require('../img/menu/empanadas-de-carne.jpg') },
  { id: 4, categoria: 'Entradas', nombre: 'Provoleta', descripcion: 'Queso provolone a la parrilla con orégano y tomate.', precio: 28000 },
  { id: 5, categoria: 'Platos fuertes', nombre: 'Parrillada mixta', descripcion: 'Selección de carnes, chorizo y acompañamientos para compartir.', precio: 72000, foto: require('../img/menu/parrillada-mixta.jpg') },
  { id: 6, categoria: 'Bebidas', nombre: 'Vino de la casa', descripcion: 'Copa de vino tinto o blanco de la casa.', precio: 20000, foto: require('../img/menu/vino-de-la-casa.jpg') },
  { id: 7, categoria: 'Entradas', nombre: 'Mollejas a la parrilla', descripcion: 'Mollejas doradas a fuego lento con limón.', precio: 35000, foto: require('../img/menu/mollejas-a-la-parrilla.jpg') },
  { id: 8, categoria: 'Entradas', nombre: 'Morcilla', descripcion: 'Morcilla asada, acompañada de papa criolla.', precio: 18000, foto: require('../img/menu/morcilla.jpg') },
  { id: 9, categoria: 'Entradas', nombre: 'Chinchulines', descripcion: 'Chinchulines crocantes preparados a la parrilla.', precio: 24000, foto: require('../img/menu/chinchulines.jpg') },
  { id: 10, categoria: 'Platos fuertes', nombre: 'Riñones al vino', descripcion: 'Riñones cocinados lentamente en salsa de vino.', precio: 32000, foto: require('../img/menu/rinones-al-vino.jpg') },
  { id: 11, categoria: 'Platos fuertes', nombre: 'Punta de anca', descripcion: 'Corte de res a la parrilla con papa y ensalada.', precio: 48000, foto: require('../img/menu/punta-de-anca.jpg') },
  { id: 12, categoria: 'Platos fuertes', nombre: 'Churrasco', descripcion: 'Corte de res asado, servido con papas y ensalada fresca.', precio: 45000, foto: require('../img/menu/churrasco.jpg') },
  { id: 13, categoria: 'Platos fuertes', nombre: 'Lomo al trapo', descripcion: 'Lomo de res asado lentamente y acompañado de papa.', precio: 58000, foto: require('../img/menu/lomo-al-trapo.jpg') },
  { id: 14, categoria: 'Platos fuertes', nombre: 'Costillas BBQ', descripcion: 'Costillas de cerdo con salsa BBQ y papas rústicas.', precio: 42000, foto: require('../img/menu/costillas-bbq.jpg') },
  { id: 15, categoria: 'Platos fuertes', nombre: 'Pollo a la parrilla', descripcion: 'Pechuga de pollo asada con arroz y ensalada.', precio: 34000, foto: require('../img/menu/pollo-a-la-parrilla.jpg') },
  { id: 16, categoria: 'Platos fuertes', nombre: 'Trucha al limón', descripcion: 'Trucha a la plancha con limón, papa y ensalada.', precio: 40000, foto: require('../img/menu/trucha-al-limon.jpg') },
  { id: 17, categoria: 'Entradas', nombre: 'Ceviche de camarón', descripcion: 'Camarones marinados con limón, cebolla y cilantro.', precio: 36000, foto: require('../img/menu/ceviche-de-camaron.jpg') },
  { id: 18, categoria: 'Platos fuertes', nombre: 'Paella de la casa', descripcion: 'Arroz preparado con mariscos, pollo y vegetales.', precio: 52000, foto: require('../img/menu/paella-de-la-casa.jpg') },
  { id: 19, categoria: 'Platos fuertes', nombre: 'Ajiaco', descripcion: 'Sopa bogotana de pollo, papas y mazorca con guarniciones.', precio: 29000, foto: require('../img/menu/ajiaco.jpg') },
  { id: 20, categoria: 'Platos fuertes', nombre: 'Bandeja paisa', descripcion: 'Fríjoles, arroz, carne, chicharrón, huevo, arepa y aguacate.', precio: 38000, foto: require('../img/menu/bandeja-paisa.jpg') },
];

export function normalizarBusqueda(valor) {
  return String(valor || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Acepta números y también textos antiguos como "$ 30.000" guardados en versiones anteriores.
export function valorPrecio(precio) {
  if (typeof precio === 'number') return Number.isFinite(precio) ? precio : 0;
  return Number(String(precio ?? '').replace(/[^0-9]/g, '')) || 0;
}

// Formato fijo "$ 30.000" sin depender de Intl (que varía entre motores de JavaScript).
export function formatoPrecio(precio) {
  const entero = Math.round(valorPrecio(precio));
  return `$ ${String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

// Los platos creados en el dispositivo tienen id de texto ("plato-...").
export function esPlatoCreado(plato) {
  return typeof plato?.id === 'string' && plato.id.startsWith('plato-');
}

export function fuenteImagenPlato(plato) {
  const imagen = plato?.fotoUri || plato?.foto;
  if (!imagen) return null;
  return typeof imagen === 'string' ? { uri: imagen } : imagen;
}

// "Plato del día": rota entre los platos fuertes según el día del año.
export function platoDelDia(catalogo, fecha = new Date()) {
  const fuertes = catalogo.filter((plato) => plato.categoria === 'Platos fuertes');
  const lista = fuertes.length ? fuertes : catalogo;
  if (!lista.length) return null;
  const inicioAno = new Date(fecha.getFullYear(), 0, 0);
  const diaDelAno = Math.floor((fecha - inicioAno) / 86_400_000);
  return lista[diaDelAno % lista.length];
}

export function formatoFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  const dos = (n) => String(n).padStart(2, '0');
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} · ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}
