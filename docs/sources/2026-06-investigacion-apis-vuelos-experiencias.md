# Cómo conectar APIs de vuelos y experiencias para un agregador de viajes premium (afiliado → reservas propias) desde México

## TL;DR
- **Empieza en modo afiliado con dos altas inmediatas y gratuitas: Travelpayouts (vuelos vía Aviasales/Kiwi + hoteles + experiencias) y Amadeus Self-Service (para datos de inspiración de vuelos "a cualquier lugar / fechas flexibles / precio tope").** Ninguna requiere acreditación IATA, ninguna cobra por darte de alta, y ambas aceptan a personas de México. El resto (Skyscanner, Booking Demand API, GetYourGuide/Viator API plena) exige tráfico mínimo que aún no tienes.
- **Para el patrón "destino abierto + fechas flexibles + precio tope" la solución técnica real es Amadeus Flight Inspiration Search + Flight Cheapest Date Search (datos cacheados), complementado con el Data API de Travelpayouts; Skyscanner "Browse/Indicative" es superior pero está cerrado hasta que tengas >100k visitas/mes.** Estos endpoints devuelven datos cacheados, no en vivo: sirven para inspirar y generar páginas, no para confirmar precio final. Ojo: Duffel NO sirve para esta función por su regla look-to-book de 1500:1.
- **Prioriza verticales por economía unitaria: cruceros y paquetes (3–16% sobre tickets de US$1,200–3,000) y experiencias (Viator/GetYourGuide 8%, Klook 5–6.5%) pagan mucho más que vuelos (~1.1–1.5%).** Cobrarás en USD vía PayPal o Payoneer; como residente fiscal en México debes declarar ese ingreso al SAT (RFC), pero las plataformas extranjeras normalmente no te retienen ISR mexicano.

---

## Key Findings

1. **El "bloqueador" histórico (acreditación IATA) ya no aplica en modo afiliado.** Como afiliado solo rediriges tráfico y cobras comisión; nunca emites boletos ni tomas pagos, así que no necesitas IATA, ARC ni CLIA. Esa barrera —según Duffel, un bono promedio de ~US$50,000 por país de operación, una cuota de aplicación de ~US$1,300, una anualidad de ~US$200 y "no menos de 90 días" para acreditarse— solo aparece cuando migres a reservas propias de vuelos. Y aun entonces puedes evitarla usando el "Managed Content" de Duffel, que presta sus 5 acreditaciones IATA globales.

2. **Travelpayouts es la puerta de entrada óptima**: una sola alta gratuita te da acceso a vuelos (Aviasales/Jetradar), Kiwi.com (links), hoteles (Booking, Hotellook), experiencias (Viator, GetYourGuide, Tiqets, WeGoTrip), autos (DiscoverCars) y eSIM, con un único dashboard y un único pago mensual consolidado. Travelpayouts declara en su sitio oficial haber pagado "$63M+ to its partners" en sus 11+ años de operación. Es lo más cercano a "Vacations To Go multi-vertical" sin firmar 10 contratos.

3. **Amadeus Self-Service es la mejor API "de verdad" para empezar a construir**: alta self-service instantánea, sandbox gratis, cuota mensual gratuita en producción (de 1,000 a 10,000 llamadas según API), y los endpoints exactos que necesitas para inspiración (Flight Inspiration Search, Flight Cheapest Date Search). Se paga por uso solo al exceder la cuota: el rango real reportado por Amadeus e integradores es ≈US$0.0008–0.024 por llamada según API.

4. **Kiwi.com Tequila ya casi no es accesible para proyectos nuevos**: cerraron el acceso público de afiliados/API y ahora se enfocan solo en "key business partnerships". Vía Travelpayouts, la API de Kiwi exige ~50,000 MAU (usuarios activos mensuales). No cuentes con Kiwi directo al inicio.

5. **Skyscanner, Booking Demand API, GetYourGuide Booking API y Expedia Rapid API tienen umbrales de tráfico/negocio que un side project nuevo no cumple** (Skyscanner pide >100k visitas/mes y rechaza explícitamente a estudiantes y startups sin producto pre-desarrollado; GetYourGuide pide 100k visitas/mes para acceso básico y 1M visitas + 300 reservas/mes para acceso completo). Para esas marcas, empieza con sus links/widgets de afiliado (vía Travelpayouts o redes como CJ/Awin/Impact) y migra a API cuando crezcas.

