import React, { useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';
import { comunes } from '../estilos';
import { categoriasPlatos } from '../datos/platos';

const esWeb = Platform.OS === 'web';

export default function NuevoPlatilloCamara({ onCerrar, onGuardar }) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState(categoriasPlatos[1]);
  const [fotoUri, setFotoUri] = useState('');
  const [usarCamara, setUsarCamara] = useState(false);
  const [cameraLista, setCameraLista] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [solicitandoPermiso, setSolicitandoPermiso] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const camara = useRef(null);
  const { width } = useWindowDimensions();
  const amplio = width >= 760;

  async function abrirCamara() {
    setMensaje('');
    if (!permiso?.granted) {
      setSolicitandoPermiso(true);
      try {
        const respuesta = await pedirPermiso();
        if (!respuesta.granted) {
          setMensaje(respuesta.canAskAgain
            ? 'Sin permiso de cámara. Puedes elegir una foto de la galería.'
            : 'El permiso de cámara está bloqueado. Actívalo en los ajustes o usa la galería.');
          return;
        }
      } catch {
        setMensaje('No se pudo solicitar el permiso de cámara. Usa la galería.');
        return;
      } finally {
        setSolicitandoPermiso(false);
      }
    }
    setCameraLista(false);
    setUsarCamara(true);
  }

  async function capturar() {
    if (capturando) return;
    if (!cameraLista || !camara.current) {
      setMensaje('La cámara todavía se está preparando.');
      return;
    }
    setCapturando(true);
    try {
      // En el teléfono la foto queda como archivo (se copia al guardar);
      // en web se necesita base64 porque no hay sistema de archivos.
      const foto = await camara.current.takePictureAsync({ quality: esWeb ? 0.4 : 0.6, base64: esWeb });
      const uri = esWeb && foto?.base64 ? `data:image/jpeg;base64,${foto.base64}` : foto?.uri;
      if (!uri) throw new Error('La cámara no devolvió una imagen.');
      setFotoUri(uri);
      setUsarCamara(false);
      setMensaje('Foto lista. Completa los datos y guarda el plato.');
    } catch {
      setMensaje('No se pudo tomar la foto. Comprueba el permiso y vuelve a intentarlo.');
    } finally {
      setCapturando(false);
    }
  }

  async function elegirDeGaleria() {
    setMensaje('');
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: esWeb,
      });
      if (resultado.canceled || !resultado.assets?.length) return;
      const imagen = resultado.assets[0];
      const uri = esWeb && imagen.base64 ? `data:${imagen.mimeType || 'image/jpeg'};base64,${imagen.base64}` : imagen.uri;
      setFotoUri(uri);
      setUsarCamara(false);
      setMensaje('Foto lista. Completa los datos y guarda el plato.');
    } catch {
      setMensaje('No se pudo abrir la galería.');
    }
  }

  async function guardar() {
    const nombreLimpio = nombre.trim();
    const valor = Number(precio.replace(/[^0-9]/g, ''));
    if (!nombreLimpio || !descripcion.trim() || !valor) {
      setMensaje('Completa nombre, descripción y un precio mayor que cero.');
      return;
    }
    if (!fotoUri) {
      setMensaje('Toma o elige una foto del plato antes de guardarlo.');
      return;
    }
    setGuardando(true);
    try {
      await onGuardar({ nombre: nombreLimpio, descripcion: descripcion.trim(), precio: valor, categoria, fotoUri });
      setMensaje('Plato agregado al menú de este dispositivo.');
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setFotoUri('');
    } catch (error) {
      setMensaje(error?.message?.includes('grande')
        ? 'La foto es demasiado grande para guardarla en el navegador. Prueba con otra más pequeña.'
        : 'No se pudo guardar el plato. Revisa el almacenamiento disponible.');
    } finally {
      setGuardando(false);
    }
  }

  let zonaFoto;
  if (fotoUri) {
    zonaFoto = (
      <>
        <Image source={{ uri: fotoUri }} accessibilityLabel="Foto del nuevo plato" style={s.foto} resizeMode="cover" />
        <Pressable accessibilityRole="button" onPress={() => setFotoUri('')} style={comunes.botonSecundario}>
          <Ionicons name="refresh" size={16} color={colores.dorado} />
          <Text style={comunes.textoBotonSecundario}>Cambiar foto</Text>
        </Pressable>
      </>
    );
  } else if (usarCamara && permiso?.granted) {
    zonaFoto = (
      <>
        <CameraView
          ref={camara}
          style={s.camara}
          facing="back"
          onCameraReady={() => setCameraLista(true)}
          onMountError={() => { setUsarCamara(false); setMensaje('No se pudo abrir la cámara en este dispositivo o navegador. Usa la galería.'); }}
        />
        <View style={comunes.fila}>
          <Pressable accessibilityRole="button" disabled={!cameraLista || capturando} onPress={capturar} style={[comunes.botonPrimario, (!cameraLista || capturando) && comunes.deshabilitado]}>
            <Text style={comunes.textoBotonPrimario}>{capturando ? 'Tomando foto...' : cameraLista ? 'Tomar foto del plato' : 'Preparando cámara...'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setUsarCamara(false)} style={comunes.botonSecundario}>
            <Text style={comunes.textoBotonSecundario}>Cancelar</Text>
          </Pressable>
        </View>
      </>
    );
  } else {
    zonaFoto = (
      <>
        <View style={s.fotoVacia}>
          <Ionicons name="image-outline" size={34} color={colores.textoSuave} />
          <Text style={comunes.aviso}>Agrega una foto del plato</Text>
        </View>
        <View style={comunes.fila}>
          <Pressable accessibilityRole="button" disabled={solicitandoPermiso} onPress={abrirCamara} style={[comunes.botonPrimario, s.botonIcono, solicitandoPermiso && comunes.deshabilitado]}>
            <Ionicons name="camera-outline" size={18} color={colores.crema} />
            <Text style={comunes.textoBotonPrimario}>{solicitandoPermiso ? 'Solicitando permiso...' : 'Usar cámara'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={elegirDeGaleria} style={[comunes.botonPrimario, s.botonIcono]}>
            <Ionicons name="images-outline" size={18} color={colores.crema} />
            <Text style={comunes.textoBotonPrimario}>Elegir de la galería</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <ScrollView style={comunes.pantalla} contentContainerStyle={comunes.contenido} keyboardShouldPersistTaps="handled">
      <Pressable accessibilityRole="button" onPress={onCerrar} style={comunes.botonSecundario}>
        <Ionicons name="arrow-back" size={16} color={colores.dorado} />
        <Text style={comunes.textoBotonSecundario}>Volver al menú</Text>
      </Pressable>
      <Text style={comunes.aviso}>La foto y los datos se guardan localmente en este dispositivo. No se envían a un servidor.</Text>

      <View style={[comunes.tarjeta, s.zonaFoto]}>{zonaFoto}</View>

      <View style={[s.campos, amplio && s.camposAmplios]}>
        <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre del plato" placeholderTextColor={colores.placeholder} accessibilityLabel="Nombre del plato" maxLength={60} style={[comunes.entrada, amplio && s.campoAmplio]} />
        <TextInput value={precio} onChangeText={(texto) => setPrecio(texto.replace(/[^0-9]/g, ''))} placeholder="Precio en pesos (ej.: 25000)" placeholderTextColor={colores.placeholder} accessibilityLabel="Precio del plato en pesos" keyboardType="numeric" maxLength={7} style={[comunes.entrada, amplio && s.campoAmplio]} />
      </View>
      <TextInput value={descripcion} onChangeText={setDescripcion} placeholder="Descripción breve del plato" placeholderTextColor={colores.placeholder} accessibilityLabel="Descripción del plato" maxLength={200} style={[comunes.entrada, s.multilinea]} multiline />

      <Text style={comunes.etiqueta}>Categoría</Text>
      <View style={comunes.fila}>
        {categoriasPlatos.map((opcion) => (
          <Pressable key={opcion} accessibilityRole="button" accessibilityState={{ selected: categoria === opcion }} onPress={() => setCategoria(opcion)} style={[comunes.chip, categoria === opcion && comunes.chipActivo]}>
            <Text style={[comunes.textoChip, categoria === opcion && comunes.textoChipActivo]}>{opcion}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable accessibilityRole="button" disabled={guardando} onPress={guardar} style={[comunes.botonPrimario, guardando && comunes.deshabilitado]}>
        <Text style={comunes.textoBotonPrimario}>{guardando ? 'Guardando...' : 'Guardar plato'}</Text>
      </Pressable>
      {!!mensaje && <Text accessibilityLiveRegion="polite" style={s.mensaje}>{mensaje}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  zonaFoto: { gap: 10 },
  camara: { width: '100%', height: 260, borderRadius: 10, overflow: 'hidden' },
  foto: { width: '100%', height: 220, borderRadius: 10 },
  fotoVacia: { height: 140, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: colores.borde },
  botonIcono: { flexDirection: 'row', gap: 8 },
  campos: { gap: 12 },
  camposAmplios: { flexDirection: 'row' },
  campoAmplio: { flex: 1, minWidth: 0 },
  multilinea: { minHeight: 90, textAlignVertical: 'top' },
  mensaje: { color: colores.crema, fontWeight: '700', lineHeight: 20 },
});
