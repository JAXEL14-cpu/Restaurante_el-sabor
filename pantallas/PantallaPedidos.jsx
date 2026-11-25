import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';
import { comunes } from '../estilos';
import { formatoFecha, formatoPrecio, valorPrecio } from '../datos/platos';
import BotonConfirmar from '../componentes/BotonConfirmar';

export default function PantallaPedidos({ pedidos, onRepetir, onBorrarHistorial, onVolverMenu }) {
  return (
    <ScrollView style={comunes.pantalla} contentContainerStyle={comunes.contenido}>
      <Text style={comunes.aviso}>Historial guardado en este dispositivo. Los pedidos son demostrativos y no llegan al restaurante.</Text>
      {pedidos.length === 0 ? (
        <View style={comunes.vacio}>
          <Text style={comunes.tituloVacio}>Aún no hay pedidos</Text>
          <Text style={comunes.aviso}>Cuando confirmes un pedido de demostración, aparecerá aquí.</Text>
          <Pressable accessibilityRole="button" onPress={onVolverMenu} style={comunes.botonPrimario}>
            <Text style={comunes.textoBotonPrimario}>Explorar menú</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {pedidos.map((pedido) => (
            <View key={pedido.codigo + (pedido.fecha || '')} style={comunes.tarjeta}>
              <View style={s.cabecera}>
                <Text style={s.titulo}>Pedido #{pedido.codigo}</Text>
                {!!pedido.fecha && <Text style={comunes.avisoPequeno}>{formatoFecha(pedido.fecha)}</Text>}
              </View>
              <Text style={comunes.texto}>{pedido.nombre} · {pedido.tipo === 'mesa' ? `Mesa ${pedido.mesa}` : 'Para llevar'}</Text>
              <Text style={s.estado}>Estado: {pedido.estado || 'Recibido (demostración)'}</Text>
              {(pedido.productos || []).map((producto, indice) => (
                <Text key={`${pedido.codigo}-${indice}`} style={comunes.texto}>
                  {producto.cantidad} × {producto.nombre} · {formatoPrecio(valorPrecio(producto.precio) * producto.cantidad)}
                </Text>
              ))}
              {!!pedido.nota && <Text style={comunes.aviso}>Nota: {pedido.nota}</Text>}
              <Text style={s.total}>Total estimado: {formatoPrecio(pedido.total)}</Text>
              <Text style={comunes.avisoPequeno}>Pago: {pedido.metodoPago || 'No seleccionado'} (sin cobro real)</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Repetir pedido ${pedido.codigo}: agrega sus platos al carrito`} onPress={() => onRepetir(pedido)} style={comunes.botonSecundario}>
                <Ionicons name="repeat" size={16} color={colores.dorado} />
                <Text style={comunes.textoBotonSecundario}>Repetir pedido</Text>
              </Pressable>
            </View>
          ))}
          <BotonConfirmar
            texto="Borrar historial"
            pregunta="¿Borrar todos los pedidos guardados en este dispositivo? No se puede deshacer."
            textoConfirmar="Sí, borrar"
            onConfirmar={onBorrarHistorial}
          />
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cabecera: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  titulo: { color: colores.dorado, fontSize: 18, fontWeight: '800' },
  estado: { color: colores.verdeClaro, fontWeight: '800' },
  total: { color: colores.dorado, fontSize: 17, fontWeight: '800', marginTop: 4 },
});
