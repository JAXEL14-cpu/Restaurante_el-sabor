import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

export const CLAVES = {
  favoritos: '@restaurante-el-sabor:favoritos',
  platosNuevos: '@restaurante-el-sabor:platos-nuevos',
  carrito: '@restaurante-el-sabor:carrito',
  pedidos: '@restaurante-el-sabor:pedidos',
};

const esObjeto = (valor) => !!valor && typeof valor === 'object' && !Array.isArray(valor);

export const validadores = {
  favoritos: Array.isArray,
  platosNuevos: Array.isArray,
  carrito: esObjeto,
  pedidos: Array.isArray,
};

// Lee una clave sin afectar a las demás. "ok: false" indica que la clave existe
// pero no se pudo leer; en ese caso la app no debe sobrescribirla.
export async function leerClave(nombre, porDefecto) {
  try {
    const texto = await AsyncStorage.getItem(CLAVES[nombre]);
    if (texto === null) return { valor: porDefecto, ok: true };
    const valor = JSON.parse(texto);
    if (!validadores[nombre](valor)) throw new Error(`Formato inválido en ${nombre}`);
    return { valor, ok: true };
  } catch {
    return { valor: porDefecto, ok: false };
  }
}

export function guardarClave(nombre, valor) {
  return AsyncStorage.setItem(CLAVES[nombre], JSON.stringify(valor));
}

// En web no hay sistema de archivos: la foto se guarda como data URI y se limita su tamaño
// para no llenar el almacenamiento del navegador (unos 5 MB en total).
export const TAMANO_MAXIMO_FOTO_WEB = 900_000;

function carpetaFotos() {
  const carpeta = new Directory(Paths.document, 'fotos-platos');
  if (!carpeta.exists) carpeta.create({ intermediates: true, idempotent: true });
  return carpeta;
}

// Copia la foto a la carpeta de documentos de la app y devuelve la nueva ruta.
// Así AsyncStorage solo guarda una ruta corta y no la imagen completa.
export async function guardarFotoPermanente(uri) {
  if (Platform.OS === 'web') {
    if (uri.length > TAMANO_MAXIMO_FOTO_WEB) throw new Error('La foto es demasiado grande para el navegador.');
    return uri;
  }
  const destino = new File(carpetaFotos(), `plato-${Date.now()}.jpg`);
  if (uri.startsWith('data:')) {
    destino.create({ overwrite: true });
    await destino.write(uri.slice(uri.indexOf(',') + 1), { encoding: 'base64' });
  } else {
    await new File(uri).copy(destino);
  }
  return destino.uri;
}

export function borrarFoto(uri) {
  if (Platform.OS === 'web' || typeof uri !== 'string' || !uri.includes('fotos-platos')) return;
  try {
    const archivo = new File(uri);
    if (archivo.exists) archivo.delete();
  } catch {
    // Si el archivo ya no existe no hay nada que limpiar.
  }
}

// Las versiones anteriores guardaban las fotos en base64 dentro de AsyncStorage.
// Esta función las pasa a archivos para que la clave vuelva a ser pequeña.
export async function migrarFotosBase64(lista) {
  if (Platform.OS === 'web') return { lista, cambio: false };
  let cambio = false;
  const resultado = [];
  for (const plato of lista) {
    if (typeof plato?.fotoUri === 'string' && plato.fotoUri.startsWith('data:')) {
      try {
        resultado.push({ ...plato, fotoUri: await guardarFotoPermanente(plato.fotoUri) });
        cambio = true;
        continue;
      } catch {
        // Si falla, se conserva la foto original.
      }
    }
    resultado.push(plato);
  }
  return { lista: resultado, cambio };
}
