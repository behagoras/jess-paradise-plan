# Proveedores, APIs e Inventario

> **Tipo:** entidad  ·  **Parte de:** [[index]]

Catalogo de proveedores de inventario y APIs relevantes para el proyecto, ordenado por fase de acceso. Cubre la pregunta tecnica central: como resolver "destino abierto + fechas flexibles + precio tope" sin acreditacion IATA y sin tener 100k visitas/mes.

---

## Travelpayouts: la puerta de entrada

**Que es:** red de afiliados especializada en viajes (no es un GDS). Una sola alta gratuita da acceso a mas de 100 marcas: vuelos (Aviasales/Jetradar), hoteles (Booking.com), experiencias (Viator, GetYourGuide, Tiqets, WeGoTrip), autos (DiscoverCars), eSIM y mas. Segun su sitio oficial, ha pagado mas de $63M a sus socios en sus 11 anos de operacion.

**Requiere acreditacion IATA:** no.

**Costo/modelo:** gratis unirse. Revenue share; Travelpayouts cobra a las marcas y declara dejar la comision completa al afiliado. Comisiones tipicas: ~1.1-1.5% vuelos, 4-5% hoteles. No cobra setup.

**Como darse de alta:** registro en travelpayouts.com (~1 min), conectarse a cada programa desde el catalogo, obtener el `marker` (ID de afiliado) y el API token en Profile > API token. Acepta personas y empresas de Mexico. Aprobacion generalmente inmediata.

**APIs disponibles:**
- **Data API** (Flight Data API, Data Access API): endpoints como `v2/prices/latest` (30 tickets mas baratos de las ultimas 48h si omites origen/destino), `v2/prices/month-matrix` (precios por dia del mes agrupados por escalas) y tendencias por destino popular. Limite: 100 req/min por marker. Los datos son **cache** de hasta 7 dias; la documentacion recomienda usarlos para generar paginas estaticas, no como precio en vivo.
- **Flight Search API:** solo bajo peticion a soporte.
- **Affiliate Stats API / White Label Web:** busqueda de vuelos low-code con marca propia, low-fare calendar y multi-city search, sin requerir trafico minimo.

**Nota importante (hoteles):** Hotellook, el motor de comparacion de hoteles de Travelpayouts, **cerro el 20 de octubre de 2025** y su API fue deshabilitada. Por el momento ninguna otra marca hotelera dentro del ecosistema de Travelpayouts ofrece API a partners. Para alojamiento, la ruta vigente es Booking.com Affiliate directamente.

**Para que sirve en este proyecto:** monetizacion multi-vertical desde el dia 1, feed editorial de vuelos economicos, y deep links de afiliado que acompanan los resultados de inspiracion.

---

## Amadeus Self-Service: motor tecnico de discovery

**Que es:** APIs REST/JSON del GDS Amadeus para negocios sin certificacion de agencia. Catalogo de ~30 APIs en 2025, enfocadas en tarifas publicas (excluye American, Delta, British Airways y low-cost; ese contenido es Amadeus Enterprise).

**Requiere acreditacion IATA:** no.

**Costo/modelo:** pay-as-you-go. Sandbox gratis. En produccion mantiene cuota mensual gratuita por API (1,000 a 10,000 llamadas segun endpoint) y cobra el excedente a ~$0.0008-0.024 USD por transaccion segun API. Rate limit sandbox: hasta 10 req/usuario/seg.

**Como darse de alta:** crear cuenta en developers.amadeus.com, registrar la app y recibir API Key + API Secret. SDKs en Node, Python, Java. Paso a produccion gratis.

**Los dos endpoints clave para destino abierto:**

- **Flight Inspiration Search** (`shopping.flightDestinations`): parametro obligatorio: IATA de origen (ej. MEX). Devuelve un listado de destinos ordenados por precio, filtrable por fecha de salida, one-way/round-trip, duracion del viaje, escalas y `maxPrice`. Resuelve "destino abierto + precio tope".
- **Flight Cheapest Date Search** (`shopping.flightDates`): dado origen y destino, devuelve las fechas mas baratas con precios, ordenable por precio/fecha/duracion, con filtros de rango de fechas, duracion y `maxPrice`. Resuelve "fechas flexibles / calendario de precios".

