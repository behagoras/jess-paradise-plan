# Prototipo Drift

> **Tipo:** entidad  ·  **Parte de:** [[index]]

"Drift" es el nombre placeholder del prototipo visual interactivo que hace tangible la [[tesis-y-vision]] del producto. Es un artifact React autocontenido pensado para que el fundador pueda validar la idea, mostrársela a posibles socios y usarla como base de diseño para el [[arquitectura-mvp]] real.

---

## Propósito del prototipo

El prototipo no es un ejercicio de crítica de diseño: es generación de producto desde cero. El criterio de éxito concreto es que el fundador pueda abrirlo, navegar entre secciones, probar los tres modos de descubrimiento, ver un deal en detalle con su curaduría, y sentir que "esto es algo que yo mismo usaría".

Comunica la [[tesis-y-vision]] (lujo accesible por flexibilidad, multi-vertical, [[modelo-de-negocio]] afiliado) sin necesidad de explicación adicional.

---

## Spec técnica

- **Formato:** un solo archivo React autocontenido (Tailwind para estilos).
- **Datos:** hardcodeados y realistas, sin llamadas de red reales.
- **Estado:** React en memoria. Sin `localStorage` ni `sessionStorage` (no funcionan en los artifacts de Claude).
- **Navegación:** entre secciones (home / feed / detalle) mediante estado de React, no con rutas reales.

---

## Los tres modos de descubrimiento

### 1. Modo conversacional "Sorpréndeme"

El [[usuario-objetivo]] escribe o elige su estado de ánimo de viaje ("quiero desconectar", "algo de fiesta", "naturaleza", "lujo total") junto con un presupuesto y días disponibles aproximados. La app responde con experiencias curadas. La IA no es real en el prototipo; la respuesta se simula con datos de ejemplo.

Este modo es la entrada principal en el landing. Captura al usuario con la frase clave del producto: "Quiero viajar. No sé adónde ni cuándo. Muéstrame el mejor viaje."

### 2. Filtros por vibe / presupuesto / días

Reemplazan los filtros tradicionales de destino y fecha. El [[usuario-objetivo]] NO parte de un destino. Los filtros incluyen:

- Presupuesto máximo (slider).
- Días disponibles (rango).
- Tipo de experiencia: cruceros, playa, ciudad, aventura, gastronomía, etc.
- Nivel de flexibilidad: muy flexible / algo flexible / fechas fijas.

El nivel de flexibilidad es el campo más diferenciador: es lo que desbloquea los mejores precios en el [[modelo-de-negocio]].

### 3. Feed de deals de flexibilidad

Estilo tarjetas con scroll, mezcla de [[verticales-y-economia-unitaria]] (cruceros, paquetes, experiencias y vuelos de inspiración). Es el equivalente del "90-Day Ticker" de Vacations To Go pero con diseño moderno. Cada tarjeta muestra un deal premium con descuento significativo por salida próxima o por flexibilidad.

---

## Pantallas del prototipo

### Landing / Home

Propuesta de valor clara. El modo "Sorpréndeme" es el elemento protagonista. Contexto de mercado: global, con sensibilidad premium, idioma español (mercado inicial en México).

### Feed de deals

Tarjetas que mezclan las [[verticales-y-economia-unitaria]]: cruceros por el Mediterráneo o el Caribe, vuelo+hotel a Lisboa o Tokio, experiencias gastronómicas en Oaxaca, salidas desde CDMX. Cada tarjeta muestra precio "desde", porcentaje de descuento, días de duración y ventana de salida.

### Vista de detalle

Pantalla clave porque contiene el diferenciador de curaduría. Incluye:

- Qué incluye el deal.
- Por qué es un buen deal.
- El "¿y qué hago ahí?": narrativa + actividades sugeridas. Este bloque es donde la curaduría añade valor real y separa el producto de un simple agregador de precios.
- CTA de afiliado: "Reservar en [proveedor]". Nunca un checkout propio.