6. **La economía favorece cruceros, paquetes y experiencias, no vuelos.** Vuelos pagan ~1.1–1.5% (Aviasales vía Travelpayouts) vs 4–5% en hoteles. Experiencias: Viator 8% sobre reservas completadas, GetYourGuide "minimum commission rate of 8%", Klook 5–6.5% (eSIM hasta 20%). Cruceros: ~3% (agregadores) hasta ~12–16% (Expedia CruiseShipCenters / navieras / mayoristas), sobre tickets muy altos (US$1,200–3,000+).

---

## Details

### 1) Comparativa y trámite de alta de cada API/proveedor de VUELOS

**A. Travelpayouts (Aviasales / Jetradar / Kiwi) — RECOMENDADA #1 para empezar**
- **Qué es:** red de afiliados especializada en viajes (no es un GDS). Agrupa +100 marcas.
- **Tipo de acceso:** afiliado (links, deep links, widgets, White Label) + APIs de datos (Flight Data API, Data Access API, Affiliate Stats API). La Flight Search API se da solo bajo petición a soporte.
- **IATA:** No requiere.
- **Costo/modelo:** gratis unirse, sin costos de setup. Revenue share — según el sitio oficial, "Travelpayouts receives fees directly from the brands, leaving the full commission for you" y "shares up to 70% of the revenue from your referred bookings". Comisiones típicas: ~1.1–1.5% vuelos, 4–5% hoteles.
- **Alta paso a paso:** (1) registro en travelpayouts.com (gratis, ~1 min); (2) conectarte a cada programa de marca (Aviasales, Kiwi, Booking, Viator, etc.) desde el catálogo; (3) obtener tu `marker` (ID de afiliado) y tu API token en Profile → API token; (4) generar links/widgets o llamar la Data API. Acepta personas/empresas de México. Aprobación generalmente inmediata o en pocos días.
- **Para qué sirve:** monetizar tráfico desde el día 1 sin construir checkout. Ideal para tu fase afiliado multi-vertical.

**B. Amadeus Self-Service APIs (for Developers) — RECOMENDADA #2 (construcción técnica)**
- **Qué es:** APIs REST/JSON del GDS Amadeus, pensadas para que negocios sin certificación de agencia accedan a tecnología GDS. Catálogo de ~30 APIs en 2025.
- **Tipo de acceso:** búsqueda (Flight Offers Search), inspiración (Flight Inspiration Search, Flight Cheapest Date Search), precio (Flight Offers Price) y hasta booking (Flight Create Orders). Solo tarifas públicas (no incluye American, Delta, British Airways ni low-cost; eso es Enterprise).
- **IATA:** No requiere para self-service.
- **Costo/modelo:** Pay-as-you-go. Test/sandbox gratis. En producción mantienes una cuota mensual gratuita (1,000–10,000 llamadas según API) y solo pagas el excedente (≈US$0.0008–0.024 por transacción según API). Sandbox: hasta 10 requests/usuario/seg.
- **Alta paso a paso:** (1) crear cuenta en developers.amadeus.com; (2) registrar tu app → recibes API Key y API Secret; (3) generar token y llamar en sandbox (datos limitados); (4) pasar a producción (gratis, solo pagas excedente). SDKs en Node, Python, Java, etc.
- **Para qué sirve:** el motor de descubrimiento/inspiración y, más adelante, búsqueda en vivo.

**C. Amadeus Enterprise APIs**
- **Qué es:** catálogo completo (+140 APIs), contenido extendido (aerolíneas full-service, low-cost, tarifas negociadas/privadas).
- **Acceso:** requiere autorización de empresa, contrato comercial, soporte dedicado. No self-service. Mayormente SOAP todavía.
- **IATA:** generalmente sí, o relación contractual formal.
- **Cuándo:** cuando escales a OTA con reservas propias y volumen.

**D. Duffel (Flights API + Payments API) — para la FASE 2 (reservas propias)**
- **Qué es:** agregador moderno (UK) que da acceso a 300+ aerolíneas (NDC/GDS/LCC) + stays, con API limpia.
- **Tipo de acceso:** búsqueda + booking + ancillaries + pagos. Su "Managed Content" presta las acreditaciones IATA de Duffel (tiene 5 IATAs mundiales) para que vendas sin acreditarte tú.
- **IATA:** NO requiere — Duffel maneja la acreditación por ti. (Puedes usar la tuya si la tienes.)
- **Costo/modelo:** pay-as-you-go por reserva. Según duffel.com/pricing y su Help Center: además del fee por orden (≈$3 + 1% del valor de la orden + 2% de FX), aplica un "Excess Search fee" para mantener un ratio de no más de 1,500 búsquedas por orden; por cada 10 órdenes/mes tienes 15,000 búsquedas gratis, y el excedente cuesta US$0.005/búsqueda (ej.: 25,000 búsquedas = US$50).
- **⚠️ ADVERTENCIA CRÍTICA para tu caso de uso:** Duffel exige explícitamente mantener un look-to-book de 1500:1 y advierte "we might not be suitable for… metasearch engines or calendar search". Es decir, **Duffel NO es adecuado para la función "destino abierto / calendario de precios"** — úsalo solo para el booking transaccional de un itinerario concreto que el usuario ya eligió.
- **Alta:** registro en duffel.com en ~1 min, sandbox para probar sin pagos reales, luego producción. Acepta negocios globales.
- **Para qué sirve:** cuando quieras tomar el pago y emitir tú el boleto (migración de afiliado a OTA). Clave para México porque elimina el bono IATA.

