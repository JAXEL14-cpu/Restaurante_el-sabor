import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';
import { comunes } from '../estilos';
import { formatoPrecio, fuenteImagenPlato, valorPrecio } from '../datos/platos';
import BotonConfirmar from '../componentes/BotonConfirmar';

const METODOS_PAGO = [
  { id: 'en caja', texto: 'Pagar en caja' },
  { id: 'al recibir', texto: 'Pagar al recibir' },
];

// Código corto y legible para el cliente, por ejemplo "K3F9ZQ".
function generarCodigo() {
  return Date.now().toString(36).toUpperCase().slice(-6);
}

export default function PantallaCarrito({ catalogo, carrito, nombreSugerido = '', onCambiarCantidad, onVaciar, onConfirmarPedido, onVolverMenu, onVerPedidos }) {
  const [nombreCliente, setNombreCliente] = useState(nombreSugerido);
  const [numeroMesa, setNumeroMesa] = useState('');
  const [tipoPedido, setTipoPedido] = useState('mesa');
  const [metodoPago, setMetodoPago] = useState('en caja');
  const [notaPedido, setNotaPedido] = useState('');
  const [errorPedido, setErrorPedido] = useState('');
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const { width } = useWindowDimensions();
  const seleccionados = catalogo.filter((plato) => carrito[plato.id] > 0);
  const total = seleccionados.reduce((suma, plato) => suma + valorPrecio(plato.precio) * carrito[plato.id], 0);
  const unidades = seleccionados.reduce((suma, plato) => suma + carrito[plato.id], 0);

  function confirmarPedido() {
    if (seleccionados.length === 0) return setErrorPedido('Agrega al menos un plato antes de confirmar el pedido.');
    if (!nombreCliente.trim()) return setErrorPedido('Escribe el nombre de quien realiza el pedido.');
    if (tipoPedido === 'mesa' && !numeroMesa.trim()) return setErrorPedido('Indica el número de mesa para el servicio en el restaurante.');

    const nuevoPedido = {
      codigo: generarCodigo(),
      nombre: nombreCliente.trim(),
      tipo: tipoPedido,
      mesa: tipoPedido === 'mesa' ? numeroMesa.trim() : '',
      metodoPago,
      nota: notaPedido.trim(),
      estado: 'Recibido (demostración)',
      fecha: new Date().toISOString(),
      productos: seleccionados.map((plato) => ({
        platoId: plato.id,
        nombre: plato.nombre,
        cantidad: carrito[plato.id],
        precio: valorPrecio(plato.precio),
      })),
      total,
    };
    setPedidoConfirmado(nuevoPedido);
    setErrorPedido('');
    onConfirmarPedido(nuevoPedido);
  }

  if (pedidoConfirmado) {
    return (
      <ScrollView style={comunes.pantalla} contentContainerStyle={comunes.contenido}>
        <View style={s.confirmacion}>
          <Ionicons name="checkmark-circle" size={44} color={colores.verdeClaro} style={s.centro} />
          <Text style={s.tituloConfirmacion}>Pedido confirmado en esta pantalla</Text>
          <Text style={comunes.texto}>Número de pedido: #{pedidoConfirmado.codigo}</Text>
          <Text style={comunes.texto}>Nombre: {pedidoConfirmado.nombre}</Text>
          <Text style={comunes.texto}>{pedidoConfirmado.tipo === 'mesa' ? `Servicio en mesa ${pedidoConfirmado.mesa}` : 'Pedido para llevar'}</Text>
          <Text style={comunes.texto}>Pago elegido: {pedidoConfirmado.metodoPago} (demostración)</Text>
          {!!pedidoConfirmado.nota && <Text style={comunes.texto}>Nota: {pedidoConfirmado.nota}</Text>}
          <View style={s.linea} />
          {pedidoConfirmado.productos.map((producto) => (
            <Text key={String(producto.platoId)} style={comunes.texto}>{producto.cantidad} × {producto.nombre} · {formatoPrecio(producto.precio * producto.cantidad)}</Text>
          ))}
          <Text style={s.total}>Total estimado: {formatoPrecio(pedidoConfirmado.total)}</Text>
          <Text style={comunes.aviso}>Demostración: el pedido no se envía al restaurante y no se realiza ningún cobro.</Text>
          <View style={comunes.fila}>
            <Pressable accessibilityRole="button" onPress={onVolverMenu} style={comunes.botonPrimario}>
              <Text style={comunes.textoBotonPrimario}>Volver al menú</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onVerPedidos} style={comunes.botonSecundario}>
              <Text style={comunes.textoBotonSecundario}>Ver mis pedidos</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={comunes.pantalla} contentContainerStyle={comunes.contenido} keyboardShouldPersistTaps="handled">
      <Text style={comunes.aviso}>Revisa los platos, elige cómo recibir el pedido y confirma. Esta demostración no cobra ni envía pedidos al restaurante.</Text>

      {seleccionados.length === 0 ? (
        <View style={comunes.vacio}>
          <Text style={comunes.tituloVacio}>El carrito está vacío</Text>
          <Text style={comunes.aviso}>Vuelve al menú y agrega platos con el botón “Agregar”.</Text>
          <Pressable accessibilityRole="button" onPress={onVolverMenu} style={comunes.botonPrimario}>
            <Text style={comunes.textoBotonPrimario}>Explorar menú</Text>
          </Pressable>
        </View>
      ) : seleccionados.map((plato) => {
        const fuenteImagen = fuenteImagenPlato(plato);
        const cantidad = carrito[plato.id];
        return (
          <View key={String(plato.id)} style={s.item}>
            {fuenteImagen
              ? <Image source={fuenteImagen} style={s.miniatura} resizeMode="cover" />
              : <View style={[s.miniatura, s.miniaturaVacia]}><Ionicons name="restaurant-outline" size={20} color={colores.textoSuave} /></View>}
            <View style={s.textoItem}>
              <Text style={s.nombre} numberOfLines={2}>{plato.nombre}</Text>
              <Text style={comunes.avisoPequeno}>{formatoPrecio(plato.precio)} c/u · Subtotal {formatoPrecio(valorPrecio(plato.precio) * cantidad)}</Text>
            </View>
            <View style={s.controles}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Quitar una unidad de ${plato.nombre}`} style={s.control} onPress={() => onCambiarCantidad(plato.id, -1)}>
                <Ionicons name={cantidad === 1 ? 'trash-outline' : 'remove'} size={18} color={colores.textoClaro} />
              </Pressable>
              <Text style={s.cantidad} accessibilityLabel={`${cantidad} unidades`}>{cantidad}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Agregar una unidad de ${plato.nombre}`} style={s.control} onPress={() => onCambiarCantidad(plato.id, 1)}>
                <Ionicons name="add" size={18} color={colores.textoClaro} />
              </Pressable>
            </View>
          </View>
        );
      })}

      {seleccionados.length > 0 && (
        <>
          <View style={s.totalCarrito}>
            <Text style={s.nombre}>Total estimado ({unidades} {unidades === 1 ? 'producto' : 'productos'})</Text>
            <Text style={comunes.precio}>{formatoPrecio(total)}</Text>
          </View>
          <BotonConfirmar texto="Vaciar carrito" pregunta="¿Quitar todos los platos del carrito?" textoConfirmar="Sí, vaciar" onConfirmar={onVaciar} />

          <View style={[comunes.tarjeta, s.formulario]}>
            <Text style={comunes.subtitulo}>Datos para el pedido</Text>
            <Text style={comunes.etiqueta}>Nombre</Text>
            <TextInput
              value={nombreCliente}
              onChangeText={(texto) => { setNombreCliente(texto); setErrorPedido(''); }}
              placeholder="Nombre de quien ordena"
              placeholderTextColor={colores.placeholder}
              accessibilityLabel="Nombre de quien realiza el pedido"
              style={comunes.entrada}
              maxLength={60}
            />
            <Text style={comunes.etiqueta}>¿Cómo recibirás tu pedido?</Text>
            <View style={[s.opciones, width >= 650 && s.opcionesAmplias]}>
              {[{ id: 'mesa', texto: 'En una mesa' }, { id: 'llevar', texto: 'Para llevar' }].map((opcion) => (
                <Pressable key={opcion.id} accessibilityRole="button" accessibilityState={{ selected: tipoPedido === opcion.id }} onPress={() => { setTipoPedido(opcion.id); setErrorPedido(''); }} style={[s.opcion, tipoPedido === opcion.id && comunes.chipActivo]}>
                  <Text style={[comunes.textoChip, tipoPedido === opcion.id && comunes.textoChipActivo]}>{opcion.texto}</Text>
                </Pressable>
              ))}
            </View>
            {tipoPedido === 'mesa' && (
              <>
                <Text style={comunes.etiqueta}>Número de mesa</Text>
                <TextInput
                  value={numeroMesa}
                  onChangeText={(texto) => { setNumeroMesa(texto.replace(/[^0-9]/g, '')); setErrorPedido(''); }}
                  placeholder="Ejemplo: 4"
                  placeholderTextColor={colores.placeholder}
                  accessibilityLabel="Número de mesa"
                  keyboardType="numeric"
                  style={comunes.entrada}
                  maxLength={3}
                />
              </>
            )}
            <Text style={comunes.etiqueta}>Forma de pago (solo demostración)</Text>
            <View style={[s.opciones, width >= 650 && s.opcionesAmplias]}>
              {METODOS_PAGO.map((opcion) => (
                <Pressable key={opcion.id} accessibilityRole="button" accessibilityState={{ selected: metodoPago === opcion.id }} onPress={() => setMetodoPago(opcion.id)} style={[s.opcion, metodoPago === opcion.id && comunes.chipActivo]}>
                  <Text style={[comunes.textoChip, metodoPago === opcion.id && comunes.textoChipActivo]}>{opcion.texto}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={comunes.etiqueta}>Nota para cocina (opcional)</Text>
            <TextInput value={notaPedido} onChangeText={setNotaPedido} placeholder="Ej.: sin salsa" placeholderTextColor={colores.placeholder} accessibilityLabel="Nota opcional para el pedido" style={comunes.entrada} maxLength={160} />
            {!!errorPedido && <Text accessibilityLiveRegion="polite" style={comunes.error}>{errorPedido}</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel={`Confirmar pedido de ${formatoPrecio(total)}, demostración`} onPress={confirmarPedido} style={comunes.botonPrimario}>
              <Text style={comunes.textoBotonPrimario}>Confirmar pedido (demostración)</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, backgroundColor: colores.superficie },
  miniatura: { width: 56, height: 48, borderRadius: 8 },
  miniaturaVacia: { alignItems: 'center', justifyContent: 'center', backgroundColor: colores.superficieAlta },
  textoItem: { flex: 1, minWidth: 0, gap: 2 },
  nombre: { color: colores.crema, fontWeight: 'bold', fontSize: 15, flexShrink: 1 },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  control: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colores.superficieAlta },
  cantidad: { minWidth: 22, textAlign: 'center', fontWeight: '800', color: colores.crema },
  totalCarrito: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, backgroundColor: colores.superficie },
  formulario: { gap: 10 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcionesAmplias: { flexWrap: 'nowrap' },
  opcion: { flex: 1, minWidth: 120, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.botonOscuro },
  confirmacion: { padding: 18, gap: 10, borderRadius: 14, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.verde },
  centro: { alignSelf: 'center' },
  tituloConfirmacion: { color: colores.crema, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  linea: { height: 1, backgroundColor: colores.borde, marginVertical: 4 },
  total: { color: colores.dorado, fontSize: 18, fontWeight: '800', marginTop: 4 },
});
