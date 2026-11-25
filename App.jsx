import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colores, fuenteTitulo } from './tema';
import { platos, platoDelDia, valorPrecio } from './datos/platos';
import { borrarFoto, guardarClave, guardarFotoPermanente, leerClave, migrarFotosBase64 } from './almacenamiento';
import Aviso from './componentes/Aviso';
import DetallePlato from './componentes/DetallePlato';
import PantallaInicio from './pantallas/PantallaInicio';
import PantallaMenu from './pantallas/PantallaMenu';
import PantallaSensores from './pantallas/PantallaSensores';
import ExploracionCamara from './pantallas/ExploracionCamara';
import NuevoPlatilloCamara from './pantallas/NuevoPlatilloCamara';
import PantallaCarrito from './pantallas/PantallaCarrito';
import PantallaPedidos from './pantallas/PantallaPedidos';
import AsistenteIA from './pantallas/AsistenteIA';
import PantallaContacto from './pantallas/PantallaContacto';

const PESTANAS = [
  { id: 'inicio', texto: 'Inicio', icono: 'home-outline' },
  { id: 'menu', texto: 'Menú', icono: 'restaurant-outline', titulo: 'Nuestro menú' },
  { id: 'sensores', texto: 'Sensores', icono: 'phone-portrait-outline', titulo: 'Experiencia' },
  { id: 'nuevo', texto: 'Nuevo plato', icono: 'add-circle-outline', titulo: 'Nuevo platillo' },
  { id: 'carrito', texto: 'Carrito', icono: 'cart-outline', titulo: 'Tu pedido' },
  { id: 'pedidos', texto: 'Pedidos', icono: 'receipt-outline', titulo: 'Mis pedidos' },
  { id: 'asistente', texto: 'Asistente', icono: 'chatbubbles-outline', titulo: 'Asistente del catálogo' },
  { id: 'contacto', texto: 'Contacto', icono: 'call-outline', titulo: 'Visítanos' },
];
// Pantallas a las que se llega desde otra y no aparecen en el menú.
const TITULOS_SECUNDARIOS = { camara: 'Exploración de cámara' };
const NOMBRES_DATOS = { favoritos: 'favoritos', platosNuevos: 'platos creados', carrito: 'carrito', pedidos: 'pedidos' };

export default function App() {
  return (
    <SafeAreaProvider>
      <Restaurante />
    </SafeAreaProvider>
  );
}

// Guarda un valor cada vez que cambia, salvo justo después de cargarlo
// o si su clave no se pudo leer (para no borrar datos que siguen en el dispositivo).
function usePersistir(nombre, valor, cargado, bloqueadas, alFallar) {
  const primeraVez = useRef(true);
  useEffect(() => {
    if (!cargado) return;
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    if (bloqueadas.current.has(nombre)) return;
    guardarClave(nombre, valor).catch(() => alFallar(nombre));
  }, [nombre, valor, cargado, bloqueadas, alFallar]);
}