**E. Kiwi.com Tequila / Kiwi affiliate — ACCESO RESTRINGIDO**
- **Qué era:** plataforma B2B (Tequila) con Search, Booking, Multicity, Nomad, Visa APIs + programa de afiliados (deep links, widgets).
- **Estado actual:** Kiwi cerró el acceso público; ahora se enfocan solo en "key business partnerships". Vía Travelpayouts, la API de Kiwi requiere **≥50,000 MAU** en tu proyecto.
- **Conclusión:** no viable directo al inicio; puedes usar links de afiliado de Kiwi vía Travelpayouts (sin la API) mientras creces.

**F. Skyscanner Partners / Travel API — ACCESO RESTRINGIDO (meta-search)**
- **Qué es:** API meta-search (1,200+ aerolíneas/OTAs, 52 mercados). Incluye "Browse/Indicative" (precios cacheados para "cheapest anywhere/anytime") y "Live Prices".
- **Acceso:** partner-only, solicitud vía Partner Portal, respuesta típica ~2 semanas. **Criterios oficiales:** "Established businesses with a large audience (>100k monthly traffic)" y alineación con la marca; el portal rechaza explícitamente "students and other individuals (i.e working on a non-commercial basis)" y "start-ups without a robust business plan and pre-developed product".
- **Costo:** sin fee por llamada para partners aprobados; monetizas por comisión, tracking vía Impact.
- **Afiliado (separado):** el Skyscanner Affiliate Programme corre en impact.com con su propio criterio de aceptación.
- **Conclusión:** apúntalo para cuando superes 100k visitas/mes.

**G. Sabre APIs (GDS) — FASE 2/3, contrato comercial**
- **Qué es:** uno de los "Big Three" GDS. Sabre Dev Studio da sandbox; producción requiere contrato.
- **Acceso:** sandbox self-service (Test User ID/password), pero producción NO es instantánea: intake form con web, IATA/ARC y volúmenes; negociación de meses; contrato vía DocuSign; te asignan PCC/iPCC y account manager.
- **IATA/ARC:** para emitir boletos sí (ARC en EE.UU., BSP/IATA fuera). Sin acreditación, operas bajo host agency / white-label.
- **Costo:** no público; depende de volumen; facturas a 60 días.
- **Conclusión:** sobredimensionado para un side project; relevante si te conviertes en OTA seria.

**H. Travelport (Universal API / JSON APIs / Travelport+) — FASE 2/3, contrato comercial**
- **Qué es:** el tercer GDS. Plataforma Travelport+ agrega Galileo/Apollo/Worldspan + NDC + LCC. Dos familias de API: Universal API (SOAP/XML, madura) y la suite JSON/REST (mobile-first, NDC).
- **Acceso:** NO self-service. Fase de discovery/negociación de ventas (como Sabre/Amadeus Enterprise). Según AltexSoft, hay free trial de 30 días en pre-producción (sandbox) limitado a Air y Hotel para Universal API. Certificación obligatoria antes de producción (aviso de ≥15 días hábiles).
- **IATA/ARC:** para emitir boletos directo sí (IATA global / ARC EE.UU.); sin acreditación, operas bajo host agency o consolidador aéreo.
- **Costo (reportado por integradores, no precio público):** ~US$5,000/año de acceso recurrente (incluye soporte estándar + certificación del primer producto); setup ~US$4,000–5,000; pricing siempre negociado. Travelport no publica precios abiertos.
- **Alta:** formulario en developer.travelport.com → propuesta comercial → contrato → cuenta de developer → certificación → producción.

