import React, { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colores } from '../tema';

// Mensaje flotante para toda la app (guardado, errores, confirmaciones).
// Se oculta solo a los 3,5 segundos o al tocarlo.
export default function Aviso({ aviso, onCerrar }) {
  const insets = useSafeAreaInsets();
  const [opacidad] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!aviso) return undefined;
    const usarDriverNativo = Platform.OS !== 'web';
    opacidad.setValue(0);
    Animated.timing(opacidad, { toValue: 1, duration: 180, useNativeDriver: usarDriverNativo }).start();
    const temporizador = setTimeout(onCerrar, aviso.tipo === 'error' ? 5000 : 3500);
    return () => clearTimeout(temporizador);
  }, [aviso, onCerrar, opacidad]);

  if (!aviso) return null;
  return (
    <Animated.View pointerEvents="box-none" style={[s.contenedor, { bottom: insets.bottom + 16, opacity: opacidad }]}>
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityHint="Toca para cerrar el mensaje"
        onPress={onCerrar}
        style={[s.aviso, aviso.tipo === 'error' && s.avisoError, aviso.tipo === 'exito' && s.avisoExito]}
      >
        <Text style={s.texto}>{aviso.texto}</Text>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  contenedor: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 50 },
  aviso: { width: '100%', maxWidth: 520, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colores.superficieAlta, borderWidth: 1, borderColor: colores.borde, elevation: 8 },
  avisoError: { backgroundColor: colores.error, borderColor: colores.errorTexto },
  avisoExito: { backgroundColor: colores.verdeOscuro, borderColor: colores.verde },
  texto: { color: colores.crema, fontWeight: '700', lineHeight: 20 },
});
