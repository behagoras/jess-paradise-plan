# APIs de viajes para un desarrollador individual

**Comparativa enfocada en lo que puedes usar hoy sin ser agencia de viajes.**
Estado verificado a junio de 2026.

---

## Cómo leer esto

No todas las APIs "públicas" lo son de la misma forma. Aquí las separo en cuatro niveles según qué tan accesibles son para una sola persona que está validando una idea, sin tráfico previo, sin contrato comercial y sin entidad de agencia:

1. **Accesibles hoy en solitario.** Te registras y empiezas a construir. (Viator, Tiqets, Travelpayouts)
2. **Acceso parcial.** Los widgets y links de afiliado sí, pero la API programática está bloqueada por umbrales de tráfico. (GetYourGuide)
3. **No accesibles en solitario.** Requieren contrato enterprise, account manager o aprobación de partnership. (Amadeus, Travelport)
4. **Estándar abierto, no un proveedor.** No te da inventario por sí mismo. (OCTO)

---

## Resumen rápido

| Proveedor                | ¿Solo dev hoy?                | Qué entrega                                                                                                                     | Checkout / comisión                                                          | Foco e inventario                                                               |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Viator** (Tripadvisor) | Sí (tier Basic)               | Búsqueda, fichas de producto, fotos, reviews, precios, disponibilidad, filtros                                                  | Redirect a viator.com, comisión 8% base (8-12% por volumen), cookie 30 días  | Tours y actividades, 300K+ productos en 2,500 destinos. El catálogo más amplio. |
| **Tiqets**               | Sí (sin mínimos para empezar) | Content API + Availability API al registrarte: contenido de producto, precios, reviews, disponibilidad en tiempo real           | Modelo de comisión; Booking API propio requiere ~200 órdenes/mes             | Museos, atracciones y tickets. Curado, fuerte en Europa.                        |
| **Travelpayouts**        | Sí (gratis, sin contrato)     | Flight Data API (tendencias de precio, destinos populares, tickets más baratos), más red de afiliados de vuelos, hoteles, autos | Comisión por red de afiliados, cookie de hasta 365 días en algunos programas | Agregador afiliado: vuelos (Aviasales, Kiwi), hoteles, autos, actividades.      |
| **GetYourGuide**         | Solo widgets/links            | Afiliado: links, widgets, banners. La API real está bloqueada.                                                                  | Comisión mínima 8%, mensual                                                  | Experiencias curadas, fuerte en Europa.                                         |
| **Amadeus**              | No                            | (Self-service en cierre)                                                                                                        | n/a                                                                          | GDS de vuelos. Solo Enterprise.                                                 |
| **Travelport**           | No                            | Universal API gated                                                                                                             | n/a                                                                          | GDS de vuelos. Solo partnership.                                                |
| **OCTO**                 | Es un estándar                | Spec abierta para conectar supplier-reseller                                                                                    | n/a                                                                          | No es catálogo. Conectividad de booking.                                        |

---

## Las que SÍ puedes usar hoy

### 1. Viator Affiliate API (Tripadvisor)

El punto de entrada más amplio para inventario de tours y actividades.

**Qué provee.** Endpoints REST/JSON para buscar productos y construir páginas de resultados y fichas de producto: títulos, descripciones, imágenes, ratings y conteo de reviews, precios y horarios de disponibilidad. Filtros por tipo de producto, categoría, destino, rating y cancelación gratuita. Páginas por atracción (todos los productos del Coliseo, por ejemplo). Catálogo de 300,000+ experiencias en 2,500 destinos.

**Modelo de acceso (tres niveles, esta es la parte que importa).**

- **Basic Access:** gratis, sin pre-autorización, empiezas ya. Generas la API key de inmediato (verificas email y listo). Búsqueda en tiempo real. El checkout final ocurre en viator.com vía URL única que deja una cookie y te atribuye la comisión 30 días.
- **Full Access:** también gratis, pero requiere autorización de Viator (lo solicitas desde tu cuenta). Aquí está lo que NO viene en Basic: los endpoints `modified-since` para ingerir solo lo nuevo o actualizado, la ingestión masiva del catálogo, y data más rica como reviews y disponibilidad en tiempo real.
- **Full + Booking Access:** requiere autorización. Permite checkout dentro de tu propia marca (no rediriges a viator.com).

**Comisión.** 8% base, hasta 8-12% según volumen y acuerdo. Cookie de atribución de 30 días.

**Trampa a evitar.** Si tu arquitectura asume ingerir el catálogo localmente (para indexar y filtrar por tu cuenta), eso vive en Full Access, no en Basic. "Arranco hoy sin gatekeeping" y "construyo mi índice sobre el catálogo ingerido" son tiers distintos. Pide Full Access desde el día uno si ese es tu plan.

---

### 2. Tiqets Distributor API

Más generoso de lo esperado para empezar en solitario, con foco distinto a Viator.

**Qué provee.** Al registrarte como distribuidor obtienes acceso al portal de afiliado y a dos APIs: la **Content API** (contenido de producto actualizado: horarios, imágenes de alta resolución, reviews) y la **Availability API** (disponibilidad y precios en tiempo real, para no ofrecer productos agotados o fuera de temporada). Hay además una API self-service para automatizar reportes y monitorear precios.

**Modelo de acceso.** No hay requisitos de visitas ni de número de órdenes para convertirte en distribuidor. Te registras gratis y pides acceso a la Content API por correo. La **Booking API** (checkout propio) sí está condicionada: la habilitan según desempeño, con un mínimo de referencia de ~200 órdenes/mes. La Distributor API no tiene costo.

