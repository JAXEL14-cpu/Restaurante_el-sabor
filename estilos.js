import { StyleSheet } from 'react-native';
import { colores, fuenteTitulo } from './tema';

// Estilos que comparten varias pantallas. Los estilos propios de cada pantalla viven en su archivo.
export const comunes = StyleSheet.create({
  pantalla: { flex: 1, minHeight: 0 },
  contenido: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingBottom: 32, gap: 12 },
  tituloSeccion: { color: colores.crema, fontFamily: fuenteTitulo, fontSize: 25, fontWeight: '700' },
  subtitulo: { color: colores.crema, fontWeight: '800', fontSize: 18 },
  texto: { color: colores.textoClaro, lineHeight: 21 },
  aviso: { color: colores.textoSuave, lineHeight: 21 },
  avisoPequeno: { color: colores.textoSuave, fontSize: 12, lineHeight: 18 },
  etiqueta: { color: colores.dorado, fontWeight: '700' },
  tarjeta: { padding: 16, gap: 8, borderRadius: 12, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.bordeSuave },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  botonPrimario: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderRadius: 10, backgroundColor: colores.doradoOscuro },
  textoBotonPrimario: { color: colores.crema, fontWeight: '800' },
  botonSecundario: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 9, backgroundColor: colores.superficieAlta },
  textoBotonSecundario: { color: colores.dorado, fontWeight: '700' },
  botonPeligro: { backgroundColor: colores.error },
  textoBotonPeligro: { color: colores.errorTexto },
  deshabilitado: { opacity: 0.5 },
  entrada: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 9, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.crema, color: colores.panel, fontSize: 16 },
  chip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.botonOscuro },
  chipActivo: { backgroundColor: colores.dorado, borderColor: colores.dorado },
  textoChip: { color: colores.textoClaro, fontWeight: '700', fontSize: 13 },
  textoChipActivo: { color: colores.panel },
  error: { color: colores.errorTexto, padding: 10, backgroundColor: colores.error, borderRadius: 8, lineHeight: 20 },
  precio: { fontSize: 17, fontWeight: 'bold', color: colores.dorado },
  vacio: { padding: 20, backgroundColor: colores.superficie, borderRadius: 14, alignItems: 'flex-start', gap: 8 },
  tituloVacio: { color: colores.crema, fontSize: 17, fontWeight: '700' },
});
