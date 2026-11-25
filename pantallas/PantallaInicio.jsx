import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, fuenteTitulo } from '../tema';
import { datosRestaurante, formatoPrecio, fuenteImagenPlato } from '../datos/platos';

export default function PantallaInicio({ cantidad, platoDestacado, onExplorar, onAbrirPlato }) {
  const { width } = useWindowDimensions();
  let tamanoTitulo = 34;
  if (width >= 900) tamanoTitulo = 60;
  else if (width >= 600) tamanoTitulo = 46;
  const fuenteImagen = fuenteImagenPlato(platoDestacado);

  return (
    <ScrollView style={s.pantalla} contentContainerStyle={s.portada}>
      <Text accessibilityRole="header" style={[s.titulo, { fontSize: tamanoTitulo }]}>RESTAURANTE <Text style={s.dorado}>EL SABOR</Text></Text>
      <View style={s.adorno}><View style={s.linea} /><Text style={s.hoja}>❧</Text><View style={s.linea} /></View>
      <Text style={s.subtitulo}>Tradición, sabor y calidad en cada plato</Text>
      <Pressable accessibilityRole="button" style={s.botonExplorar} onPress={onExplorar}>
        <Text style={s.textoBotonExplorar}>EXPLORAR MENÚ</Text>
        <Ionicons name="arrow-forward" size={18} color={colores.dorado} />
      </Pressable>
      <Text style={s.detalle}>{cantidad} preparaciones de nuestra cocina</Text>

      {platoDestacado && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Plato del día: ${platoDestacado.nombre}, ${formatoPrecio(platoDestacado.precio)}. Ver detalle`}
          onPress={() => onAbrirPlato(platoDestacado)}
          style={s.destacado}
        >
          {fuenteImagen && <Image source={fuenteImagen} style={s.fotoDestacado} resizeMode="cover" />}
          <View style={s.textoDestacado}>
            <Text style={s.etiquetaDestacado}>PLATO DEL DÍA</Text>
            <Text style={s.nombreDestacado}>{platoDestacado.nombre}</Text>
            <Text style={s.precioDestacado}>{formatoPrecio(platoDestacado.precio)}</Text>
          </View>
        </Pressable>
      )}

      <View style={s.horario}>
        <Ionicons name="time-outline" size={16} color={colores.textoSuave} />
        <Text style={s.textoHorario}>{datosRestaurante.horario}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  portada: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  titulo: { color: colores.crema, fontFamily: fuenteTitulo, fontWeight: '700', letterSpacing: 4, textAlign: 'center' },
  dorado: { color: colores.dorado, fontStyle: 'italic' },
  adorno: { flexDirection: 'row', alignItems: 'center', gap: 14, width: 360, maxWidth: '80%', marginTop: 14 },
  linea: { flex: 1, height: 1, backgroundColor: colores.bordeSuave },
  hoja: { color: colores.hoja, fontSize: 19 },
  subtitulo: { marginTop: 28, color: colores.textoSuave, fontSize: 16, letterSpacing: 2, textAlign: 'center' },
  botonExplorar: { marginTop: 40, minHeight: 56, minWidth: 250, flexDirection: 'row', gap: 10, paddingHorizontal: 28, borderRadius: 30, borderWidth: 1, borderColor: colores.bordeDorado, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.botonPortada },
  textoBotonExplorar: { color: colores.crema, fontWeight: '800', letterSpacing: 1 },
  detalle: { color: colores.placeholder, fontSize: 12, marginTop: 18 },
  destacado: { marginTop: 28, width: '100%', maxWidth: 460, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 14, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.borde },
  fotoDestacado: { width: 96, height: 78, borderRadius: 10 },
  textoDestacado: { flex: 1, minWidth: 0, gap: 3 },
  etiquetaDestacado: { color: colores.hoja, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  nombreDestacado: { color: colores.crema, fontSize: 17, fontWeight: '700' },
  precioDestacado: { color: colores.dorado, fontWeight: '800' },
  horario: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, maxWidth: 460 },
  textoHorario: { color: colores.textoSuave, fontSize: 12, flexShrink: 1 },
});