**I. Otras opciones relevantes para empezar:**
- **Redes de afiliados horizontales:** CJ Affiliate y Awin (hospedan Tripadvisor, GetYourGuide, Booking, Agoda, Expedia, etc.); Impact (Skyscanner, muchos hoteles); Partnerize (enterprise). FlexOffers; ShareASale cerró en oct 2025 y migró a Awin.
- **Hotelbeds (APItude) / TBO:** "bedbanks" mayoristas (300k+ hoteles, net rates). Hotelbeds: API key de evaluación gratis self-service, pero el plan con pricing/comisión y credenciales live requiere certificación (enviar test cases a su equipo). Tres APIs (Booking, Content, Cache); debes cachear contenido localmente y refrescarlo al menos semanalmente. Es para FASE 2 (reservas propias con markup), no afiliado.

---

### 2) Resolver técnicamente "DESTINO ABIERTO + FECHAS FLEXIBLES + PRECIO TOPE"

Este es el corazón del producto tipo Vacations To Go ("vuela desde CDMX a donde sea, cuando sea, bajo cierto precio"). Las opciones reales:

**Amadeus Self-Service (la opción accesible y completa):**
- **Flight Inspiration Search** (`shopping.flightDestinations`): das un origen (ej. MEX) y devuelve un listado de **destinos** ordenados por precio, filtrable por fecha de salida, one-way/round-trip, duración del viaje, escalas y **maxPrice** (precio tope). El único parámetro obligatorio es el IATA de origen. → Resuelve "destino abierto + precio tope".
- **Flight Cheapest Date Search** (`shopping.flightDates`): das origen y destino y devuelve las **fechas más baratas** con precios, ordenable por precio/fecha/duración, con filtros de rango de fechas, duración del viaje y maxPrice. → Resuelve "fechas flexibles / calendario de precios".
- **Limitación crítica:** ambas usan **datos cacheados dinámicos** generados a diario a partir de búsquedas/reservas pasadas ("most trending options"). NO es precio en vivo. Una vez elegida fecha/destino, debes llamar **Flight Offers Search** (en vivo) y **Flight Offers Price** para confirmar. La cobertura se limita a lo "trending" (rutas con poca demanda pueden faltar) y solo a tarifas públicas (no low-cost ni negociadas).
- **Rate limits:** sandbox 10 req/usuario/seg; cuota gratuita mensual por API (1,000–10,000 llamadas) y pago por excedente.

**Travelpayouts Data API (complemento gratuito):**
- Endpoints como `v2/prices/latest` (si omites origen/destino, devuelve los 30 tickets más baratos hallados en las últimas 48h), `v2/prices/month-matrix` (precios por día del mes agrupados por número de escalas) y price trends por destino popular.
- **Limitación:** datos **de caché** que la propia documentación recomienda usar para "generar páginas estáticas", no para precios en vivo. Límite: 100 req/min por marker. Ventaja: ya viene con tu link de afiliado (`marker`), así que el clic monetiza directo.

**Skyscanner "Browse Quotes / Indicative" (la mejor, pero cerrada):**
- Permite literalmente "¿cuál es el precio más barato de Nueva York a cualquier lugar, cualquier fecha del próximo año?" sobre datos cacheados, además de Live Prices para queries exactas. **Pero requiere aprobación de partner (>100k visitas/mes).** Apúntalo como upgrade.

**Kiwi flexible search / Nomad:** soportaba destino abierto, rango de fechas amplio, y multi-ciudad en cualquier orden (Nomad). Hoy bloqueado salvo 50k MAU.

**Recomendación técnica:** construye la función "inspiración" sobre **Amadeus Inspiration + Cheapest Date** (precio tope y calendario), cachea resultados para páginas tipo "Desde CDMX bajo $5,000 MXN", y al hacer clic el usuario va a un **deep link de afiliado de Aviasales/Kiwi (Travelpayouts)** que confirma el precio en vivo y te paga comisión. Así no necesitas booking propio todavía. **No intentes usar Duffel para esta vista de calendario** (viola su look-to-book 1500:1). Deja claro al usuario que los precios de inspiración son "desde / aproximados".

---

### 3) APIs y programas de afiliados de EXPERIENCIAS, HOTELES y CRUCEROS

