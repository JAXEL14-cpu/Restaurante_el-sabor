import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { comunes } from '../estilos';

// Botón para acciones que no se pueden deshacer: el primer toque pide confirmación.
// (Alert.alert no funciona en web, por eso la confirmación va en la misma pantalla.)
export default function BotonConfirmar({ texto, pregunta, textoConfirmar = 'Sí, continuar', onConfirmar, disabled = false }) {
  const [preguntando, setPreguntando] = useState(false);

  if (!preguntando) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setPreguntando(true)}
        style={[comunes.botonSecundario, disabled && comunes.deshabilitado]}
      >
        <Text style={comunes.textoBotonSecundario}>{texto}</Text>
      </Pressable>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={comunes.texto} accessibilityLiveRegion="polite">{pregunta}</Text>
      <View style={comunes.fila}>
        <Pressable
          accessibilityRole="button"
          onPress={() => { setPreguntando(false); onConfirmar(); }}
          style={[comunes.botonSecundario, comunes.botonPeligro]}
        >
          <Text style={[comunes.textoBotonSecundario, comunes.textoBotonPeligro]}>{textoConfirmar}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setPreguntando(false)} style={comunes.botonSecundario}>
          <Text style={comunes.textoBotonSecundario}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}
