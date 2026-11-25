import { Platform } from 'react-native';

// Paleta única de la app. Cambia un color aquí y se actualiza en todas las pantallas.
export const colores = {
  fondo: '#28160C',
  barra: '#251309',
  panel: '#241207',
  superficie: '#38220E',
  superficieAlta: '#493016',
  botonOscuro: '#2D190B',
  botonPortada: '#301B0D',
  borde: '#805600',
  bordeSuave: '#63400F',
  bordeMenu: '#50320D',
  bordeDorado: '#B98600',
  dorado: '#F3B900',
  doradoOscuro: '#8A6500',
  crema: '#F2E6C9',
  textoClaro: '#E8D5B1',
  textoMenu: '#D8BD91',
  textoSuave: '#C7A978',
  placeholder: '#8C7049',
  verde: '#68845A',
  verdeOscuro: '#435138',
  verdeClaro: '#B7D5A4',
  hoja: '#55A95B',
  cafe: '#6D4C1B',
  nivel: '#60482C',
  error: '#6D3022',
  errorTexto: '#FFD3C7',
  sombra: 'rgba(0,0,0,0.58)',
};

// 'serif' solo existe en Android; iOS y web necesitan un nombre de fuente real.
export const fuenteTitulo = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});
