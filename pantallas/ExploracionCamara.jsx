import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colores } from '../tema';

export default function ExploracionCamara({ onCerrar }) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [frontal, setFrontal] = useState(false);
  const [error, setError] = useState('');
  const [solicitando, setSolicitando] = useState(false);
  const { width } = useWindowDimensions();

  async function solicitar() {
    setError('');
    setSolicitando(true);
    try {
      await pedirPermiso();
    } catch {
      setError('No se pudo solicitar el permiso. Puedes cerrar esta función.');
    } finally {
      setSolicitando(false);
    }
  }

  return (
    <ScrollView style={s.panel} contentContainerStyle={s.contenido}>
      <Pressable accessibilityRole="button" style={s.botonSecundario} onPress={onCerrar}>
        <Text style={s.textoBotonSecundario}>Volver a Sensores</Text>
      </Pressable>

      <Text style={s.texto}>
        Solo vista previa. Este ejemplo no toma ni guarda fotos y no pide micrófono.
      </Text>

      {!permiso ? (
        <Text style={s.estado}>Comprobando permiso de cámara...</Text>
      ) : !permiso.granted ? (
        <View style={s.panelEstado}>
          <Text style={s.estado}>{permiso.status === 'denied' ? 'Permiso denegado.' : 'Permiso pendiente.'}</Text>
          <Text style={s.texto}>Usamos la cámara únicamente para mostrar una vista previa.</Text>
          {permiso.canAskAgain ? (
            <Pressable accessibilityRole="button" disabled={solicitando} style={[s.boton, solicitando && s.deshabilitado]} onPress={solicitar}>
              <Text style={s.textoBoton}>{solicitando ? 'Solicitando permiso...' : 'Permitir cámara'}</Text>
            </Pressable>
          ) : (
            <Text style={s.texto}>
              Si quieres habilitarla, revisa los permisos de Expo Go o de tu app en Ajustes.
            </Text>
          )}
          <Text style={s.texto}>Puedes volver y continuar la práctica sin cámara.</Text>
        </View>
      ) : !error ? (
        <View style={s.panelEstado}>
          <Text style={s.estado}>Permiso concedido</Text>
          <CameraView
            style={[s.camara, width >= 760 && s.camaraAmplia]}
            facing={frontal ? 'front' : 'back'}
            onMountError={() => setError('No se pudo abrir la cámara. Cierra y revisa otra app que la use.')}
          />
          <Pressable accessibilityRole="button" style={s.boton} onPress={() => setFrontal((anterior) => !anterior)}>
            <Text style={s.textoBoton}>Cambiar a cámara {frontal ? 'trasera' : 'frontal'}</Text>
          </Pressable>
        </View>
      ) : null}

      {!!error && <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  panel: { flex: 1, minHeight: 0 },
  contenido: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingBottom: 28, gap: 12 },
  titulo: { fontSize: 24, fontWeight: '800', color: colores.crema },
  texto: { color: colores.textoSuave, lineHeight: 21 },
  estado: { color: colores.crema, fontWeight: '700', lineHeight: 21 },
  panelEstado: { padding: 14, borderRadius: 12, backgroundColor: colores.superficie, gap: 10 },
  boton: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 16, marginTop: 6, backgroundColor: colores.doradoOscuro, borderRadius: 9 },
  textoBoton: { color: colores.crema, fontWeight: '800' },
  botonSecundario: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 14, backgroundColor: colores.superficieAlta, borderRadius: 9 },
  textoBotonSecundario: { color: colores.dorado, fontWeight: '700' },
  deshabilitado: { opacity: 0.55 },
  camara: { width: '100%', height: 280, marginTop: 4, borderRadius: 12, overflow: 'hidden' },
  camaraAmplia: { height: 420 },
  error: { padding: 12, color: colores.crema, lineHeight: 20, backgroundColor: colores.error, borderRadius: 10 },
});

