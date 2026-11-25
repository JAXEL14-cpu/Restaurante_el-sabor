import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';
import { comunes } from '../estilos';
import { categoriasMenu, esPlatoCreado, formatoPrecio, normalizarBusqueda } from '../datos/platos';
import Tarjeta from '../componentes/Tarjeta';
import BotonConfirmar from '../componentes/BotonConfirmar';

// Catálogo con búsqueda, categorías, favoritos y columnas adaptadas al ancho disponible.
export default function PantallaMenu({
  catalogo, favoritos, carrito, busqueda, categoria, soloFavoritos,
  onCambiarBusqueda, onCambiarCategoria, onCambiarSoloFavoritos, onLimpiarFiltros, onBorrarFavoritos,
  onAbrirPlato, onAgregarCarrito, onAlternarFavorito,
}) {
  const { width } = useWindowDimensions();
  const esTableta = width >= 600;
  const esPantallaGrande = width >= 900;
  let columnas = 1;
  if (esPantallaGrande) columnas = 3;
  else if (esTableta) columnas = 2;
  let tipoDispositivo = 'Teléfono';
  if (esPantallaGrande) tipoDispositivo = 'Pantalla grande';
  else if (esTableta) tipoDispositivo = 'Tableta';

  const platosVisibles = useMemo(() => {
    const texto = normalizarBusqueda(busqueda.trim());
    return catalogo.filter((plato) => {
      const coincideFavorito = !soloFavoritos || favoritos.includes(plato.id);
      const coincideCategoria = categoria === 'Todos'
        || (categoria === 'Nuevos' ? esPlatoCreado(plato) : plato.categoria === categoria);
      const textoPlato = normalizarBusqueda(`${plato.nombre} ${plato.descripcion} ${formatoPrecio(plato.precio)}`);
      return coincideFavorito && coincideCategoria && (!texto || textoPlato.includes(texto));
    });
  }, [catalogo, favoritos, busqueda, categoria, soloFavoritos]);

  // Huecos invisibles para completar la última fila: así todas las tarjetas miden lo mismo.
  const datos = useMemo(() => {
    const faltan = (columnas - (platosVisibles.length % columnas)) % columnas;
    return [...platosVisibles, ...Array.from({ length: faltan }, (_, i) => ({ id: `hueco-${i}`, hueco: true }))];
  }, [platosVisibles, columnas]);

  const renderItem = useCallback(({ item, index }) => {
    if (item.hueco) return <View style={s.hueco} />;
    return (
      <Tarjeta
        plato={item}
        colorBorde={index % 2 === 0 ? colores.verde : colores.cafe}
        adaptativa={columnas > 1}
        esFavorito={favoritos.includes(item.id)}
        cantidadCarrito={carrito[item.id] || 0}
        onAbrir={onAbrirPlato}
        onAgregarCarrito={onAgregarCarrito}
        onAlternarFavorito={onAlternarFavorito}
      />
    );
  }, [columnas, favoritos, carrito, onAbrirPlato, onAgregarCarrito, onAlternarFavorito]);

  const encabezado = (
    <View style={s.encabezado}>
      <View style={s.filtros}>
        <View style={s.busqueda}>
          <Ionicons name="search" size={18} color={colores.placeholder} />
          <TextInput
            value={busqueda}
            onChangeText={onCambiarBusqueda}
            placeholder="Buscar plato o ingrediente..."
            placeholderTextColor={colores.placeholder}
            accessibilityLabel="Buscar en el menú"
            returnKeyType="search"
            style={s.campoBusqueda}
          />
          {!!busqueda && (
            <Pressable accessibilityRole="button" accessibilityLabel="Borrar búsqueda" hitSlop={10} onPress={() => onCambiarBusqueda('')}>
              <Ionicons name="close-circle" size={20} color={colores.placeholder} />
            </Pressable>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categorias}>
          {categoriasMenu.map((opcion) => (
            <Pressable
              key={opcion}
              accessibilityRole="button"
              accessibilityState={{ selected: categoria === opcion }}
              onPress={() => onCambiarCategoria(opcion)}
              style={[comunes.chip, categoria === opcion && comunes.chipActivo]}
            >
              <Text style={[comunes.textoChip, categoria === opcion && comunes.textoChipActivo]}>{opcion}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={comunes.avisoPequeno}>Toca un plato para ver su descripción completa. Alérgenos y disponibilidad deben confirmarse con el personal.</Text>
      </View>

      {favoritos.length > 0 && (
        <View style={s.favoritos}>
          <Text style={s.tituloFavoritos}>★ Favoritos: {favoritos.length}</Text>
          <View style={comunes.fila}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: soloFavoritos }}
              hitSlop={8}
              onPress={() => onCambiarSoloFavoritos(!soloFavoritos)}
              style={comunes.botonSecundario}
            >
              <Text style={comunes.textoBotonSecundario}>{soloFavoritos ? 'Ver menú completo' : `Ver solo favoritos (${favoritos.length})`}</Text>
            </Pressable>
            <BotonConfirmar
              texto="Borrar favoritos"
              pregunta="¿Quitar todos los platos de favoritos en este dispositivo?"
              textoConfirmar="Sí, borrar"
              onConfirmar={onBorrarFavoritos}
            />
          </View>
        </View>
      )}
    </View>
  );

  const vacio = (
    <View style={[comunes.vacio, s.vacio]}>
      <Text style={comunes.tituloVacio}>{soloFavoritos && favoritos.length === 0 ? 'Todavía no guardaste favoritos' : 'No encontramos platos'}</Text>
      <Text style={comunes.aviso}>{soloFavoritos && favoritos.length === 0 ? 'Pulsa "Marcar favorito" en los platos que quieras conservar.' : 'Prueba con otra búsqueda o selecciona otra categoría.'}</Text>
      <Pressable accessibilityRole="button" onPress={onLimpiarFiltros} style={comunes.botonPrimario}>
        <Text style={comunes.textoBotonPrimario}>Limpiar filtros</Text>
      </Pressable>
    </View>
  );

  return (
    <FlatList
      style={comunes.pantalla}
      data={datos}
      numColumns={columnas}
      key={columnas}
      keyExtractor={(item) => String(item.id)}
      initialNumToRender={8}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.contenido}
      ListHeaderComponent={encabezado}
      ListEmptyComponent={vacio}
      ListFooterComponent={(
        <View style={[s.resumen, esTableta && s.resumenAmplio]}>
          <Text style={s.tituloResumen}>Resumen del catálogo</Text>
          <Text style={s.datoResumen}>Platos: {catalogo.length}</Text>
          <Text style={s.datoResumen}>Resultados: {platosVisibles.length}</Text>
          <Text style={s.datoResumen}>Dispositivo: {tipoDispositivo}</Text>
          <Text style={s.datoResumen}>Columnas: {columnas}</Text>
        </View>
      )}
      columnWrapperStyle={columnas > 1 ? s.fila : undefined}
      renderItem={renderItem}
    />
  );
}

const s = StyleSheet.create({
  contenido: { paddingHorizontal: 16, paddingBottom: 24 },
  encabezado: { gap: 8, paddingHorizontal: 4 },
  filtros: { padding: 12, gap: 10, borderRadius: 12, backgroundColor: colores.superficie },
  busqueda: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colores.borde, borderRadius: 9, backgroundColor: colores.panel },
  campoBusqueda: { flex: 1, minWidth: 0, minHeight: 46, color: colores.crema, fontSize: 16 },
  categorias: { gap: 8, paddingRight: 4 },
  favoritos: { padding: 12, gap: 8, borderRadius: 12, backgroundColor: colores.superficie },
  tituloFavoritos: { color: colores.crema, fontWeight: '700' },
  vacio: { marginTop: 12, marginHorizontal: 4 },
  fila: { gap: 8 },
  hueco: { flex: 1, marginHorizontal: 4 },
  resumen: { marginTop: 18, marginHorizontal: 4, padding: 16, gap: 5, borderRadius: 14, backgroundColor: colores.superficie },
  resumenAmplio: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: 12 },
  tituloResumen: { color: colores.crema, fontWeight: 'bold', fontSize: 17 },
  datoResumen: { color: colores.textoSuave, fontSize: 14 },
});