**Experiencias y actividades:**
- **GetYourGuide:** afiliado (Creator/Content Partnerships) con "minimum commission rate of 8%, paid monthly" (página oficial partner.getyourguide.com); cookie 30 días ("If someone makes a purchase within 30 days of clicking your link, you'll earn commission on their entire order"); pago mensual por transferencia o PayPal. Vía CJ Affiliate o directo. **No requiere IATA/CLIA.** La **Partner API** tiene 4 niveles: básico (100k visitas/mes), Booking API (1M visitas + 300 reservas/mes), etc. → empieza por links/widgets de afiliado.
- **Viator (red Tripadvisor):** según partnerresources.viator.com, "Viator Affiliates earn 8% commission on any experience booked within 30 days… you'll receive the commission once the experience has been completed." Cookie 30 días, last-click; alta en <1 min si ya tienes cuenta Tripadvisor. Pagos: PayPal semanal sin mínimo, o transferencia mensual con mínimo US$50. **Affiliate API** (Basic Access) disponible: endpoints de contenido (no transaccionales); las ventas se cierran en viator.com vía deep link. Cancelaciones revierten la comisión.
- **Klook:** afiliado vía portal propio, Travelpayouts o redes regionales (Involve Asia, Ecomobi). Comisión por categoría: tours/hoteles ~6.5%, atracciones 5%, eSIM hasta 20%, gift cards 2%; cookie 30 días (7 días hoteles/autos). Aprobación ~2 días. Fuerte en Asia.
- **Tiqets:** afiliado vía Awin; comisión citada como 50% del margen de Tiqets (otras fuentes US$6/venta). API disponible para partners con volumen. Bueno para museos/atracciones en Europa.

**Hoteles:**
- **Booking.com Affiliate Partner Program:** modelo **revenue share** (% de la comisión que Booking gana del hotel, no del valor de la reserva). Estructura escalonada por estancias completadas/mes: **Tier 1 (1–50) 25%, Tier 2 (51–150) 30%, Tier 3 (151–500) 35%, Tier 4 (501+) 40%**. Ejemplo: reserva de 100 EUR → Booking gana ~15 EUR → en Tier 1 tu comisión = 3.75 EUR (25% de 15). **Pay-per-stay** (no paga reservas canceladas ni no-shows). Tracking **in-session** (el programa directo no usa cookies). Umbral de pago US$/EUR 100 (roll-over si no se alcanza); transferencia o PayPal (PayPal en EUR). Acepta México/LatAm ("Reservations made in all countries are commissionable"). La **Demand API** (sandbox + endpoints de accommodation/attractions/cars) requiere ser "Managed Affiliate Partner" aprobado con API key y X-Affiliate-Id. Reglas estrictas: prohíbe cachear precios/disponibilidad, reenviar datos, alterar precios/fotos. *(La estructura 25–40% está corroborada por integradores como iGMS y Mize; la página oficial de comisiones se renderiza en JavaScript y conviene confirmarla logueado.)*
- **Expedia:** (a) **Affiliate Program** (links/widgets, para blogs/individuos) — la vía para empezar; (b) **TAAP** (Travel Agent Affiliate Program) — requiere credenciales IATA/ARC/CLIA/TRUE, no para ti aún; comisiona hoteles, paquetes, autos, actividades (no vuelos salvo en paquete), con tiers de hotel (Basic→Premium Plus); permite añadir "agency service charge" de hasta 30% en lodging/paquetes; (c) **Rapid API (EPS)** — hotel inventory potente (700k+ propiedades) pero requiere ser partner aprobado, equipo de desarrollo y a veces PCI compliance. Empieza por el Affiliate Program.
- **Hotelbeds/TBO:** mayoristas para FASE 2 (net rates + markup). API key de evaluación gratis, credenciales live tras certificación.

**Cruceros (la vertical mejor pagada por ticket):**
- **Programas de afiliados de navieras (Royal Caribbean, Carnival, etc.):** suelen ser **solo links de afiliado** (no API), gestionados vía redes. Royal Caribbean: ~4% sobre AOV ~US$2,500 (US$100+/venta), cookie ~45 días, aprobación en pocos días. Aceptan afiliados internacionales.
- **Agregadores de cruceros:** GoToSea (U.S. News) "3% or more" por reserva; Travelpayouts ofrece cruceros con comisiones altas (blogs citan hasta "flat 50%" del margen — verifica en dashboard); Expedia CruiseShipCenters hasta 12% (cookie 7 días).
- **Mayoristas/operadoras de cruceros en México (FASE 2, modelo agencia):** International Cruises (IC), Mundo Cruceros y Viajes (CDMX), Mercado Cruceros (CDMX, registro SECTUR), Mundomar Cruceros. Trabajan B2B con agentes/agencias, ofrecen "esquemas de comisión atractivos", MSI (12 meses sin intereses con Royal/Celebrity/Azamara, 6 con Norwegian), capacitación y FAMs. Requieren que seas agencia/agente. Útiles cuando tengas estructura formal y quieras vender cruceros con margen real en México.
- **Importante para cruceros directos con navieras (FASE 2):** vender como agente requiere número IATA (vía host agency) y normalmente membresía **CLIA**. La Individual Agent Membership (IAM) de CLIA cuesta US$139/año (afiliado a un Travel Agency Member) o US$89/año (afiliado a Premier Agency Member), +US$19.99 por listado en Agent Finder; CLIA recomienda haber generado ≥US$5,000 en comisiones de crucero el año previo, y mantenerla exige al menos 2 reservas comisionadas/año. Las navieras tienen políticas estrictas anti-rebating (no anunciar bajo tarifa publicada).

