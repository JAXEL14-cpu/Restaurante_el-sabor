import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';
import { comunes } from '../estilos';
import { clasificar, detectarPlato, intencionesGenerales } from '../datos/modeloIA';
import { datosRestaurante, formatoPrecio, fuenteImagenPlato } from '../datos/platos';

const INTENCIONES_MANUALES = [
  { id: 'precio', etiqueta: 'Precio' },
  { id: 'descripcion', etiqueta: 'Ingredientes' },
  { id: 'alergenos', etiqueta: 'Picante / alérgenos' },
  { id: 'horario', etiqueta: 'Horario' },
  { id: 'recomendacion', etiqueta: 'Recomendación' },
];

const SUGERENCIAS = ['¿Cuánto cuesta?', '¿Qué ingredientes lleva?', '¿Es picante?', '¿Qué me recomiendas?', '¿A qué hora abren?', '¿Dónde quedan?'];

function redactarRespuesta(intencion, plato, platoDestacado) {
  switch (intencion) {
    case 'precio': return `${plato.nombre} cuesta ${formatoPrecio(plato.precio)}.`;
    case 'nombre': return `El plato seleccionado se llama ${plato.nombre}.`;
    case 'descripcion': return `${plato.nombre}: ${plato.descripcion}`;
    case 'categoria': return `${plato.nombre} está en la categoría "${plato.categoria}".`;
    case 'alergenos': return `La descripción de ${plato.nombre} dice: "${plato.descripcion}". No tengo información verificada sobre picante ni alérgenos: confírmalo con el personal antes de ordenar.`;
    case 'horario': return `Horario: ${datosRestaurante.horario}.`;
    case 'direccion': return `Dirección: ${datosRestaurante.direccion}.`;
    case 'telefono': return `Teléfono / WhatsApp: ${datosRestaurante.telefono}.`;
    case 'recomendacion': return platoDestacado
      ? `Hoy te recomiendo ${platoDestacado.nombre} (${formatoPrecio(platoDestacado.precio)}): ${platoDestacado.descripcion}`
      : 'Todavía no hay platos para recomendar.';
    default: return 'No tengo ese dato en el catálogo.';
  }
}