**Limitacion critica de ambos endpoints:** usan **datos cacheados dinamicos** generados diariamente a partir de busquedas y reservas pasadas. No es precio en vivo. La cobertura se limita a lo "trending" (rutas con poca demanda pueden faltar). Una vez elegido destino/fecha, hay que llamar **Flight Offers Search** (en vivo) y **Flight Offers Price** para confirmar antes de cualquier compra.

**Para que sirve en este proyecto:** es la solucion tecnica accesible para la funcion de inspiracion. Ver seccion [[#Solucion tecnica: destino abierto + fechas flexibles + precio tope]].

---

## Amadeus Enterprise

**Que es:** catalogo completo (+140 APIs), con contenido extendido: aereolineas full-service, low-cost, tarifas negociadas/privadas. La mayoria sigue siendo SOAP.

**Acceso:** requiere autorizacion de empresa, contrato comercial y soporte dedicado. No self-service. Generalmente requiere IATA o relacion contractual formal.

**Cuando:** al escalar a [[modelo-de-negocio]] de OTA con reservas propias y volumen considerable.

---

## Duffel: reservas propias sin bono IATA

**Que es:** agregador moderno (UK) con acceso a 300+ aerolineas (NDC/GDS/LCC) via API limpia. Cubre vuelos, stays, ancillaries y pagos. Cubre carriers relevantes para Mexico como Volaris, LATAM y Copa.

**Requiere acreditacion IATA:** no. Su modelo **Managed Content** presta las 5 acreditaciones IATA globales de Duffel para que el seller emita sin acreditarse. Si el seller ya tiene IATA propia, puede usarla y traer tarifas privadas.

**Costo/modelo:** pay-as-you-go por reserva. Fee por orden: ~$3 + 1% del valor de la orden + 2% de FX. Ademas aplica un "Excess Search fee" para mantener el ratio look-to-book en no mas de 1,500:1. Por cada 10 ordenes/mes se obtienen 15,000 busquedas gratis; el excedente cuesta $0.005 USD/busqueda (ejemplo: 25,000 busquedas = $50 USD).

**Como darse de alta:** registro en duffel.com (~1 min), sandbox para probar sin pagos reales, luego produccion. Acepta negocios globales.

**Advertencia critica (look-to-book 1500:1):** Duffel advierte explicitamente: "we might not be suitable for metasearch engines or calendar search". Duffel **no es adecuado para la funcion de destino abierto o calendario de precios** ya que cualquier arquitectura de inspiracion/exploracion genera miles de busquedas por cada reserva, violando el ratio y generando costos de Excess Search. Usarlo solo para el booking transaccional del itinerario concreto que el usuario ya eligio.

**Para que sirve en este proyecto:** Fase 2, cuando se quiera tomar el pago y emitir el boleto propio. Es la ruta para evitar el bono IATA (~$50,000 USD/pais, fee de aplicacion ~$1,300, anualidad ~$200, mas de 90 dias de tramite).

---

## Kiwi.com / Tequila: acceso restringido

**Que era:** plataforma B2B (Tequila) con APIs de Search, Booking, Multicity, Nomad, Visa y programa de afiliados con deep links y widgets. Soportaba destino abierto, rango de fechas amplio y multi-ciudad en cualquier orden (Nomad).

**Estado actual:** Kiwi cerro el acceso publico. Ahora se enfoca en "key business partnerships". Via Travelpayouts, la API de Kiwi exige **>=50,000 MAU** en el proyecto.

**Conclusion:** no viable directo al inicio. Se pueden usar links de afiliado de Kiwi via Travelpayouts (sin la API) mientras se crece. Solicitar acceso API cuando se superen los 50,000 MAU.

---

## Skyscanner: para cuando escales

**Que es:** API meta-search con 1,200+ aerolineas/OTAs en 52 mercados. Incluye "Browse/Indicative" (precios cacheados para "cheapest anywhere/anytime") y "Live Prices". El Browse/Indicative es la mejor solucion disponible para destino abierto y fechas flexibles, pero esta cerrado.

**Acceso:** partner-only. Criterios oficiales: negocios establecidos con **>100,000 visitas/mes**. El portal rechaza explicitamente estudiantes, individuos trabajando en base no comercial, y startups sin producto pre-desarrollado y plan de negocio robusto. Respuesta tipica ~2 semanas.

**Costo:** sin fee por llamada para partners aprobados; se monetiza por comision, tracking via Impact.

**Afiliado separado:** el Skyscanner Affiliate Programme corre en impact.com con su propio criterio de aceptacion.

**Conclusion:** apuntarlo como upgrade cuando se superen 100k visitas/mes. En ese momento tambien solicitar GetYourGuide API basica.

---

## Sabre y Travelport: GDS enterprise, Fase 3

**Sabre:** sandbox self-service (Test User ID/password), pero produccion requiere contrato. Intake form con web, IATA/ARC y volumenes; negociacion de meses; contrato via DocuSign; asignacion de PCC/iPCC y account manager. Sin acreditacion IATA/ARC, operar bajo host agency o white-label. Pricing no publico, facturas a 60 dias.

**Travelport:** no self-service. Fase de discovery/negociacion de ventas. Trial de 30 dias en pre-produccion (sandbox) limitado a Air y Hotel para Universal API. Certificacion obligatoria antes de produccion (aviso de >=15 dias habiles). Costo reportado por integradores (no precio publico): ~$5,000 USD/ano de acceso recurrente + setup ~$4,000-5,000; siempre negociado.

**Cuando:** si el proyecto se convierte en OTA seria con volumen, reservas propias y equipo dedicado. Ver [[roadmap]] para la secuencia.

---

## Experiencias: Viator, GetYourGuide, Klook, Tiqets

**Viator (red Tripadvisor):**
- Comision: **8%** sobre cualquier experiencia reservada dentro de 30 dias del clic (pago tras realizarse el tour, last-click).
- Cookie: 30 dias.
- Pagos: PayPal semanal sin minimo o transferencia mensual con minimo $50 USD.
- Alta: <1 min si ya se tiene cuenta Tripadvisor.
- **Affiliate API (Basic Access):** disponible; endpoints de contenido (mas de 300,000 experiencias en 2,500 destinos), filtrable por tipo, categoria, destino o rating. Las ventas se cierran en viator.com via deep link. Cancelaciones revierten la comision.
- **Merchant API:** si el usuario paga en el sitio propio, se convierte en merchant of record, hay que manejar soporte al cliente, pasar calificacion, certificacion y deposito antes de ir live. Para Fase 2.

**GetYourGuide:**
- Comision: **minimo 8%**, pago mensual por transferencia o PayPal.
- Cookie: 30 dias.
- Alta via CJ Affiliate o directo. No requiere IATA/CLIA.
- **Partner API:** escalonada. Acceso basico requiere **100,000 visitas/mes**; Booking API requiere **1M visitas + 300 reservas/mes**. Hasta llegar a esos umbrales, usar links/widgets de afiliado.

**Klook:**
- Comision por categoria: tours/hoteles ~6.5%, atracciones 5%, eSIM hasta 20%, gift cards 2%.
- Cookie: 30 dias (7 dias hoteles/autos).
- Alta via portal propio, Travelpayouts o redes regionales (Involve Asia, Ecomobi). Aprobacion ~2 dias. Fuerte en Asia.

**Tiqets:**
- Afiliado via Awin. Comision citada como 50% del margen de Tiqets (dato de fuente de blog, no oficial). Bueno para museos y atracciones en Europa.
- API disponible para partners con volumen.

La economia de experiencias es favorabledentro del [[modelo-de-negocio]]: comisiones de 5-8% sobre tickets bajos-medios son mucho mas que el ~1.1-1.5% de vuelos. Ver [[verticales-y-economia-unitaria]] para el calculo completo.

---

## Hoteles: Booking.com y Hotelbeds/TBO

**Booking.com Affiliate Partner Program:**
- Modelo: revenue share escalonado sobre la comision que Booking gana del hotel (no sobre el valor de la reserva). Tiers por estancias completadas/mes: Tier 1 (1-50) 25%, Tier 2 (51-150) 30%, Tier 3 (151-500) 35%, Tier 4 (501+) 40%. Ejemplo: reserva de 100 EUR, Booking gana ~15 EUR, en Tier 1 la comision del afiliado es 3.75 EUR.
- **Pay-per-stay:** no paga reservas canceladas ni no-shows.
- Tracking: **in-session** en el programa directo (no cookies); solo cuenta si la reserva se completa en la misma sesion del navegador.
- Umbral de pago: $100 USD/EUR (roll-over si no se alcanza). Transferencia o PayPal. Acepta Mexico y LatAm.
- Inventario: mas de 28 millones de alojamientos, transporte y atracciones en mas de 60,000 ubicaciones.
- **Demand API:** requiere ser "Managed Affiliate Partner" aprobado con API key y `X-Affiliate-Id`. Reglas estrictas: prohibe cachear precios/disponibilidad, reenviar datos o alterar precios/fotos. Para partners con volumen establecido.
- *La estructura escalonada 25-40% esta corroborada por integradores como iGMS y Mize; la pagina oficial de comisiones se renderiza en JavaScript, conviene confirmarla al loguearse en la cuenta de afiliado.*

**Hotelbeds (APItude) / TBO:**
- "Bedbanks" mayoristas: 300,000+ hoteles, net rates. Permiten poner markup propio y actuar como merchant.
- API key de evaluacion gratis (self-service), pero credenciales live requieren certificacion (enviar test cases al equipo de Hotelbeds).
- Tres APIs: Booking, Content, Cache; el contenido se debe cachear localmente y refrescar al menos semanalmente.
- Clasificacion: **Fase 2** (reservas propias con markup, no afiliado). Como merchant se necesita PCI DSS si se procesan tarjetas.

---

## Cruceros: afiliacion primero, estructura formal despues

No existe una API moderna, publica y self-serve para inventario de cruceros comparable a Duffel para vuelos. La monetizacion profesional sigue ligada a membresías y relaciones B2B.

**Opciones de afiliacion:**
- Royal Caribbean y otras navieras: links de afiliado via redes. Royal Caribbean ~4% sobre AOV ~$2,500 USD, cookie ~45 dias. Aceptan afiliados internacionales.
- GoToSea: "3% o mas" por reserva.
- Expedia CruiseShipCenters: hasta 12%, cookie 7 dias.
- Travelpayouts: comisiones de cruceros disponibles en dashboard (blogs citan hasta "50% del margen", dato no oficial; verificar al darse de alta).

**Cuando avanzar a modelo agencia (Fase 2):**
- Numero IATA via host agency + membresia **CLIA** para acceder a comisiones de navieras y respetar politicas anti-rebating. CLIA Individual Agent Membership (IAM): $89-139 USD/ano segun tipo de agencia afiliada, mas $19.99 por listado en Agent Finder.
- CLIA recomienda haber generado >=5,000 USD en comisiones de crucero el ano previo y mantiene la membresia activa con al menos 2 reservas comisionadas/ano.
- En Mexico: mayoristas CDMX (International Cruises, Mundo Cruceros, Mercado Cruceros) trabajan B2B con agentes formales. Requieren estructura de agencia. Ver [[acreditacion-y-host-agencies]].

---

## Solucion tecnica: destino abierto + fechas flexibles + precio tope

Este patron es el corazon del producto. Las opciones reales en orden de accesibilidad:

**1. Amadeus Self-Service (accesible hoy):** combinar Flight Inspiration Search (`shopping.flightDestinations`) para resolver "a donde" con `maxPrice` y Flight Cheapest Date Search (`shopping.flightDates`) para resolver "cuando". Datos cacheados diariamente; no es precio en vivo. Al hacer clic el usuario va a un deep link de afiliado de Aviasales/Kiwi via Travelpayouts que confirma el precio en vivo y genera comision. **No construye checkout propio en esta etapa.**

**2. Travelpayouts Data API (complemento):** `v2/prices/latest` y `v2/prices/month-matrix` para poblar el feed editorial y paginas SEO. Ya incluye el `marker` del afiliado en los datos, por lo que el clic monetiza directo. Limite: 100 req/min.

**3. Skyscanner Browse/Indicative (upgrade futuro):** la mejor solucion del mercado para este patron, pero requiere aprobacion como partner con >100k visitas/mes.

**4. Kiwi Nomad/flexible search (upgrade futuro):** soportaba multi-ciudad en cualquier orden y rango de fechas amplio. Bloqueado hasta 50k MAU.

**Lo que NO usar para este patron:** Duffel viola su look-to-book 1500:1 con cualquier arquitectura de exploracion masiva. Ver seccion Duffel arriba.

**Arquitectura recomendada para el [[prototipo-drift]]:**
1. Sourcing: Amadeus Inspiration Search o Travelpayouts Data API para poblar destinos y precios.
2. Scoring: calcular "deal quality score" combinando precio absoluto, rareza relativa, non-stop vs escalas y duracion posible.
3. Enriquecimiento: vibe editorial, actividades sugeridas (Viator Affiliate API), hoteles sugeridos (Booking.com Affiliate).
4. Salida: CTA de vuelo hacia White Label de Travelpayouts o deep link Aviasales; hotel hacia Booking.com affiliate; actividad hacia Viator.

**Comunicacion de precios:** Amadeus, Aviasales y Travelpayouts son explicitos en que sus precios de inspiracion son de cache. La UX debe mostrar "precio visto hace X horas" y "verifica tarifa actual", nunca exactitud transaccional.

---

## Umbrales y hoja de ruta de acceso

| Proveedor | Umbral | Estado |
|---|---|---|
| Travelpayouts (links/widgets/Data API) | Sin minimo | Disponible hoy |
| Amadeus Self-Service | Sin minimo (cuota gratuita) | Disponible hoy |
| Viator Affiliate API | Sin minimo | Disponible hoy |
| Klook Affiliate | Sin minimo (~2 dias aprobacion) | Disponible hoy |
| Booking.com Affiliate | Sin minimo (pay-per-stay) | Disponible hoy |
| Royal Caribbean affiliate | Sin minimo | Disponible hoy |
| Duffel Managed Content | Sin minimo (Fase 2) | Cuando se quiera hacer booking propio |
| Kiwi Tequila API | **>=50,000 MAU** | Upgrade |
| Skyscanner Travel API | **>100,000 visitas/mes** | Upgrade |
| GetYourGuide API basica | **100,000 visitas/mes** | Upgrade |
| GetYourGuide Booking API | **1M visitas + 300 reservas/mes** | Upgrade lejano |
| Sabre/Travelport/Amadeus Enterprise | Contrato + IATA | Fase 3 |
| Hotelbeds/TBO live | Certificacion + Fase 2 | Cuando se tome el pago de hoteles |

---

## Cobro en Mexico

Casi todo se calcula y paga en USD o EUR. PayPal y Payoneer son los metodos practicos desde Mexico. Como residente fiscal mexicano, los ingresos mundiales de afiliacion deben declararse al SAT (RFC). Las plataformas extranjeras normalmente no retienen ISR mexicano. Conviene darse de alta como persona fisica con actividad empresarial o en RESICO (si califica) y consultar un contador antes de escalar a reservas propias (donde se manejan ingresos brutos e IVA). Ver [[legal-y-fiscal-mexico]] para el detalle.

Umbrales de pago de Travelpayouts: PayPal $50 USD, transferencia bancaria $400 USD/EUR, WebMoney $10 USD. Pagos automaticos del 11 en adelante por el mes anterior.

---

## Enlaces relacionados

- [[tesis-y-vision]] porque la seleccion de proveedores define que tipo de producto es posible construir en cada fase.
- [[modelo-de-negocio]] porque las comisiones de cada proveedor determinan la economia de cada vertical.
- [[verticales-y-economia-unitaria]] para el calculo de ingreso por venta por proveedor y la razon por la que experiencias y cruceros superan a vuelos.
- [[arquitectura-mvp]] porque la capa de sourcing, scoring, enriquecimiento y salida depende directamente de las APIs disponibles hoy.
- [[prototipo-drift]] porque el primer corte tecnico implementa Amadeus Inspiration + Travelpayouts como feed y Viator + Booking.com como attach.
- [[acreditacion-y-host-agencies]] para entender cuando y como cruzar de afiliado a agencia con IATA/CLIA/TIDS.
- [[legal-y-fiscal-mexico]] para las implicaciones del RFC, SAT, RNT y PROFECO segun el modelo que se adopte.
- [[riesgos-y-preguntas-abiertas]] porque la cobertura incompleta de Amadeus y el cierre de Hotellook son riesgos de inventario activos.
- [[roadmap]] para el orden de activacion de cada proveedor por fase.

---

## Fuentes

- [[2026-06-investigacion-apis-vuelos-experiencias]]
- [[2026-06-investigacion-competir-con-ota]]
- [[2026-06-investigacion-tesis-negocio]]