---

### 4) Flujo de afiliación y comisión a detalle

**Tracking de clics y conversiones:**
- **Marker / SubID (Travelpayouts):** tu `marker` es tu ID de afiliado embebido en cada deep link; el `SubID` te permite saber qué herramienta/página generó cada clic y reserva.
- **Cookies + deep links:** la mayoría (Viator, GetYourGuide, Klook) usan cookie de 30 días con atribución last-click — quien hace clic en tu link tiene 30 días para comprar y se te atribuye toda la orden.
- **In-session sin cookie (Booking directo):** solo cuenta si la reserva se completa en la misma sesión del navegador.
- **Server-to-server postbacks:** las redes (Everflow, Impact, CJ, Awin) soportan postback URLs con macros (sub1–sub10) para registrar conversiones servidor-a-servidor, evitando pérdida por bloqueo de cookies. Parámetros UTM se usan para tu propia analítica, no para la atribución del proveedor.

**Atribución y pago:**
- **Ventana de cookie:** 30 días estándar (Viator, GetYourGuide, Klook tours); Royal Caribbean ~45 días; Tripadvisor 14 días; Klook hoteles 7 días.
- **Last-click** domina. La comisión se confirma normalmente tras **completarse el servicio** (Viator paga tras realizarse el tour; Booking tras la estancia; cruceros a veces parcial antes de zarpar).
- **Pagos/umbrales:** Travelpayouts: **PayPal US$50, transferencia bancaria USD/EUR 400, WebMoney US$10** (datos de la página oficial de payout methods); pagos automáticos del 11 en adelante, por el mes anterior (enero se paga en febrero); Travelpayouts cubre la comisión de envío de PayPal. Viator: PayPal semanal sin mínimo / transferencia mensual US$50. Booking: US$/EUR 100. GetYourGuide: mensual, transferencia o PayPal. CJ: dos ciclos mensuales vía Payoneer o depósito directo.

**Cómo cobra un afiliado en México:**
- **Moneda:** casi todo se calcula y paga en **USD o EUR**. PayPal y Payoneer son los métodos prácticos (Payoneer da datos bancarios USD/EUR para recibir; fees de hasta ~3% por conversión de divisa y ~US$1.50 flat enviando USD). Para MXN, conviertes al retirar a tu banco.
- **Fiscal (clave):** como **residente fiscal en México** (tienes tu casa habitación aquí), debes inscribirte en el **RFC** y declarar al SAT estos ingresos mundiales, aunque vengan del extranjero. México tiene tratados para evitar doble tributación. Lo más práctico: darte de alta como **persona física con actividad empresarial** o en **RESICO** (si calificas) y declarar/emitir CFDI por ese ingreso.
- **Retención del extranjero:** las plataformas (Travelpayouts/Booking/Viator) **no son residentes en México y normalmente no te retienen ISR mexicano**. La obligación de retención del Título V de la LISR aplica a quien *paga desde México a un residente en el extranjero* (la fuente de riqueza en territorio nacional), no a tu caso: tú eres el residente mexicano que *recibe* del extranjero. Es decir, tú declaras y pagas tu ISR en México sobre la comisión; ellos no te retienen. Tu CURP se usa para tramitar tu RFC; no necesitas entregarlo a las plataformas extranjeras.
- **Consulta a un contador** especializado en fiscalidad internacional antes de escalar.

**Directo vs vía red de afiliados:**
- **Directo con el proveedor:** más control, a veces mejor comisión y ventana de cookie propia, pero firmas y gestionas cada programa por separado y cobras de cada uno.
- **Vía red (Travelpayouts/CJ/Awin/Impact):** un solo dashboard, un solo pago consolidado, tracking y validación incluidos; la red toma un override (típicamente 20–30% en redes horizontales, aunque Travelpayouts afirma cobrar a la marca y dejarte la comisión completa). Para empezar, la red gana por simplicidad. El modelo "hybrid" (red para descubrir, directo para tus top performers) es lo que adoptan los OTAs al escalar (típicamente cuando el canal afiliado supera ~10% de las reservas o ~50 partners activos).

---

### 5) Modelo de negocio y economía unitaria (2026)

