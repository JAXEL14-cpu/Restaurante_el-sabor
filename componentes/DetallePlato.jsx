import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, fuenteTitulo } from '../tema';
import { comunes } from '../estilos';
import { esPlatoCreado, formatoPrecio, fuenteImagenPlato } from '../datos/platos';
import BotonConfirmar from './BotonConfirmar';

// Ventana con la información completa de un plato. El botón atrás de Android la cierra.
export default function DetallePlato({ plato, esFavorito, cantidadCarrito, onCerrar, onAgregarCarrito, onAlternarFavorito, onEliminar }) {
  const fuenteImagen = fuenteImagenPlato(plato);

  return (
    <Modal visible={!!plato} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={s.fondo}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Cerrar detalle" onPress={onCerrar} />
        {plato && (
          <View style={s.panel} accessibilityViewIsModal>
            <ScrollView contentContainerStyle={s.contenido}>
              {fuenteImagen
                ? <Image source={fuenteImagen} accessibilityLabel={`Fotografía de ${plato.nombre}`} style={s.foto} resizeMode="cover" />
                : null}
              <Text style={s.categoria}>{esPlatoCreado(plato) ? `${plato.categoria} · creado en este dispositivo` : plato.categoria}</Text>
              <Text style={s.nombre}>{plato.nombre}</Text>
              <Text style={comunes.texto}>{plato.descripcion}</Text>
              <Text style={comunes.precio}>{formatoPrecio(plato.precio)}</Text>
              <Text style={comunes.avisoPequeno}>Alérgenos y disponibilidad deben confirmarse con el personal antes de ordenar.</Text>
              <View style={comunes.fila}>
                <Pressable accessibilityRole="button" onPress={() => onAgregarCarrito(plato.id, 1)} style={comunes.botonPrimario}>
                  <Text style={comunes.textoBotonPrimario}>{cantidadCarrito > 0 ? `Agregar otra · ${cantidadCarrito} en carrito` : 'Agregar al carrito'}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityState={{ selected: esFavorito }} onPress={() => onAlternarFavorito(plato.id)} style={comunes.botonSecundario}>
                  <Ionicons name={esFavorito ? 'star' : 'star-outline'} size={16} color={colores.dorado} />
                  <Text style={comunes.textoBotonSecundario}>{esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}</Text>
                </Pressable>
              </View>
              {esPlatoCreado(plato) && (
                <BotonConfirmar
                  texto="Eliminar este plato"
                  pregunta={`¿Eliminar "${plato.nombre}" del menú de este dispositivo? También se quitará del carrito y de favoritos.`}
                  textoConfirmar="Sí, eliminar"
                  onConfirmar={() => onEliminar(plato.id)}
                />
              )}
              <Pressable accessibilityRole="button" onPress={onCerrar} style={comunes.botonSecundario}>
                <Text style={comunes.textoBotonSecundario}>Cerrar</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fondo: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: colores.sombra },
  panel: { width: '100%', maxWidth: 560, maxHeight: '90%', borderRadius: 16, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.borde, overflow: 'hidden' },
  contenido: { padding: 18, gap: 10 },
  foto: { width: '100%', height: 220, borderRadius: 12 },
  categoria: { color: colores.dorado, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  nombre: { color: colores.crema, fontFamily: fuenteTitulo, fontSize: 24, fontWeight: '700' },
});
