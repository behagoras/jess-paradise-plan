# Arquitectura MVP

> **Tipo:** concepto  ·  **Parte de:** [[index]]

El MVP no es una OTA clásica ni un buscador de vuelos. Es un **publisher transaccional con alma de producto**: un sistema que agrega datos de inventario cacheado, los puntúa y enriquece con curaduría editorial, y los presenta como un feed de oportunidades listas para soñar y reservar. El stack es Next.js con App Router.

---

## Principio rector de diseño

La unidad de valor no es una reserva, sino una **oportunidad curada**: un destino, un precio observado, un vibe y una narrativa que convierte un deal de vuelo en una experiencia deseada. Todo lo demás (CTAs, afiliación, alertas) sirve a esa unidad.

La interfaz principal no es una caja de búsqueda vacía, sino un **feed vivo**. Un usuario flexible no empieza completando origen/destino/fechas como en Expedia; empieza con algo más parecido a "Lisboa por menos de X" o "suite weekend en Riviera Maya". La caja de búsqueda puede existir como función secundaria, pero el frontend principal optimiza para scrolleo, guardado, compartir, alerta y click-out.

---

## Stack tecnológico

El stack real es **Next.js App Router (frontend) + Convex (backend de datos y orquestación) + Clerk (auth)**. La división de responsabilidades:

- **Convex como cache y motor de ingesta**: las llamadas a APIs externas (Travelpayouts Data API, Viator, Booking.com) viven en **Convex actions** server-side, así las credenciales nunca tocan el navegador. Importante: el `marker` de Travelpayouts (id público de afiliado, va en `NEXT_PUBLIC_TP_MARKER`) y el **API token** (secreto, en `convex env`) son cosas distintas; solo el token da acceso a los datos. Una **action programada (cron de Convex)** refresca el feed cada N horas; cada búsqueda de usuario también persiste su resultado (read-through cache).
- **Convex como almacén de la "oportunidad curada"**: los deals enriquecidos viven en tablas Convex (`deals`, `observations`, `destinations`), no en páginas estáticas. Esto es lo que habilita el query por vibe, el `deal_score` y guardar/alertas, queries que la API de tercero no puede responder sobre sus datos crudos.
- **Frescura, no real-time**: los precios de Travelpayouts Data API son cacheados por definición (no en vivo). El cron de Convex que regenera el cache cada N horas es el modelo correcto, no fingir tiempo real. Solo se cachea la capa de inspiración; las APIs en vivo o transaccionales (Booking Demand, Duffel) no se cachean por ToS.
- **Mutaciones con auth**: guardar deals, proyectos de viaje y alertas son mutations de Convex que validan identidad (Clerk) o el token de invitado (`pp_guest`).

> Nota de drift: una versión anterior de este doc asumía Next.js + ISR para servir páginas estáticas regeneradas. El producto construido derivó a un SPA Convex + Clerk; el cache y la regeneración periódica ahora viven en Convex (tablas + cron actions), no en ISR. Ver el ADR en el README.

---

## Las 4 capas del sistema

### 1. Sourcing

La capa de ingestión trae destinos y precios desde **Travelpayouts**, la única fuente de inspiración de vuelos con acceso hoy:

- **Travelpayouts Data API** (Aviasales) — **fuente principal y única**: `v2/prices/latest?origin=MEX` devuelve los destinos/tickets más baratos vistos desde un origen ("a dónde"); `v2/prices/month-matrix` da el calendario de precios ("cuándo"). Datos cacheados (hasta 7 días), recomendados por la propia doc para generar páginas estáticas. Límite de 100 req/min por marker. Los links ya incluyen el `marker` del afiliado, así que cada clic monetiza directamente.
- ⚠️ **~~Amadeus Flight Inspiration / Cheapest Date Search~~ — DESCONTINUADO (2026-06-21):** Amadeus retiró su API pública Self-Service; hoy solo ofrece enterprise bajo contrato. Era la fuente complementaria de discovery; **ya no es viable**. Todo el sourcing se hace sobre Travelpayouts.

Limitación importante: el Search API en tiempo real de Travelpayouts/Kiwi exige 50,000 MAU confirmados, umbral que no se tiene al inicio; por eso se usa el **Data API cacheado** para el discovery. Riesgo a registrar: con Amadeus fuera, el sistema queda **dependiente de una sola fuente** (ver [[riesgos-y-preguntas-abiertas]]).

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
| `source` | Travelpayouts / Aviasales / etc. |
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

Travelpayouts es explícito en que los precios de su capa de inspiración son cacheados, no en vivo. CruiseSheet, como referente de la vertical de cruceros, también advierte que los precios cambian rápido y el checkout final puede diferir.

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