export default function AsistenteIA({ productos = [], platoDestacado, onAgregarCarrito }) {
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState(null);
  const [eleccionManual, setEleccionManual] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const { width } = useWindowDimensions();
  const producto = productos.find((plato) => plato.id === idSeleccionado) || productos[0] || null;
  const fuenteImagen = fuenteImagenPlato(producto);

  function siguientePlato() {
    if (productos.length < 2) return;
    const indice = productos.findIndex((plato) => plato.id === producto?.id);
    setIdSeleccionado(productos[(indice + 1) % productos.length].id);
    setRespuesta(null);
    setEleccionManual(false);
  }

  function responder(intencion, { plato = producto, detalle } = {}) {
    setEleccionManual(false);
    if (!intencionesGenerales.has(intencion) && !plato) {
      setRespuesta({ texto: 'No hay platos disponibles en el catálogo.' });
      return;
    }
    if (intencion === 'recomendacion' && platoDestacado) setIdSeleccionado(platoDestacado.id);
    setRespuesta({ texto: redactarRespuesta(intencion, plato, platoDestacado), detalle });
  }

  function consultar(textoPregunta = pregunta) {
    const texto = textoPregunta.trim();
    setEleccionManual(false);
    if (!texto) {
      setRespuesta({ texto: 'Escribe una pregunta antes de consultar.' });
      return;
    }
    setPregunta(texto);
    const encontrado = detectarPlato(texto, productos);
    const plato = encontrado?.producto || producto;
    if (encontrado) setIdSeleccionado(encontrado.producto.id);
    const resultado = clasificar(texto, encontrado?.coincidencias || []);
    const partes = [];
    if (encontrado) partes.push(`plato detectado: ${encontrado.producto.nombre}`);
    if (!resultado.intencion) {
      setRespuesta({
        texto: encontrado
          ? `Entendí que preguntas por ${encontrado.producto.nombre}, pero no qué dato quieres. Elige una opción:`
          : 'No estoy seguro de qué quieres saber. Elige qué dato consultar:',
        detalle: partes.join(' · '),
      });
      setEleccionManual(true);
      return;
    }
    partes.unshift(`intención: ${resultado.intencion}`, `similitud didáctica: ${resultado.puntuacion.toFixed(2)}`);
    responder(resultado.intencion, { plato, detalle: partes.join(' · ') });
  }

  return (
    <ScrollView style={comunes.pantalla} contentContainerStyle={comunes.contenido} keyboardShouldPersistTaps="handled">
      <Text style={comunes.aviso}>Clasificador local de vecino más cercano: reconoce precio, ingredientes, alérgenos, categoría, horario, dirección, teléfono y recomendaciones. Si nombras un plato, responde sobre ese plato. No es un chatbot y puede equivocarse.</Text>

      <View style={[s.productoBox, width >= 760 && s.productoBoxAmplio]}>
        {fuenteImagen ? <Image accessibilityLabel={`Fotografía de ${producto?.nombre}`} source={fuenteImagen} style={s.foto} resizeMode="cover" /> : null}
        <View style={s.detalle}>
          <Text style={comunes.etiqueta}>Plato seleccionado</Text>
          <Text style={s.nombre}>{producto?.nombre ?? 'Sin platos'}</Text>
          {producto && <Text style={comunes.aviso}>{formatoPrecio(producto.precio)} · {producto.categoria}</Text>}
          <View style={comunes.fila}>
            <Pressable accessibilityRole="button" accessibilityLabel="Mostrar el siguiente plato del catálogo" style={[comunes.botonSecundario, productos.length < 2 && comunes.deshabilitado]} disabled={productos.length < 2} onPress={siguientePlato}>
              <Text style={comunes.textoBotonSecundario}>Siguiente plato</Text>
            </Pressable>
            {producto && (
              <Pressable accessibilityRole="button" accessibilityLabel={`Agregar ${producto.nombre} al carrito`} style={comunes.botonSecundario} onPress={() => onAgregarCarrito(producto.id, 1)}>
                <Ionicons name="cart-outline" size={16} color={colores.dorado} />
                <Text style={comunes.textoBotonSecundario}>Agregar</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <Text style={comunes.etiqueta}>Pregunta sobre un plato o el restaurante</Text>
      <View style={[s.formulario, width >= 700 && s.formularioAmplio]}>
        <TextInput
          value={pregunta}
          onChangeText={(valor) => { setPregunta(valor); setEleccionManual(false); }}
          onSubmitEditing={() => consultar()}
          placeholder="Ejemplo: ¿cuánto cuesta la bandeja paisa?"
          placeholderTextColor={colores.placeholder}
          accessibilityLabel="Pregunta para el asistente"
          returnKeyType="send"
          blurOnSubmit
          style={[comunes.entrada, width >= 700 && s.entradaAmplia]}
        />
        <Pressable accessibilityRole="button" style={comunes.botonPrimario} onPress={() => consultar()}>
          <Text style={comunes.textoBotonPrimario}>Consultar</Text>
        </Pressable>
      </View>

      <View style={comunes.fila}>
        {SUGERENCIAS.map((sugerencia) => (
          <Pressable key={sugerencia} accessibilityRole="button" accessibilityLabel={`Preguntar: ${sugerencia}`} onPress={() => consultar(sugerencia)} style={comunes.chip}>
            <Text style={comunes.textoChip}>{sugerencia}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.resultado} accessibilityLiveRegion="polite">
        <Text style={s.textoResultado}>{respuesta?.texto || 'Aquí aparecerá la respuesta.'}</Text>
        {!!respuesta?.detalle && <Text style={comunes.avisoPequeno}>{respuesta.detalle}</Text>}
      </View>

      {eleccionManual && (
        <View style={comunes.fila}>
          {INTENCIONES_MANUALES.map((opcion) => (
            <Pressable key={opcion.id} accessibilityRole="button" style={comunes.chip} onPress={() => responder(opcion.id, { detalle: 'intención elegida manualmente' })}>
              <Text style={comunes.textoChip}>{opcion.etiqueta}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={comunes.avisoPequeno}>La similitud no es una probabilidad de certeza. Las respuestas salen de los datos del catálogo y del restaurante.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  productoBox: { padding: 14, gap: 10, borderRadius: 12, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.borde },
  productoBoxAmplio: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  foto: { width: 120, height: 90, borderRadius: 9 },
  detalle: { flex: 1, minWidth: 0, gap: 4 },
  nombre: { fontSize: 17, fontWeight: '700', color: colores.crema },
  formulario: { gap: 10 },
  formularioAmplio: { flexDirection: 'row', alignItems: 'center' },
  entradaAmplia: { flex: 1, minWidth: 0 },
  resultado: { padding: 14, gap: 6, borderRadius: 10, backgroundColor: colores.superficieAlta },
  textoResultado: { fontSize: 16, lineHeight: 23, color: colores.crema },
});
