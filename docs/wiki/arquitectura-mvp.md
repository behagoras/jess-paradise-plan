# Arquitectura MVP

> **Tipo:** concepto  ·  **Parte de:** [[index]]

El MVP no es una OTA clásica ni un buscador de vuelos. Es un **publisher transaccional con alma de producto**: un sistema que agrega datos de inventario cacheado, los puntúa y enriquece con curaduría editorial, y los presenta como un feed de oportunidades listas para soñar y reservar. El stack es Next.js con App Router.

---

## Principio rector de diseño

La unidad de valor no es una reserva, sino una **oportunidad curada**: un destino, un precio observado, un vibe y una narrativa que convierte un deal de vuelo en una experiencia deseada. Todo lo demás (CTAs, afiliación, alertas) sirve a esa unidad.

La interfaz principal no es una caja de búsqueda vacía, sino un **feed vivo**. Un usuario flexible no empieza completando origen/destino/fechas como en Expedia; empieza con algo más parecido a "Lisboa por menos de X" o "suite weekend en Riviera Maya". La caja de búsqueda puede existir como función secundaria, pero el frontend principal optimiza para scrolleo, guardado, compartir, alerta y click-out.

---

## Stack tecnológico

**Next.js App Router** es el marco central. Permite combinar en un mismo proyecto:

- **Route Handlers como proxy server-side**: todas las llamadas a APIs externas (Amadeus, Travelpayouts, Viator, Booking.com) pasan por Route Handlers para mantener las API keys fuera del cliente. Esto es especialmente relevante porque el token de Travelpayouts (el `marker`) y las credenciales de Amadeus no deben exponerse en el navegador.
- **ISR (Incremental Static Regeneration)**: ideal para páginas de deals y landings SEO, porque permite servir contenido estático actualizable sin rebuild completo. Esto encaja perfectamente con la naturaleza de los datos de sourcing: los precios de Amadeus Inspiration y Travelpayouts Data API son cacheados por definición (no en vivo), así que regenerar páginas cada N horas es el modelo correcto, no fingir real-time.
- **Server Functions con validación de auth/origen**: para cualquier mutación futura (guardar deals, suscribirse a alertas), Next.js recomienda validar auth y origen dentro de cada Server Function.

---

## Las 4 capas del sistema

### 1. Sourcing

La capa de ingestión trae destinos y precios desde dos fuentes complementarias:

- **Amadeus Flight Inspiration Search** (`shopping.flightDestinations`): recibe un origen IATA (ej. MEX) y devuelve destinos ordenados por precio, filtrable por fecha de salida, precio máximo, duración del viaje, one-way o non-stop. Usa datos cacheados actualizados diariamente. Cuota gratuita mensual en producción (1,000 a 10,000 llamadas según API), pago por excedente (aprox. US$0.0008 a US$0.024 por llamada).
- **Amadeus Flight Cheapest Date Search** (`shopping.flightDates`): dado origen y destino, devuelve las fechas más baratas con precios. Complementa Inspiration para construir el calendario de flexibilidad.
- **Travelpayouts Data API** (Aviasales): endpoints como `v2/prices/latest` devuelven los tickets más baratos hallados en las últimas 48 horas. La propia documentación recomienda este API para generar páginas estáticas. Límite de 100 req/min por marker. Los links ya incluyen el `marker` del afiliado, así que cada clic monetiza directamente.

Limitación importante: Amadeus Self-Service no incluye aerolíneas low-cost, American Airlines, Delta ni British Airways. Travelpayouts cubre ese universo pero el Search API en tiempo real exige 50,000 MAU confirmados, umbral que no se tiene al inicio. La combinación Amadeus Inspiration + Travelpayouts Data API cubre el discovery inicial sin ese requisito.

Para los detalles de acceso, umbrales y costos de cada proveedor, ver [[proveedores-apis-e-inventario]].

### 2. Scoring

Cada deal ingerido pasa por una **capa de scoring** que calcula un "deal quality score" combinando:

- Precio absoluto observado
- Rareza relativa del precio para esa ruta (cuánto por debajo del histórico)
- Non-stop vs escalas (penalización por escalas)
- Duración posible de la escapada (¿da para un fin de semana largo? ¿una semana?)
- Umbral editorial: ¿esto se siente premium aunque no sea el precio más barato del mercado?

El score determina qué deals suben al feed y en qué orden aparecen. No es solo "más barato primero".

### 3. Enriquecimiento

La capa editorial convierte datos crudos en oportunidades deseables:

- **Vibe tags**: categorías aspiracionales (ciudad europea, playa tropical, montaña, gastronomía, etc.) que permiten filtrar sin elegir destino.
- **Narrativa editorial**: copia corta generada por LLM que explica por qué ese deal es especial. Un vuelo a Lisboa a precio X no es solo "vuelo barato"; es el marco para una experiencia concreta.
- **Paquete de actividades sugeridas**: shortlist de 3 a 5 actividades/zonas usando la Affiliate API de Viator (más de 300,000 experiencias en 2,500 destinos, comisión del 8% con cookie de 30 días).
- **Shortlist de hoteles**: attach de alojamiento vía Booking.com Affiliate (más de 28 millones de alojamientos, comisión escalonada del 25% al 40% del margen de Booking según estancias completadas).

Esta capa es donde el producto se diferencia de un simple agregador de precios. Ver [[verticales-y-economia-unitaria]] para el razonamiento de por qué experiencias y hoteles son la monetización real aunque el gancho sea el vuelo.

### 4. Salida (CTAs por vertical)

La capa de salida genera los call-to-action apropiados según vertical:

- **Vuelo**: deep link de afiliado a Travelpayouts/Aviasales, o White Label Web de Travelpayouts (buscador "low-code" gratuito desplegable con marca propia, con low-fare calendar y multi-city search). El White Label resuelve el "último paso" de búsqueda y referral sin exigir 50,000 MAU.
- **Hotel**: deep link a Booking.com Affiliate con parámetros de destino y fechas pre-poblados.
- **Actividad**: deep link a Viator con destino y categoría pre-filtrados.
- **Más adelante**: GetYourGuide (requiere 100,000 visitas/mes para API básica), Duffel para booking transaccional de vuelos (fase 2, cuando se quiera tomar el pago directamente).

---

## Diseño de datos: la "oportunidad curada"

Cada deal vive como una entidad con los siguientes campos:

| Campo | Descripción |
|---|---|
| `origin` | IATA del aeropuerto de salida |
| `destination` | IATA del aeropuerto de llegada |
| `departure_window` | Rango de fechas de salida |
| `return_window` | Rango de fechas de regreso (si aplica) |
| `observed_price` | Precio observado en la fuente |
| `currency` | Moneda del precio |
| `source` | Amadeus / Aviasales / etc. |
| `observed_at` | Timestamp de la observación |
| `freshness_hours` | Horas desde la última verificación |
| `deal_score` | Score calculado por la capa de scoring |
| `vibe_tags` | Array de etiquetas aspiracionales |
| `editorial_copy` | Narrativa generada por LLM |
| `activities` | Shortlist de actividades Viator |
| `hotels` | Shortlist de hoteles Booking.com |
| `cta_primary` | Tipo y URL del CTA principal |
| `cta_secondary` | CTAs adicionales por vertical |

---

## Honestidad de frescura

Tanto Amadeus como Travelpayouts son explícitos en que los precios de sus capas de inspiración son cacheados, no en vivo. CruiseSheet, como referente de la vertical de cruceros, también advierte que los precios cambian rápido y el checkout final puede diferir.

La UX debe abrazar esta realidad en vez de ocultarla. Los textos de la interfaz usan patrones como:

- "Precio visto hace X horas"
- "Verifica tarifa actual antes de reservar"
- "Desde / aproximado, confirma disponibilidad"

Fingir exactitud transaccional donde no la hay genera quejas de usuarios y posibles problemas con PROFECO. La honestidad de frescura es un elemento de diseño, no una advertencia legal enterrada en el footer.

---

## Flujo de usuario: del feed a la reserva

1. El usuario llega al **feed vivo** y ve oportunidades curadas ordenadas por deal score y relevancia de vibe.
2. Puede filtrar por vibe (no por destino), presupuesto y duración disponible.
3. Al abrir un deal, ve la narrativa editorial, las actividades sugeridas y los hoteles recomendados.
4. El CTA primario lo lleva al buscador de Travelpayouts (White Label o deep link) donde confirma precio en vivo y completa la reserva.
5. CTAs secundarios ofrecen el hotel y las actividades como attach opcional.
6. El usuario puede guardar deals y activar alertas (funcionalidad de mutación vía Server Functions de Next.js).

---

## Lo que no es este MVP

- **No es un GDS**: no emite boletos ni toma pagos de vuelos. Eso requiere acreditación IATA (bono de aprox. US$50,000 por país) o el "Managed Content" de Duffel. Ambas son fase 2.
- **No usa Duffel para el feed de inspiración**: Duffel exige mantener un look-to-book de 1,500:1 y advierte explícitamente que no es adecuado para metabuscadores o búsqueda de calendario. Se reserva para booking transaccional en fase 2.
- **No usa Skyscanner API**: requiere más de 100,000 visitas/mes y rechaza proyectos sin producto pre-desarrollado. Se activa como upgrade al cruzar ese umbral.
- **No usa Hotellook API**: el servicio cerró el 20 de octubre de 2025 y Travelpayouts reconoce que ninguna otra marca hotelera dentro de su ecosistema ofrece API a partners en este momento.

---

## Consideraciones de escala

Los umbrales que cambian la arquitectura:

- **50,000 MAU**: se puede solicitar el Search API de Aviasales vía Travelpayouts para búsqueda real-time afiliada.
- **100,000 visitas/mes**: elegibilidad para Skyscanner Travel API y GetYourGuide API básica.
- **Cuando el afiliado supere el 10% de bookings o haya demanda de checkout propio**: evaluar Duffel para vuelos transaccionales y Hotelbeds/TBO para hoteles con markup propio.

---

## Enlaces relacionados

- [[proveedores-apis-e-inventario]]: detalle de cada API usada en las capas de sourcing y salida, umbrales de acceso y costos reales.
- [[verticales-y-economia-unitaria]]: por qué vuelos son el gancho de tráfico pero experiencias, hoteles y cruceros son la monetización real.
- [[tesis-y-vision]]: el principio de "publisher transaccional con alma de producto" nace de la tesis estratégica de no competir como OTA generalista.
- [[roadmap]]: el Corte 1 define exactamente qué construir primero dentro de esta arquitectura (feed de vuelos desde CDMX).
- [[riesgos-y-preguntas-abiertas]]: los riesgos de cobertura de inventario, frescura de precios y dependencia de APIs de terceros.
- [[prototipo-drift]]: interfaz conversacional que se integra sobre esta arquitectura de 4 capas.

---

## Fuentes

- [[2026-06-investigacion-tesis-negocio]]
- [[2026-06-investigacion-apis-vuelos-experiencias]]
- [[2026-06-prd-descubrimiento-viajes]]