**Foco.** Museos, atracciones y tickets, más que tours guiados. Curado y con fuerte presencia en Europa. Complemento natural de Viator, no sustituto.

---

### 3. Travelpayouts

La pieza relevante si quieres conservar el ángulo de vuelos sin depender de un GDS.

**Qué provee.** Es una red de afiliados, no un solo proveedor. Agrega 17+ programas (vuelos vía Aviasales y Kiwi, hoteles, DiscoverCars, actividades, transfers). Lo más interesante para descubrimiento flexible es su **Flight Data API**: tendencias de precio de vuelos, destinos populares y los tickets más baratos encontrados en las últimas 48 horas (sin origen ni destino fijos te devuelve los 30 más baratos). Esto es justo el tipo de data de "inspiración" que perdiste con el cierre de Amadeus self-service, pero accesible para una sola persona.

**Modelo de acceso.** Gratis, sin contratos ni costos de alta. Te registras en la red, obtienes un token y pegas a la API con el header `X-Access-Token`. Recomendado explícitamente para desarrolladores individuales. Algunos programas dan cookie de hasta 365 días.

**Limitaciones a tener presentes.** La data de precios viene de caché (pensada para generar páginas estáticas, no para búsquedas en vivo transaccionales). Su Search API prohíbe el scraping automático de links de booking, así que hay reglas de uso que respetar.

---

## Acceso parcial: widgets sí, API no

### 4. GetYourGuide

Aquí está el matiz que la nota original no distinguía.

**Lo que sí puedes hoy.** El programa de afiliados es gratis y sin mínimo de tráfico: links, widgets y banners, comisión mínima de 8% pagada mensual. No requiere equipo técnico.

**Lo que NO puedes hoy.** La Partner API (acceso programático al catálogo, lo que de verdad necesitas para construir un producto propio) está bloqueada por umbrales de tráfico. El **Basic API** pide mínimo 100,000 visitas mensuales. El **Full API** pide 1 millón de visitas y al menos 300 reservas mensuales. Para un proyecto pre-lanzamiento sin tráfico, la API está efectivamente cerrada. Tendrías widgets, no integración.

**Foco.** Experiencias curadas, fuerte en Europa. Buen inventario, pero el modelo de acceso lo descarta como fuente de datos para un MVP en solitario.

---

## No accesibles en solitario

### 5. Amadeus

El portal self-service (el camino "me registro y empiezo en minutos") se está apagando. El registro de nuevos usuarios ya está pausado, y el apagado total para usuarios existentes es el **17 de julio de 2026**: a partir de esa fecha las API keys se desactivan y el portal queda inaccesible. Solo sobrevive el portal Enterprise, que requiere contrato comercial y account manager. Para alguien empezando hoy, no es una opción: ni siquiera puedes registrarte.

### 6. Travelport

Nunca tuvo un tier self-service real. El acceso a su Universal API es vía partnership y aprobación con account manager. No es viable para una sola persona validando una idea.

---

## El estándar (no es un proveedor)

### 7. OCTO (Open Connectivity for Tours, Activities and Attractions)

Conviene conocerlo, pero no confundir lo que es. OCTO es una especificación de API abierta y gratuita (open source, sin licencia), administrada por una organización sin fines de lucro, ya adoptada por 114+ trading partners y plataformas de ticketing como Ventrata, Peek Pro, Xola, Zaui y Magpie.

**Qué NO es.** No es un agregador que te entregue un catálogo grande con una sola llamada. Es un lenguaje común para que sistemas de reserva (suppliers) y revendedores (resellers) se conecten entre sí para disponibilidad, contenido y booking sin integraciones a la medida. Te conectas a suppliers compatibles con OCTO uno por uno; no reemplaza a un agregador como Viator. Es relevante como apuesta a futuro para reducir el costo de integrar muchas fuentes, no como tu fuente de datos del MVP.

---

## Qué significa esto para un dev en solitario, hoy

Si lo que necesitas es **inventario de experiencias con contenido rico y filtrable, empezando ya**:

- **Viator** es tu base más amplia. Pide Full Access desde el inicio si vas a ingerir catálogo.
- **Tiqets** es el mejor complemento accesible (atracciones y tickets, y te deja entrar a la Content y Availability API sin mínimos).
- **GetYourGuide** quedaría como afiliación por widgets mientras no tengas tráfico, no como API.

Si quieres conservar el **ángulo de vuelos flexibles / inspiración** (descubrir a dónde ir por precio en vez de pedir destino fijo):

- **Travelpayouts** es la única vía solo-dev hoy, vía su Flight Data API. No es transaccional en vivo, pero la data de precios y destinos populares sirve para la capa de descubrimiento.

Lo que ninguna de estas resuelve por ti: el inventario es commodity y la conversión se va a un tercero (viator.com, tiqets, etc.). El valor diferenciado tiene que estar en tu capa de producto (cómo descubres y presentas), no en tener acceso a la data, porque esa la tiene cualquiera.

---

## Fuentes

- Amadeus, cierre del portal self-service (PhocusWire, Tragento): phocuswire.com/amadeus-shut-down-self-service-apis-portal-developers
- Viator Partner Resource Center, niveles de acceso: partnerresources.viator.com/travel-commerce/levels-of-access
- Viator Partner API, documentación técnica: docs.viator.com/partner-api
- Tiqets, programa de API y de afiliados: tiqets.com/en/partner-program/api-program
- Travelpayouts, API y data para desarrolladores: support.travelpayouts.com (sección API and data) y travelpayouts.github.io/slate
- GetYourGuide, requisitos de integración de API: partner.getyourguide.support (API integration and requirements)
- OCTO, especificación abierta: octo.travel y docs.octo.travel