| Vertical | Comisión típica afiliado | Ticket medio | Comisión por venta | Notas |
|---|---|---|---|---|
| **Vuelos** | ~1.1–1.5% | bajo-medio | muy baja | Aviasales vía Travelpayouts. Márgenes de aerolínea mínimos. |
| **Hoteles** | 4–5% (Travelpayouts) / 25–40% del *margen* de Booking | medio | media | Booking revenue-share escalonado pay-per-stay. |
| **Experiencias** | 5–8% | bajo-medio | media | Viator 8%, GYG ≥8%, Klook 5–6.5% (eSIM 20%). |
| **Paquetes** | 8–12% (TAAP/agregadores) | alto | alta | Combinan hotel+vuelo+actividades. |
| **Cruceros** | 3% (agregadores) → 12–16% (CruiseShipCenters/mayoristas) | muy alto (US$1,200–3,000+) | muy alta | Mejor comisión absoluta por venta. |

**Por qué los vuelos pagan poco:** las aerolíneas operan con márgenes netos muy delgados y han desintermediado a las agencias; la comisión por boleto es mínima y muchas tarifas (low-cost) pagan casi cero. **Por qué cruceros/paquetes pagan más:** son productos de alto valor, alto margen para el operador, baja sensibilidad al precio unitario de comisión, y la naviera valora al intermediario que le trae al cliente; además el ticket es 10–30× el de un vuelo.

**Implicación para priorizar:** un clic en vuelos puede valer centavos; un crucero vendido vale US$100–400. **Usa los vuelos (inspiración) como gancho de tráfico (SEO/contenido) y monetiza de verdad en experiencias, hoteles, paquetes y cruceros.** Es exactamente el modelo Vacations To Go (líder en cruceros/paquetes, no en vuelos sueltos).

**Requisitos mínimos de tráfico/ventas:**
- Para *aprobar*: Travelpayouts/Viator/Klook/Royal Caribbean: prácticamente sin mínimo. Skyscanner API >100k visitas/mes. GetYourGuide API 100k visitas (básico) / 1M + 300 reservas (completo). Booking Demand API: ser Managed Affiliate aprobado.
- Para *pagar*: umbrales de payout arriba (Travelpayouts PayPal US$50 / Booking US$/EUR 100, etc.).

---

### 6) Consideraciones legales/regulatorias para operar como afiliado desde México

**Lo que SÍ puedes hacer como afiliado sin ser agencia acreditada:**
- Mostrar resultados de búsqueda/inspiración, comparar precios, publicar contenido y **redirigir** al sitio del proveedor con tu link de afiliado. No tomas pagos del viajero, no emites boletos/vouchers, no eres el "merchant of record". Cobras comisión por referir. Esto no te convierte en agencia de viajes y no requiere IATA/ARC/CLIA.

**Dónde se cruza la línea hacia "agencia formal":**
- Cuando **tomas el pago del cliente**, emites la confirmación/boleto a tu nombre, eres responsable del cumplimiento del servicio o manejas el dinero del viajero. Ahí entras en terreno de agencia de viajes / intermediario turístico. En México, los prestadores de servicios turísticos (incluidas agencias) deben inscribirse en el **Registro Nacional de Turismo (RNT/SECTUR)** y cumplir la Ley General de Turismo y normas de protección al consumidor (PROFECO), además de obligaciones fiscales plenas (CFDI, IVA).

**Qué cambia al pasar de afiliado a reservas propias:**
- **Vuelos:** necesitas acreditación IATA (bono ~US$50k/país, fee aplicación ~US$1,300, anualidad ~US$200, +90 días) **o** usar el Managed Content de Duffel (presta su IATA) / un consolidador / host agency. Duffel es la ruta más simple para evitar el bono.
- **Cruceros:** número IATA (vía host agency) + membresía **CLIA** (IAM US$89–139/año) para acceder a comisiones de navieras; respetar políticas anti-rebating.
- **Hoteles propios:** contratos con bedbanks (Hotelbeds/TBO) o EPS Rapid; tú pones markup y eres merchant → PCI DSS si procesas tarjetas.
- **GDS:** Sabre/Travelport/Amadeus Enterprise requieren contrato, posible PCC, y acreditación para ticketing.
- **Identificadores intermedios:** **TIDS** (Travel Industry Designator Service de IATA) es un identificador de bajo costo que te da un número para recibir comisiones de algunos proveedores sin la acreditación plena — útil como paso intermedio.
- **Fiscal:** como merchant tomas ingresos brutos (no solo comisión) → IVA, CFDI, posible figura de persona moral, y manejo de anticipos/reembolsos.

---

## Recommendations

