import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';
import { comunes } from '../estilos';

function Boton({ texto, onPress, destacado = false, etiqueta }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={etiqueta || texto} style={[s.boton, destacado && s.botonDestacado]} onPress={onPress}>
      <Text style={s.textoBoton}>{texto}</Text>
    </Pressable>
  );
}

export default function PantallaSensores({ onAbrirCamara }) {
  const ultimoAvisoMeseroRef = useRef(0);
  const orientacionHorizontalDesdeRef = useRef(null);
  const puedeLlamarPorGiroRef = useRef(false);
  const llamadoEnHorizontalRef = useRef(false);
  const [mensajeMesero, setMensajeMesero] = useState('El llamado se registra solo en esta pantalla.');
  const [llamadoVisible, setLlamadoVisible] = useState(false);
  const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });
  const [simulados, setSimulados] = useState({ x: 0, y: 0, z: 1 });
  const [modo, setModo] = useState('simulacion');
  const [sensorActivo, setSensorActivo] = useState(false);
  const [estado, setEstado] = useState('Simulación: sin sensor físico');

  function registrarLlamado(mensaje) {
    ultimoAvisoMeseroRef.current = Date.now();
    setMensajeMesero(mensaje);
    setLlamadoVisible(true);
  }

  useEffect(() => {
    if (modo !== 'real' || !sensorActivo) return undefined;

    let cancelado = false;
    let subscription;

    async function iniciarSensor() {
      orientacionHorizontalDesdeRef.current = null;
      puedeLlamarPorGiroRef.current = false;
      llamadoEnHorizontalRef.current = false;
      setEstado('Comprobando sensor y permiso...');
      setDatos({ x: 0, y: 0, z: 0 });

      try {
        // En esta práctica, la web usa simulación explícita.
        if (Platform.OS === 'web') {
          setEstado('En esta práctica web se usa simulación. Prueba el sensor en Expo Go.');
          return;
        }
        const permiso = await Accelerometer.requestPermissionsAsync();
        if (cancelado) return;
        if (!permiso.granted) {
          setEstado('Permiso denegado. Puedes continuar con simulación.');
          return;
        }
        const disponible = await Accelerometer.isAvailableAsync();
        if (cancelado) return;
        if (!disponible) {
          setEstado('Acelerómetro no disponible. Usa simulación.');
          return;
        }

        Accelerometer.setUpdateInterval(100);
        setEstado('Esperando la primera lectura...');
        subscription = Accelerometer.addListener((lectura) => {
          if (cancelado) return;
          setDatos({ x: lectura.x, y: lectura.y, z: lectura.z });
          const ahora = Date.now();
          const estaVertical = Math.abs(lectura.y) >= 0.7 && Math.abs(lectura.x) <= 0.55 && Math.abs(lectura.z) <= 0.65;
          const estaHorizontal = Math.abs(lectura.x) >= 0.7 && Math.abs(lectura.y) <= 0.55 && Math.abs(lectura.z) <= 0.65;

          if (estaVertical) {
            // El teléfono debe empezar vertical; regresar a vertical rearma el gesto.
            puedeLlamarPorGiroRef.current = true;
            orientacionHorizontalDesdeRef.current = null;
            llamadoEnHorizontalRef.current = false;
          } else if (estaHorizontal && puedeLlamarPorGiroRef.current) {
            if (orientacionHorizontalDesdeRef.current === null) {
              orientacionHorizontalDesdeRef.current = ahora;
            } else if (!llamadoEnHorizontalRef.current && ahora - orientacionHorizontalDesdeRef.current >= 600) {
              llamadoEnHorizontalRef.current = true;
              if (ahora - ultimoAvisoMeseroRef.current >= 10000) {
                registrarLlamado('Giro a posición horizontal: llamado registrado en la aplicación. Avisa al personal; no se envió una notificación al restaurante.');
              }
            }
          } else {
            orientacionHorizontalDesdeRef.current = null;
          }
          setEstado('Sensor activo');
        });
      } catch {
        if (!cancelado) setEstado('No se pudo iniciar el sensor. Revisa el dispositivo o usa simulación.');
      }
    }

    iniciarSensor();
    return () => {
      cancelado = true;
      subscription?.remove();
    };
  }, [modo, sensorActivo]);

  // En simulación o con el sensor pausado, el texto de estado se deriva del modo.
  let estadoMostrado = estado;
  if (modo !== 'real') estadoMostrado = 'Simulación: sin sensor físico';
  else if (!sensorActivo) estadoMostrado = 'Sensor pausado. Puedes activarlo o continuar con simulación.';
  const lectura = modo === 'simulacion' ? simulados : datos;
  const hayLectura = modo === 'simulacion' || estadoMostrado === 'Sensor activo';

  // Guía visual de tres zonas para mantener el teléfono aproximadamente nivelado.
  // Es un umbral didáctico; no representa una medición calibrada.
  let zonaActiva = 'centro';
  let posicion = 'Bien: teléfono centrado';
  let consejo = 'Puedes seguir consultando la receta.';
  if (lectura.x > 0.5) {
    zonaActiva = 'derecha';
    posicion = 'Inclinado hacia la derecha';
    consejo = 'Ajusta suavemente el teléfono hacia el centro.';
  } else if (lectura.x < -0.5) {
    zonaActiva = 'izquierda';
    posicion = 'Inclinado hacia la izquierda';
    consejo = 'Ajusta suavemente el teléfono hacia el centro.';
  }

  function activarModoReal() {
    setModo('real');
    setSensorActivo(true);
  }

  function activarSimulacion() {
    setSensorActivo(false);
    setModo('simulacion');
    orientacionHorizontalDesdeRef.current = null;
    puedeLlamarPorGiroRef.current = false;
    llamadoEnHorizontalRef.current = false;
  }

  function simularGiroHorizontal() {
    setSimulados({ x: 0.85, y: 0.1, z: 0.1 });
    registrarLlamado('Giro horizontal simulado: llamado registrado en la aplicación. No se envió una notificación al restaurante.');
  }

  return (
    <ScrollView style={comunes.pantalla} contentContainerStyle={comunes.contenido}>
      <Text style={comunes.subtitulo}>Mi app siente el movimiento</Text>
      <Text style={comunes.aviso}>
        El acelerómetro alimenta esta pantalla: el eje X muestra la inclinación lateral y, al girar el teléfono de vertical a horizontal, registra el llamado al mesero. En web se usa simulación.
      </Text>

      <View style={comunes.fila}>
        <Boton texto="Usar sensor real" onPress={activarModoReal} destacado={modo === 'real'} />
        <Boton texto="Usar simulación" onPress={activarSimulacion} destacado={modo === 'simulacion'} />
        {modo === 'real' && <Boton texto={sensorActivo ? 'Pausar sensor' : 'Activar sensor'} onPress={() => setSensorActivo((activo) => !activo)} />}
      </View>

      <Text style={s.estado} accessibilityLiveRegion="polite">{estadoMostrado}</Text>
      <Text style={comunes.aviso}>Origen: {modo === 'real' ? 'Sensor físico' : 'SIMULADO'}</Text>

      <View style={comunes.tarjeta}>
        <Text style={s.nombre}>Lecturas del acelerómetro (g)</Text>
        <Text style={s.lectura}>X: {hayLectura ? lectura.x.toFixed(2) : '--'}</Text>
        <Text style={s.lectura}>Y: {hayLectura ? lectura.y.toFixed(2) : '--'}</Text>
        <Text style={s.lectura}>Z: {hayLectura ? lectura.z.toFixed(2) : '--'}</Text>
        <View style={[s.mensajeInclinacion, hayLectura && (zonaActiva === 'centro' ? s.mensajeCentro : s.mensajeInclinado)]}>
          <Text style={s.nombre}>{hayLectura ? posicion : 'Esperando datos del sensor'}</Text>
          {hayLectura && <Text style={comunes.aviso}>{consejo}</Text>}
        </View>
      </View>

      {hayLectura && (
        <View style={s.nivel} accessibilityLabel={`Nivel: ${posicion}`}>
          <Text style={s.etiquetaNivel}>Izquierda</Text>
          <View style={[s.zona, zonaActiva === 'izquierda' && s.zonaAlerta]} />
          <View style={[s.zona, s.zonaCentro, zonaActiva === 'centro' && s.zonaActiva]} />
          <View style={[s.zona, zonaActiva === 'derecha' && s.zonaAlerta]} />
          <Text style={s.etiquetaNivel}>Derecha</Text>
        </View>
      )}

      {modo === 'simulacion' && (
        <View style={comunes.fila}>
          <Boton texto="Simular izquierda" onPress={() => setSimulados({ x: -0.8, y: 0, z: 1 })} />
          <Boton texto="Centrar" etiqueta="Simular teléfono centrado" onPress={() => setSimulados({ x: 0, y: 0, z: 1 })} />
          <Boton texto="Simular derecha" onPress={() => setSimulados({ x: 0.8, y: 0, z: 1 })} />
        </View>
      )}

      <View style={comunes.tarjeta}>
        <Text style={s.nombre}>Llamar al mesero con movimiento</Text>
        <Text style={comunes.aviso}>Activa el sensor, sostén el teléfono vertical y gíralo a horizontal durante medio segundo. Regresa a vertical y espera 10 segundos para repetirlo.</Text>
        {llamadoVisible ? (
          <View style={s.confirmacionMesero} accessibilityLiveRegion="polite">
            <Ionicons name="notifications" size={30} color={colores.dorado} />
            <View style={s.textoConfirmacion}>
              <Text style={s.nombre}>Llamado registrado</Text>
              <Text style={s.mensajeMesero}>{mensajeMesero}</Text>
            </View>
          </View>
        ) : (
          <Text style={s.mensajeMesero} accessibilityLiveRegion="polite">{mensajeMesero}</Text>
        )}
        <View style={comunes.fila}>
          {modo === 'simulacion' && <Boton texto="Simular giro horizontal" etiqueta="Simular giro horizontal para llamar al mesero" destacado onPress={simularGiroHorizontal} />}
          <Boton texto="Llamar manualmente" etiqueta="Registrar un llamado manual al mesero" onPress={() => registrarLlamado('Llamado manual registrado en esta pantalla. Avisa al personal; no se envió una notificación externa.')} />
        </View>
      </View>

      <View style={comunes.tarjeta}>
        <Text style={s.nombre}>Cámara</Text>
        <Text style={comunes.aviso}>Prueba la vista previa de la cámara frontal y trasera. No toma ni guarda fotos.</Text>
        <Pressable accessibilityRole="button" onPress={onAbrirCamara} style={comunes.botonSecundario}>
          <Ionicons name="camera-outline" size={16} color={colores.dorado} />
          <Text style={comunes.textoBotonSecundario}>Explorar la cámara</Text>
        </Pressable>
      </View>

      <Text style={comunes.avisoPequeno}>
        Umbral didáctico: X mayor que 0.5 indica derecha y X menor que -0.5 indica izquierda. La gravedad afecta la lectura; no es un nivel calibrado.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  boton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 10, backgroundColor: colores.superficieAlta },
  botonDestacado: { backgroundColor: colores.doradoOscuro },
  textoBoton: { color: colores.crema, fontWeight: '700' },
  estado: { color: colores.crema, fontWeight: '600' },
  nombre: { color: colores.crema, fontWeight: 'bold', fontSize: 16 },
  lectura: { color: colores.textoSuave, fontSize: 16 },
  mensajeInclinacion: { marginTop: 6, padding: 12, borderRadius: 10, backgroundColor: colores.bordeSuave, gap: 4 },
  mensajeCentro: { backgroundColor: colores.verdeOscuro },
  mensajeInclinado: { backgroundColor: colores.superficieAlta },
  nivel: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colores.superficie },
  etiquetaNivel: { color: colores.textoSuave, fontSize: 12 },
  zona: { flex: 1, height: 18, borderRadius: 9, backgroundColor: colores.nivel },
  zonaCentro: { backgroundColor: colores.verdeOscuro },
  zonaActiva: { backgroundColor: colores.verde },
  zonaAlerta: { backgroundColor: colores.doradoOscuro },
  confirmacionMesero: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 12, backgroundColor: colores.verdeOscuro, borderWidth: 1, borderColor: colores.verde },
  textoConfirmacion: { flex: 1, minWidth: 0, gap: 4 },
  mensajeMesero: { color: colores.crema, fontWeight: '700', lineHeight: 20 },
});