### Capa de filtros

Los filtros por vibe/presupuesto/días en acción, superpuestos sobre el feed.

---

## Dirección de diseño

**Estética objetivo:** premium, editorial, con aire de revista de viajes moderna. No OTA barata ni panel corporativo. Fotografía grande y evocadora (bloques de color o gradientes como placeholder), tipografía con personalidad, espacio en blanco generoso, y un acento de color que transmita descubrimiento sin caer en clichés.

**Lo que se evita explícitamente:**

- Tarjetas grises idénticas.
- Gradientes morados por defecto (estética genérica de IA).
- Emojis decorativos en el copy.

**Urgencia honesta:** los deals deben sentirse emocionantes y escasos con señales reales ("salida en 18 días", "quedan pocos lugares"), pero sin patrones oscuros.

**Responsive:** prioritario para móvil, donde el fundador revisa el producto.

---

## Constraints de diseño y copy

| Constraint | Razón |
|---|---|
| CTA finales son "Ver oferta" / "Reservar en [proveedor]", no checkout | Modelo afiliado, sin reservas propias por ahora |
| Precios como "desde" con nota de confirmación en proveedor | Datos cacheados de inspiración (Amadeus, Travelpayouts); precio final se confirma en sitio del proveedor |
| Sin `localStorage` ni `sessionStorage` | No funcionan en artifacts de Claude |
| Copy en español, sin em dashes | El fundador los considera marca de texto generado por IA |
| Sin llamadas de red reales | Datos hardcodeados para autonomía del artifact |

---

## Criterios de verificación antes de dar por terminado

- Las tres modalidades de descubrimiento presentes e interactivas.
- Al menos una vista de detalle con el "¿y qué hago ahí?" visible.
- Todos los CTA finales son de tipo afiliado, nunca checkout propio.
- Precios con "desde" y nota de confirmación en el proveedor.
- Copy en español, sin em dashes.
- Diseño responsive que no caiga en estética genérica de IA.

---

## El "¿y qué hago ahí?" como diferenciador

Este bloque de curaduría narrativa es el elemento que más separa a Drift de un simple feed de precios. Un deal crudo (vuelo a Lisboa, crucero por el Caribe) se enriquece con contexto de qué hacer ahí, por qué vale la pena y qué tipo de viajero lo va a disfrutar. En el MVP real, esta capa la generará un LLM. En el prototipo, es contenido hardcodeado pero suficientemente rico para comunicar la intención.

---

## Relación con el roadmap

El prototipo Drift corresponde al trabajo previo al Corte 1 del [[roadmap]]: validar la tesis antes de construir el motor real. El Corte 1 parte de vuelos porque la data es la más fácil de obtener sin acreditación; el prototipo ya anticipa todas las [[verticales-y-economia-unitaria]] para comunicar la visión completa.

---

## Enlaces relacionados

- [[tesis-y-vision]] - Drift es la materialización visual de la tesis de lujo accesible por flexibilidad.
- [[usuario-objetivo]] - El brief del prototipo fue construido directamente desde el perfil del usuario objetivo.
- [[modelo-de-negocio]] - Los constraints de diseño (CTA afiliado, precios "desde") derivan del modelo de negocio en fase afiliado.
- [[verticales-y-economia-unitaria]] - El feed mezcla todas las verticales; cruceros y paquetes son los protagonistas.
- [[arquitectura-mvp]] - El prototipo es la referencia de UX para el MVP real en Next.js.
- [[roadmap]] - Drift vive antes del Corte 1; el Corte 2 añade la capa de curaduría con LLM que el prototipo simula.
- [[panorama-competitivo]] - La referencia directa es Vacations To Go y su "90-Day Ticker".

---

## Fuentes

- [[2026-06-prompt-interfaz-drift]]
- [[2026-06-prd-descubrimiento-viajes]]