function Restaurante() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const lateralFijo = width >= 1000;
  const [pestana, setPestana] = useState('inicio');
  const historial = useRef([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargado, setCargado] = useState(false);
  const bloqueadas = useRef(new Set());
  const [favoritos, setFavoritos] = useState([]);
  const [platosNuevos, setPlatosNuevos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const [platoDetalleId, setPlatoDetalleId] = useState(null);
  const [aviso, setAviso] = useState(null);

  const mostrarAviso = useCallback((texto, tipo = 'info') => setAviso({ texto, tipo, id: Date.now() }), []);
  const cerrarAviso = useCallback(() => setAviso(null), []);
  const alFallarGuardado = useCallback((nombre) => {
    mostrarAviso(`No se pudo guardar ${NOMBRES_DATOS[nombre]}. Revisa el almacenamiento del dispositivo.`, 'error');
  }, [mostrarAviso]);

  const catalogo = useMemo(() => [
    ...platosNuevos.map((plato) => ({ ...plato, categoria: plato.categoria || 'Nuevos', precio: valorPrecio(plato.precio) })),
    ...platos,
  ], [platosNuevos]);
  const platoDestacado = useMemo(() => platoDelDia(catalogo), [catalogo]);
  const platoDetalle = catalogo.find((plato) => plato.id === platoDetalleId) || null;
  const cantidadCarrito = Object.values(carrito).reduce((total, cantidad) => total + cantidad, 0);

  // Carga cada clave por separado: si una falla, las demás se recuperan igual.
  useEffect(() => {
    let activo = true;
    (async () => {
      const resultados = {
        favoritos: await leerClave('favoritos', []),
        platosNuevos: await leerClave('platosNuevos', []),
        carrito: await leerClave('carrito', {}),
        pedidos: await leerClave('pedidos', []),
      };
      const fallidas = Object.keys(resultados).filter((nombre) => !resultados[nombre].ok);
      fallidas.forEach((nombre) => bloqueadas.current.add(nombre));

      let listaPlatos = resultados.platosNuevos.valor;
      if (resultados.platosNuevos.ok) {
        const migracion = await migrarFotosBase64(listaPlatos);
        if (migracion.cambio) {
          listaPlatos = migracion.lista;
          await guardarClave('platosNuevos', listaPlatos).catch(() => {});
        }
      }
      if (!activo) return;
      setFavoritos(resultados.favoritos.valor);
      setPlatosNuevos(listaPlatos);
      setCarrito(resultados.carrito.valor);
      setPedidos(resultados.pedidos.valor);
      setCargado(true);
      if (fallidas.length) {
        mostrarAviso(`No se pudieron leer: ${fallidas.map((nombre) => NOMBRES_DATOS[nombre]).join(', ')}. Se dejan sin cambios en el dispositivo y no se guardarán en esta sesión.`, 'error');
      }
    })();
    return () => { activo = false; };
  }, [mostrarAviso]);

  usePersistir('favoritos', favoritos, cargado, bloqueadas, alFallarGuardado);
  usePersistir('platosNuevos', platosNuevos, cargado, bloqueadas, alFallarGuardado);
  usePersistir('carrito', carrito, cargado, bloqueadas, alFallarGuardado);
  usePersistir('pedidos', pedidos, cargado, bloqueadas, alFallarGuardado);

  // ---- Navegación con historial (para el botón atrás de Android) ----
  const irA = useCallback((destino) => {
    setMenuAbierto(false);
    if (destino === pestana) return;
    historial.current = [...historial.current.slice(-19), pestana];
    setPestana(destino);
  }, [pestana]);

  const volver = useCallback(() => {
    const anterior = historial.current.pop();
    setPestana(anterior || 'inicio');
  }, []);

  useEffect(() => {
    const suscripcion = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuAbierto) {
        setMenuAbierto(false);
        return true;
      }
      if (historial.current.length || pestana !== 'inicio') {
        volver();
        return true;
      }
      return false; // En Inicio, el botón atrás sale de la app.
    });
    return () => suscripcion.remove();
  }, [menuAbierto, pestana, volver]);

  // ---- Animación del ícono del carrito ----
  const [escalaIconoCarrito] = useState(() => new Animated.Value(1));
  const cantidadAnterior = useRef(0);
  useEffect(() => {
    if (cargado && cantidadCarrito > cantidadAnterior.current) {
      const usarDriverNativo = Platform.OS !== 'web';
      Animated.sequence([
        Animated.timing(escalaIconoCarrito, { toValue: 1.3, duration: 130, useNativeDriver: usarDriverNativo }),
        Animated.spring(escalaIconoCarrito, { toValue: 1, useNativeDriver: usarDriverNativo, friction: 4 }),
      ]).start();
    }
    cantidadAnterior.current = cantidadCarrito;
  }, [cantidadCarrito, cargado, escalaIconoCarrito]);

  // ---- Acciones ----
  const cambiarCantidad = useCallback((id, cambio) => {
    setCarrito((actual) => {
      const nuevaCantidad = (actual[id] || 0) + cambio;
      const siguiente = { ...actual };
      if (nuevaCantidad <= 0) delete siguiente[id];
      else siguiente[id] = nuevaCantidad;
      return siguiente;
    });
  }, []);

  const agregarConAviso = useCallback((id) => {
    cambiarCantidad(id, 1);
    const plato = catalogo.find((elemento) => elemento.id === id);
    mostrarAviso(`${plato?.nombre ?? 'Plato'} se agregó al carrito.`, 'exito');
  }, [catalogo, cambiarCantidad, mostrarAviso]);

  const alternarFavorito = useCallback((id) => {
    const plato = catalogo.find((elemento) => elemento.id === id);
    const yaEsFavorito = favoritos.includes(id);
    setFavoritos((actuales) => (actuales.includes(id) ? actuales.filter((favoritoId) => favoritoId !== id) : [...actuales, id]));
    mostrarAviso(`${plato?.nombre ?? 'Plato'} ${yaEsFavorito ? 'se quitó de' : 'se guardó en'} favoritos.`);
  }, [catalogo, favoritos, mostrarAviso]);

  const borrarFavoritos = useCallback(() => {
    setFavoritos([]);
    setSoloFavoritos(false);
    mostrarAviso('Favoritos eliminados de este dispositivo.');
  }, [mostrarAviso]);

  const abrirDetalle = useCallback((plato) => setPlatoDetalleId(plato.id), []);

  async function guardarPlatoNuevo(datos) {
    if (bloqueadas.current.has('platosNuevos')) throw new Error('Los platos guardados no se pudieron leer.');
    const fotoUri = await guardarFotoPermanente(datos.fotoUri);
    const nuevoPlato = { ...datos, fotoUri, id: `plato-${Date.now()}` };
    setPlatosNuevos((actuales) => [nuevoPlato, ...actuales]);
    mostrarAviso(`${nuevoPlato.nombre} se agregó al menú.`, 'exito');
  }

  function eliminarPlato(id) {
    const plato = platosNuevos.find((elemento) => elemento.id === id);
    setPlatoDetalleId(null);
    setPlatosNuevos((actuales) => actuales.filter((elemento) => elemento.id !== id));
    setFavoritos((actuales) => actuales.filter((favoritoId) => favoritoId !== id));
    setCarrito((actual) => {
      const siguiente = { ...actual };
      delete siguiente[id];
      return siguiente;
    });
    if (plato) borrarFoto(plato.fotoUri);
    mostrarAviso(`${plato?.nombre ?? 'El plato'} se eliminó del menú.`);
  }

  function confirmarPedido(pedido) {
    setPedidos((actuales) => [pedido, ...actuales]);
    setCarrito({});
  }

  function repetirPedido(pedido) {
    let faltantes = 0;
    const agregados = {};
    for (const producto of pedido.productos || []) {
      const plato = catalogo.find((elemento) => elemento.id === producto.platoId)
        || catalogo.find((elemento) => elemento.nombre === producto.nombre);
      if (plato) agregados[plato.id] = (agregados[plato.id] || 0) + (Number(producto.cantidad) || 1);
      else faltantes += 1;
    }
    if (!Object.keys(agregados).length) {
      mostrarAviso('Los platos de ese pedido ya no están en el menú.', 'error');
      return;
    }
    setCarrito((actual) => {
      const siguiente = { ...actual };
      for (const [id, cantidad] of Object.entries(agregados)) siguiente[id] = (siguiente[id] || 0) + cantidad;
      return siguiente;
    });
    mostrarAviso(faltantes ? `Pedido agregado al carrito. ${faltantes} plato(s) ya no están en el menú.` : 'Pedido agregado al carrito.', 'exito');
    irA('carrito');
  }

  function borrarHistorial() {
    setPedidos([]);
    mostrarAviso('Historial de pedidos eliminado.');
  }

  // ---- Interfaz ----
  const definicion = PESTANAS.find((elemento) => elemento.id === pestana);
  const titulo = definicion?.titulo || TITULOS_SECUNDARIOS[pestana];
  const textoContador = cantidadCarrito > 99 ? '99+' : String(cantidadCarrito);

  function navegacion(enPanel) {
    return (
      <>
        {PESTANAS.map((elemento) => {
          const activo = pestana === elemento.id || (elemento.id === 'sensores' && pestana === 'camara');
          return (
            <Pressable
              key={elemento.id}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              accessibilityLabel={elemento.id === 'carrito' ? `Carrito, ${cantidadCarrito} productos` : elemento.texto}
              style={[s.itemMenu, activo && s.itemMenuActivo]}
              onPress={() => irA(elemento.id)}
            >
              <Ionicons name={elemento.icono} size={20} color={activo ? colores.dorado : colores.textoMenu} />
              <Text style={[s.itemMenuTexto, activo && s.itemMenuTextoActivo]}>{elemento.texto}</Text>
              {elemento.id === 'carrito' && cantidadCarrito > 0 && (
                <View style={s.contador}><Text style={s.textoContador}>{textoContador}</Text></View>
              )}
            </Pressable>
          );
        })}
        {enPanel && <Text style={s.versionMenu}>Datos guardados solo en este dispositivo</Text>}
      </>
    );
  }

  let pantallaActual = null;
  if (!cargado) {
    pantallaActual = (
      <View style={s.cargando}>
        <ActivityIndicator size="large" color={colores.dorado} />
        <Text style={s.textoCargando}>Cargando tus datos...</Text>
      </View>
    );
  } else if (pestana === 'inicio') {
    pantallaActual = <PantallaInicio cantidad={catalogo.length} platoDestacado={platoDestacado} onExplorar={() => irA('menu')} onAbrirPlato={abrirDetalle} />;
  } else if (pestana === 'menu') {
    pantallaActual = (
      <PantallaMenu
        catalogo={catalogo}
        favoritos={favoritos}
        carrito={carrito}
        busqueda={busqueda}
        categoria={categoria}
        soloFavoritos={soloFavoritos}
        onCambiarBusqueda={setBusqueda}
        onCambiarCategoria={setCategoria}
        onCambiarSoloFavoritos={setSoloFavoritos}
        onLimpiarFiltros={() => { setBusqueda(''); setCategoria('Todos'); setSoloFavoritos(false); }}
        onBorrarFavoritos={borrarFavoritos}
        onAbrirPlato={abrirDetalle}
        onAgregarCarrito={agregarConAviso}
        onAlternarFavorito={alternarFavorito}
      />
    );
  } else if (pestana === 'sensores') {
    pantallaActual = <PantallaSensores onAbrirCamara={() => irA('camara')} />;
  } else if (pestana === 'camara') {
    pantallaActual = <ExploracionCamara onCerrar={volver} />;
  } else if (pestana === 'nuevo') {
    pantallaActual = <NuevoPlatilloCamara onCerrar={() => irA('menu')} onGuardar={guardarPlatoNuevo} />;
  } else if (pestana === 'carrito') {
    pantallaActual = (
      <PantallaCarrito
        catalogo={catalogo}
        carrito={carrito}
        nombreSugerido={pedidos[0]?.nombre || ''}
        onCambiarCantidad={cambiarCantidad}
        onVaciar={() => { setCarrito({}); mostrarAviso('Carrito vaciado.'); }}
        onConfirmarPedido={confirmarPedido}
        onVolverMenu={() => irA('menu')}
        onVerPedidos={() => irA('pedidos')}
      />
    );
  } else if (pestana === 'pedidos') {
    pantallaActual = <PantallaPedidos pedidos={pedidos} onRepetir={repetirPedido} onBorrarHistorial={borrarHistorial} onVolverMenu={() => irA('menu')} />;
  } else if (pestana === 'asistente') {
    pantallaActual = <AsistenteIA productos={catalogo} platoDestacado={platoDestacado} onAgregarCarrito={agregarConAviso} />;
  } else if (pestana === 'contacto') {
    pantallaActual = <PantallaContacto />;
  }

  return (
    <View style={[s.app, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <StatusBar style="light" />
      <View style={[s.barra, { paddingTop: insets.top + 10, minHeight: insets.top + 74 }]}>
        {!lateralFijo && (
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir navegación" style={s.botonRedondo} onPress={() => setMenuAbierto(true)}>
            <Ionicons name="menu" size={24} color={colores.dorado} />
          </Pressable>
        )}
        <Text numberOfLines={1} style={[s.marca, lateralFijo && s.marcaAmplia]}>RESTAURANTE <Text style={s.dorado}>EL SABOR</Text></Text>
        {cantidadCarrito > 0 && pestana !== 'carrito' && (
          <Animated.View style={{ marginLeft: 'auto', transform: [{ scale: escalaIconoCarrito }] }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Abrir carrito, ${cantidadCarrito} productos`} hitSlop={8} style={s.botonRedondo} onPress={() => irA('carrito')}>
              <Ionicons name="cart" size={22} color={colores.dorado} />
              <View style={[s.contador, s.contadorBarra]}><Text style={s.textoContador}>{textoContador}</Text></View>
            </Pressable>
          </Animated.View>
        )}
      </View>

      <View style={[s.cuerpo, { paddingBottom: insets.bottom }]}>
        {lateralFijo && <View style={s.lateral}>{navegacion(false)}</View>}
        <View style={s.principal}>
          {cargado && titulo && (
            <View style={s.tituloSeccion}>
              <Text accessibilityRole="header" style={s.tituloSeccionTexto}>{titulo}</Text>
            </View>
          )}
          {pantallaActual}
        </View>
      </View>

      {/* El menú va en un Modal para cubrir siempre toda la pantalla, encima de todo. */}
      <Modal
        visible={menuAbierto && !lateralFijo}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setMenuAbierto(false)}
      >
        <View style={s.capaMenu}>
          <Pressable style={s.fondoMenu} accessibilityRole="button" accessibilityLabel="Cerrar menú" onPress={() => setMenuAbierto(false)} />
          <View style={[s.panelMenu, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12, paddingLeft: insets.left + 18 }]} accessibilityViewIsModal>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={s.cabeceraMenu}>
                <Text style={[s.logoMenu, s.logoMenuCabecera]}>RESTAURANTE <Text style={s.dorado}>EL SABOR</Text></Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Cerrar navegación" style={s.botonRedondo} onPress={() => setMenuAbierto(false)}>
                  <Ionicons name="close" size={22} color={colores.dorado} />
                </Pressable>
              </View>
              {navegacion(true)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DetallePlato
        plato={platoDetalle}
        esFavorito={!!platoDetalle && favoritos.includes(platoDetalle.id)}
        cantidadCarrito={platoDetalle ? carrito[platoDetalle.id] || 0 : 0}
        onCerrar={() => setPlatoDetalleId(null)}
        onAgregarCarrito={agregarConAviso}
        onAlternarFavorito={alternarFavorito}
        onEliminar={eliminarPlato}
      />
      <Aviso aviso={aviso} onCerrar={cerrarAviso} />
    </View>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: colores.fondo },
  barra: { paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colores.barra, borderBottomWidth: 1, borderColor: colores.bordeMenu, zIndex: 3 },
  marcaAmplia: { fontSize: 22, letterSpacing: 1, paddingLeft: 8 },
  botonRedondo: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colores.borde, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.botonOscuro },
  marca: { flexShrink: 1, color: colores.crema, fontFamily: fuenteTitulo, fontWeight: '700', fontSize: 20 },
  dorado: { color: colores.dorado },
  contador: { minWidth: 21, height: 21, paddingHorizontal: 5, marginLeft: 'auto', borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.dorado, borderWidth: 1, borderColor: colores.panel },
  contadorBarra: { position: 'absolute', top: -4, right: -4, marginLeft: 0 },
  textoContador: { color: colores.panel, fontSize: 11, fontWeight: '800' },
  cuerpo: { flex: 1, flexDirection: 'row' },
  lateral: { width: 250, paddingTop: 20, paddingHorizontal: 14, backgroundColor: colores.panel, borderRightWidth: 1, borderColor: colores.bordeMenu },
  principal: { flex: 1, minWidth: 0 },
  tituloSeccion: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 4 },
  tituloSeccionTexto: { color: colores.crema, fontFamily: fuenteTitulo, fontSize: 25, fontWeight: '700' },
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  textoCargando: { color: colores.textoSuave },
  capaMenu: { flex: 1, flexDirection: 'row' },
  fondoMenu: { ...StyleSheet.absoluteFillObject, backgroundColor: colores.sombra },
  panelMenu: { width: 300, maxWidth: '82%', paddingRight: 18, backgroundColor: colores.panel, borderRightWidth: 1, borderColor: colores.bordeMenu, elevation: 12 },
  cabeceraMenu: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  logoMenuCabecera: { flex: 1, marginBottom: 0 },
  logoMenu: { color: colores.crema, fontFamily: fuenteTitulo, fontSize: 19, fontWeight: '700', marginBottom: 20, paddingHorizontal: 8 },
  itemMenu: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, marginBottom: 6, borderRadius: 12 },
  itemMenuActivo: { backgroundColor: colores.superficie, borderLeftWidth: 2, borderLeftColor: colores.dorado },
  itemMenuTexto: { color: colores.textoMenu, fontSize: 15, fontWeight: '600' },
  itemMenuTextoActivo: { color: colores.dorado },
  versionMenu: { color: colores.placeholder, fontSize: 11, marginTop: 14, paddingHorizontal: 8 },
});
