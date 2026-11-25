// Clasificador didáctico de vecino más cercano: compara las palabras de la pregunta
// con frases de ejemplo y devuelve la intención del ejemplo más parecido.
export const ejemplos = [
  { texto: 'cuanto cuesta', intencion: 'precio' },
  { texto: 'cual es el precio valor costo', intencion: 'precio' },
  { texto: 'cuanto vale cuanto cobran', intencion: 'precio' },
  { texto: 'quiero saber el importe que debo pagar', intencion: 'precio' },
  { texto: 'como se llama', intencion: 'nombre' },
  { texto: 'dime el nombre o titulo del plato', intencion: 'nombre' },
  { texto: 'que ingredientes lleva', intencion: 'descripcion' },
  { texto: 'que trae que contiene de que esta hecho', intencion: 'descripcion' },
  { texto: 'descripcion caracteristicas detalles del plato', intencion: 'descripcion' },
  { texto: 'explica hablame cuentame como es como lo preparan', intencion: 'descripcion' },
  { texto: 'es picante tiene aji', intencion: 'alergenos' },
  { texto: 'tiene gluten lactosa mani mariscos alergia alergenos', intencion: 'alergenos' },
  { texto: 'es vegetariano vegano apto para celiacos', intencion: 'alergenos' },
  { texto: 'que tipo de plato es categoria', intencion: 'categoria' },
  { texto: 'es entrada plato fuerte o bebida', intencion: 'categoria' },
  { texto: 'a que hora abren cierran horario', intencion: 'horario' },
  { texto: 'que dias atienden estan abiertos hoy', intencion: 'horario' },
  { texto: 'donde quedan cual es la direccion', intencion: 'direccion' },
  { texto: 'como llego ubicacion del restaurante', intencion: 'direccion' },
  { texto: 'telefono numero whatsapp contacto', intencion: 'telefono' },
  { texto: 'como reservo una mesa llamar', intencion: 'telefono' },
  { texto: 'que me recomiendas sugieres', intencion: 'recomendacion' },
  { texto: 'cual es el mejor plato especialidad de la casa', intencion: 'recomendacion' },
  { texto: 'que pido hoy plato del dia', intencion: 'recomendacion' },
];

// Intenciones que se responden con datos del restaurante y no necesitan un plato.
export const intencionesGenerales = new Set(['horario', 'direccion', 'telefono', 'recomendacion']);

const vacias = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'un', 'una', 'que', 'es', 'en', 'y', 'o', 'me', 'lo', 'al', 'por', 'se', 'su', 'con', 'a', 'mi', 'tu', 'le', 'para', 'este', 'esta', 'ese', 'esa', 'hay', 'ustedes', 'plato', 'platos', 'comida']);

// Raíz muy simple para que "empanadas" y "empanada" o "riñones" y "riñón" coincidan.
function raiz(token) {
  if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
  return token;
}

export function tokens(texto) {
  return String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
    .filter((token) => token && !vacias.has(token))
    .map(raiz);
}

function similitud(a, b) {
  const aa = new Set(a);
  const bb = new Set(b);
  if (!aa.size || !bb.size) return 0;
  let comunes = 0;
  for (const token of aa) if (bb.has(token)) comunes += 1;
  return comunes / Math.sqrt(aa.size * bb.size);
}

// "ignorar" permite quitar las palabras del nombre del plato antes de clasificar,
// para que "precio de la bandeja paisa" se compare solo como "precio".
export function clasificar(pregunta, ignorar = []) {
  const quitar = new Set(ignorar);
  const entrada = tokens(pregunta).filter((token) => !quitar.has(token));
  const mejores = new Map();
  for (const ejemplo of ejemplos) {
    const valor = similitud(entrada, tokens(ejemplo.texto));
    mejores.set(ejemplo.intencion, Math.max(mejores.get(ejemplo.intencion) || 0, valor));
  }
  const ranking = [...mejores].sort((a, b) => b[1] - a[1]);
  const [intencion, puntuacion] = ranking[0] || [null, 0];
  const diferencia = puntuacion - (ranking[1]?.[1] || 0);
  // Umbrales para una demostración; no son probabilidades calibradas.
  return { intencion: puntuacion >= 0.2 && diferencia >= 0.08 ? intencion : null, puntuacion };
}

// Busca qué plato del catálogo se menciona en la pregunta.
// Devuelve el plato y las palabras de su nombre que aparecieron.
export function detectarPlato(pregunta, productos) {
  const entrada = new Set(tokens(pregunta));
  let mejor = null;
  for (const producto of productos) {
    const nombre = [...new Set(tokens(producto.nombre))];
    if (!nombre.length) continue;
    const coincidencias = nombre.filter((token) => entrada.has(token));
    const puntuacion = coincidencias.length / nombre.length;
    if (puntuacion >= 0.5 && (!mejor || puntuacion > mejor.puntuacion || (puntuacion === mejor.puntuacion && coincidencias.length > mejor.coincidencias.length))) {
      mejor = { producto, puntuacion, coincidencias };
    }
  }
  return mejor;
}
