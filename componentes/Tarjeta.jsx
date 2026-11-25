import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';
import { esPlatoCreado, formatoPrecio, fuenteImagenPlato } from '../datos/platos';

function Tarjeta({ plato, colorBorde, adaptativa = false, esFavorito = false, cantidadCarrito = 0, onAbrir, onAgregarCarrito, onAlternarFavorito }) {
  const fuenteImagen = fuenteImagenPlato(plato);

  return (
    <View style={[s.tarjeta, { borderLeftColor: colorBorde }, adaptativa && s.tarjetaAdaptativa]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${plato.nombre}`}
        onPress={() => onAbrir(plato)}
        style={({ pressed }) => pressed && s.presionado}
      >
        {fuenteImagen
          ? <Image source={fuenteImagen} accessibilityLabel={`Fotografía de ${plato.nombre}`} style={s.foto} resizeMode="cover" />
          : <View style={s.fotoPendiente}><Ionicons name="image-outline" size={26} color={colores.textoSuave} /><Text style={s.textoFotoPendiente}>Imagen pendiente</Text></View>}
        <View style={s.filaTitulo}>
          <Text style={s.nombre} numberOfLines={2}>{plato.nombre}</Text>
          <View style={s.badge}>
            <Text style={s.badgeTexto}>{esPlatoCreado(plato) ? 'Nuevo' : plato.categoria}</Text>
          </View>
        </View>
        <Text style={s.descripcion} numberOfLines={2}>{plato.descripcion}</Text>
        <Text style={s.verMas}>Ver detalle</Text>
        <Text style={s.precio}>{formatoPrecio(plato.precio)}</Text>
      </Pressable>
      <View style={s.acciones}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Agregar ${plato.nombre} al carrito${cantidadCarrito ? `, ya tienes ${cantidadCarrito}` : ''}`}
          hitSlop={6}
          onPress={() => onAgregarCarrito(plato.id, 1)}
          style={s.boton}
        >
          <Ionicons name="cart-outline" size={16} color={colores.dorado} />
          <Text style={s.textoBoton}>{cantidadCarrito > 0 ? `Agregar · ${cantidadCarrito}` : 'Agregar'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={esFavorito ? `Quitar ${plato.nombre} de favoritos` : `Guardar ${plato.nombre} en favoritos`}
          accessibilityState={{ selected: esFavorito }}
          hitSlop={6}
          onPress={() => onAlternarFavorito(plato.id)}
          style={[s.boton, esFavorito && s.botonActivo]}
        >
          <Ionicons name={esFavorito ? 'star' : 'star-outline'} size={16} color={esFavorito ? colores.panel : colores.textoClaro} />
          <Text style={[s.textoBotonFavorito, esFavorito && s.textoBotonActivo]}>{esFavorito ? 'Favorito' : 'Marcar favorito'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default memo(Tarjeta);

const s = StyleSheet.create({
  tarjeta: { marginTop: 12, marginHorizontal: 4, padding: 15, backgroundColor: colores.superficie, borderRadius: 14, borderLeftWidth: 6, elevation: 2 },
  tarjetaAdaptativa: { flex: 1, minWidth: 0 },
  presionado: { opacity: 0.8 },
  foto: { width: '100%', height: 130, borderRadius: 10, marginBottom: 10 },
  fotoPendiente: { width: '100%', height: 90, marginBottom: 10, gap: 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.superficieAlta, borderWidth: 1, borderColor: colores.bordeSuave },
  textoFotoPendiente: { color: colores.textoSuave, fontSize: 12 },
  filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  nombre: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: 'bold', color: colores.crema },
  badge: { backgroundColor: colores.cafe, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTexto: { color: colores.crema, fontSize: 10, fontWeight: 'bold' },
  descripcion: { color: colores.textoSuave, marginTop: 6, fontSize: 13 },
  verMas: { color: colores.dorado, fontSize: 12, marginTop: 2, textDecorationLine: 'underline' },
  precio: { fontSize: 17, fontWeight: 'bold', marginTop: 8, color: colores.dorado },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  boton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colores.superficieAlta },
  botonActivo: { backgroundColor: colores.dorado },
  textoBoton: { color: colores.dorado, fontWeight: '700', fontSize: 12 },
  textoBotonFavorito: { color: colores.textoClaro, fontWeight: '700', fontSize: 12 },
  textoBotonActivo: { color: colores.panel },
});
