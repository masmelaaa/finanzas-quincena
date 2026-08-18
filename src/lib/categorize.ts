// Sugerencia automática de categoría según palabras clave en la nota/concepto.
// Empareja por el NOMBRE de la categoría (no por id fijo), porque las categorías
// son editables por el usuario — si renombra o borra una, simplemente no sugiere.

import type { Category } from "./types";

interface KeywordGroup {
  keywords: string[];
  names: string[]; // nombres de categoría (en minúscula) que califican para este grupo
}

const KEYWORD_GROUPS: KeywordGroup[] = [
  {
    names: ["comida"],
    keywords: [
      "almuerzo", "desayuno", "cena", "restaurante", "comida", "hamburguesa", "pizza",
      "domicilio", "rappi", "perro caliente", "empanada", "panaderia", "panadería",
      "corrientazo", "sushi", "pollo", "arepa",
    ],
  },
  {
    names: ["transporte"],
    keywords: [
      "uber", "taxi", "bus", "pasaje", "didi", "cabify", "gasolina", "parqueadero",
      "moto", "transporte", "peaje", "buseta", "colectivo", "indriver", "picap",
    ],
  },
  {
    names: ["mercado"],
    keywords: [
      "mercado", "super", "supermercado", "exito", "éxito", "d1", "ara", "olimpica",
      "olímpica", "jumbo", "carulla", "verduras", "frutas", "makro", "surtimax",
    ],
  },
  {
    names: ["ocio"],
    keywords: [
      "cine", "pelicula", "película", "bar", "cerveza", "fiesta", "concierto",
      "juego", "videojuego", "salida", "rumba", "discoteca", "billar", "parche",
    ],
  },
  {
    names: ["servicios"],
    keywords: [
      "luz", "agua", "internet", "netflix", "disney", "spotify", "claro", "movistar",
      "tigo", "arriendo", "recarga", "celular", "gas natural", "wifi", "plan de datos",
    ],
  },
  {
    names: ["salud"],
    keywords: [
      "farmacia", "droguería", "drogueria", "medico", "médico", "eps", "medicina",
      "pastillas", "doctor", "cita medica", "cita médica", "odontologo", "odontólogo",
    ],
  },
];

/**
 * Busca una categoría existente cuyo nombre coincida con un grupo de palabras clave
 * detectado en `text`. Devuelve undefined si no hay pista o no existe esa categoría.
 */
export function suggestCategory(text: string, categories: Category[]): Category | undefined {
  const t = text.trim().toLowerCase();
  if (!t) return undefined;

  for (const group of KEYWORD_GROUPS) {
    if (group.keywords.some((k) => t.includes(k))) {
      const match = categories.find((c) => group.names.includes(c.name.trim().toLowerCase()));
      if (match) return match;
    }
  }
  return undefined;
}