**Orden de alta concreto (fase afiliado, semanas 1–8):**
1. **Travelpayouts** (semana 1): regístrate gratis, conéctate a Aviasales, Kiwi (links), Booking, Viator, GetYourGuide, Tiqets, Klook y DiscoverCars. Obtén tu `marker` y API token. Esto te da monetización multi-vertical inmediata y datos de vuelos (Data API).
2. **Amadeus Self-Service** (semana 1–2): crea cuenta, registra app, prueba Flight Inspiration Search y Flight Cheapest Date Search en sandbox. Construye la función "destino abierto + fechas flexibles + precio tope".
3. **Viator directo** (semana 2): alta en <1 min vía Tripadvisor; activa Affiliate API (Basic Access) para contenido de experiencias. PayPal semanal sin mínimo es ideal para flujo de caja.
4. **Cruceros vía agregador** (semana 3–4): únete a un programa de cruceros (GoToSea, Expedia CruiseShipCenters, o el de cruceros de Travelpayouts/CJ) para capturar la vertical mejor pagada por ticket.
5. **GetYourGuide / Klook directo** (semana 4): links/widgets de afiliado mientras no tengas el tráfico para sus APIs.

**Cómo cobrarás:** abre **PayPal** y **Payoneer** en USD; configura PayPal como método principal en Travelpayouts (umbral US$50). Inscríbete en el **RFC** (persona física con actividad empresarial o RESICO) y lleva control de ingresos en USD convertidos a MXN para tu declaración. Consulta un contador antes de superar ingresos relevantes.

**Qué NO hacer todavía:** no pierdas tiempo solicitando Skyscanner API, Booking Demand API completa, GetYourGuide Booking API, Sabre o Travelport — no calificas por tráfico y/o requieren contrato. Tampoco uses Duffel para la vista de calendario (viola su look-to-book 1500:1). Apúntalos como upgrades.

**Benchmarks que cambian la estrategia:**
- **>100k visitas/mes:** solicita Skyscanner Travel API y GetYourGuide API básica.
- **>50k MAU:** solicita Kiwi Tequila API vía Travelpayouts.
- **Cuando la comisión de afiliado supere ~10% de tus "bookings" o tengas demanda de checkout propio:** evalúa **Duffel** (vuelos transaccionales, sin bono IATA) y **Hotelbeds/TBO** (hoteles con markup) para migrar a reservas propias; considera **TIDS** como paso intermedio y **CLIA** si vas fuerte a cruceros.
- **Cuando vendas cruceros con volumen en México:** acércate a mayoristas CDMX (International Cruises, Mundo Cruceros, Mercado Cruceros) bajo estructura de agencia formal.

**Prioridad de verticales (dónde poner el esfuerzo de producto):** 1) cruceros/paquetes, 2) experiencias, 3) hoteles, 4) vuelos (como gancho de tráfico/inspiración, no como fuente principal de ingreso).

---

## Caveats
- **Datos cacheados ≠ precio en vivo.** Amadeus Inspiration/Cheapest Date y Travelpayouts Data API devuelven precios cacheados/históricos. Debes etiquetarlos como "desde / aproximados" y confirmar en vivo antes de cualquier compra, o arriesgas quejas de usuarios y problemas con PROFECO.
- **Comisiones varían y cambian.** Los porcentajes citados (Booking 25–40%, Viator 8%, Klook 2–20%, cruceros 3–16%) son rangos públicos de 2025–2026 que cada programa puede modificar; verifica en el dashboard al darte de alta. Algunas cifras (ej. comisiones de cruceros vía Travelpayouts "50%", o Tiqets "50% del margen") provienen de blogs de afiliados, no de páginas oficiales, y pueden estar infladas.
- **Kiwi y Skyscanner cerraron acceso** que antes era abierto; el panorama de APIs cambia rápido — confirma estado actual al integrar.
- **La página oficial de comisiones de Booking** se renderiza en JavaScript y no fue extraíble palabra por palabra; la estructura escalonada 25–40% está corroborada por múltiples integradores (iGMS, Mize) pero conviene confirmarla logueado en tu cuenta de afiliado.
- **Fiscalidad:** la guía aquí es orientativa. La clasificación exacta (RESICO vs actividad empresarial), tasas y obligaciones dependen de tu situación; un contador en México es indispensable antes de escalar a reservas propias (donde manejas ingresos brutos e IVA).
- **Pricing de GDS y Enterprise no es público** (Sabre; Travelport ~US$5k/año y setup ~US$4–5k según integradores; Amadeus Enterprise); estas cifras provienen de integradores terceros y se negocian caso por caso.
- **El look-to-book de Duffel (1500:1)** y el "Excess Search fee" implican que un agregador con mucha búsqueda y pocas reservas puede incurrir en costos significativos; diséña tu arquitectura para confirmar precio en vivo solo cuando el usuario muestre intención real de compra.