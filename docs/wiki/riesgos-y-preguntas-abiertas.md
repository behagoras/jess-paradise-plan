# Riesgos y preguntas abiertas

> **Tipo:** concepto  ·  **Parte de:** [[index]]

Este documento consolida los riesgos identificados y las preguntas sin respuesta definitiva del proyecto. Se distingue entre **hallazgos de la investigación** (evidencia externa) e **hipótesis del fundador** (supuestos internos aún no validados). La distinción importa porque define qué se puede ejecutar hoy y qué requiere prueba.

---

## 1. Acceso a inventario bueno

**Hallazgo de investigación.** El inventario más valioso para un viajero flexible, como las cabinas de crucero de último minuto con descuentos de hasta 85%, no sale de ninguna API pública. Vacations To Go construyó su ventaja en 40 años convenciendo a las navieras de rematar cabinas no vendidas a una "lista confidencial de clientes", precisamente para no socavar la tarifa completa que venden las agencias tradicionales. Esos precios viven detrás de un muro de registro, la disponibilidad promedio es menor a 7 días y muchos deals se agotan en horas.

**Implicación directa:** no se puede entrar compitiendo por ese inventario desde el día uno. La secuencia correcta es acumular tráfico y audiencia con deals públicos, y solo entonces negociar acceso preferencial. El tráfico es la llave al inventario bueno, no al revés.

**Hipótesis del fundador (sin validar):** la versión "solo deals públicos", si la curaduría y la UX son fuertes, es suficientemente atractiva para construir la audiencia que eventualmente abre la puerta al inventario negociado.

---

## 2. Cobertura de vuelos: la brecha de Amadeus

**Hallazgo de investigación.** [[proveedores-apis-e-inventario]] detalla esto a fondo, pero el riesgo merece mención aquí: Amadeus Self-Service, la única API de vuelos accesible sin umbral de tráfico, excluye explícitamente aerolíneas low-cost, American Airlines, Delta y British Airways de su catálogo de tarifas públicas. Para un producto centrado en deals oportunistas, esa omisión puede ser significativa, porque muchos de los mejores deals de flexibilidad viven precisamente en aerolíneas low-cost.

La alternativa con mejor cobertura (Travelpayouts Search API vía Aviasales/Kiwi) exige 50,000 MAU confirmados para acceso real-time afiliado. Skyscanner, que tiene la mejor experiencia de "cualquier destino, cualquier fecha" sobre datos cacheados, exige más de 100,000 visitas al mes y rechaza explícitamente a startups sin producto desarrollado.

**Pregunta abierta:** ¿La cobertura de Amadeus más el Data API cacheado de Travelpayouts produce un feed suficientemente rico para que el usuario sienta que está viendo "las mejores opciones", o la ausencia de low-cost rompe la promesa de valor?

---

## 3. Frescura del precio y gestión de expectativas

**Hallazgo de investigación.** Tanto Amadeus Inspiration Search como el Data API de Travelpayouts devuelven precios de caché, no en vivo. Amadeus actualiza sus datos cacheados diariamente a partir de búsquedas y reservas pasadas. Travelpayouts recomienda sus endpoints incluso para generar páginas estáticas. CruiseSheet, competidor en cruceros, reconoce públicamente que los precios cambian rápido y que el checkout final puede diferir.

Esto no es un defecto menor: el contrato de confianza con el usuario depende de que el precio que ve sea al menos aproximado al precio que encontrará al hacer clic. Si la diferencia es consistentemente grande, se rompe la credibilidad y aparece exposición ante PROFECO.

**Pregunta abierta:** ¿Cómo se diseña la UX para ser honesto sobre la frescura del dato ("precio visto hace X horas", "verifica tarifa actual") sin que esa honestidad frene la conversión?

**Hipótesis del fundador (sin validar):** etiquetar los precios como "desde / aproximados" con una explicación breve es suficiente para mantener confianza, siempre que el rango de diferencia sea razonable y el click-out confirme rápido.

---

## 4. Cierre de Hotellook y el hueco en hoteles por API

**Hallazgo de investigación.** Hotellook, el agregador de hoteles de Travelpayouts, cerró el 20 de octubre de 2025 y su API fue deshabilitada. Travelpayouts confirmó que por el momento ninguna otra marca hotelera dentro de su ecosistema ofrece API a partners. Esto elimina la ruta "vuelos + hoteles por Travelpayouts API" que parecía la integración más natural.

La alternativa vigente para alojamiento es el Affiliate Program de Booking.com (más de 28 millones de propiedades), pero en modo afiliado el tracking es in-session (sin cookie), lo que reduce la ventana de atribución frente a los 30 días que ofrecen Viator o GetYourGuide.

**Implicación:** el hotel queda como capa de "attach" secundaria, no como fuente de discovery técnico autónomo. Eso no destruye el modelo, pero sí limita qué tan integrada puede ser la experiencia multi-vertical en el MVP.

---

## 5. Complejidad de cruceros como primera vertical transaccional

**Hallazgo de investigación.** No existe hoy una API moderna, pública y autoservicio de cruceros comparable a Duffel para vuelos. El acceso a inventario de cruceros sigue siendo relacional: host agencies, membresías CLIA (Individual Agent Membership: US$89-139/año), mayoristas en México (International Cruises, Mundo Cruceros, Mercado Cruceros) y programas B2B con navieras. La monetización real, comisiones de 12-16% sobre tickets de US$1,200-3,000, requiere estructura de agencia, no solo un link de afiliado.

Los programas de afiliados de navieras (Royal Caribbean: ~4%, cookie ~45 días) y agregadores como GoToSea (~3%) existen y son accesibles, pero el margen es mucho menor que el modelo agencia.

**Hipótesis del fundador:** cruceros son la segunda vertical en el roadmap porque son el ejemplo más puro de "lujo accesible por flexibilidad", pero la secuencia correcta es entrar primero con afiliación, luego construir relación con host agency o mayorista mexicano, y solo después operar como agente con acceso a comisiones completas.

---

## 6. Cumplimiento: FTC, PROFECO y Registro Nacional de Turismo

**Hallazgo de investigación.** Operando en modo afiliado, las obligaciones legales son manejables pero no triviales.

- **FTC disclosure:** si el sitio monetiza con afiliación, la regulación estadounidense (relevante porque atrae usuarios de EE.UU.) exige disclosure claro y conspicuo de la relación material con cada marca. No es opcional.
- **PROFECO:** los precios cacheados o aproximados exponen al operador si el usuario percibe engaño sobre la tarifa real. Etiquetar adecuadamente los precios no es solo buena UX, es protección regulatoria.
- **Registro Nacional de Turismo (RNT/SECTUR):** la Ley General de Turismo obliga a inscribirse en el RNT dentro de 30 días naturales desde el inicio de operaciones a cualquier prestador de servicios turísticos. El encuadre legal de "solo agrego y redirijo tráfico" puede diferir del de "intermediario turístico", pero la línea no es obvia y debe validarse con un abogado antes de escalar.
- **Fase de reservas propias:** en cuanto el sitio pase a ser merchant of record, se activan IVA, CFDI, posible figura de persona moral, PCI DSS si procesa tarjetas, y toda la carga de PROFECO para intermediarios. El RFC como persona física con actividad empresarial (o RESICO si califica) es el paso fiscal mínimo desde el primer ingreso de afiliado.

---

## 7. Diferenciación defensible

**Hipótesis del fundador (sin validar).** Si la propuesta de valor funciona (curaduría + UX moderna para viajero flexible), ¿qué impide que un incumbente con inventario, presupuesto y tráfico copie la UX?

Los incumbentes tienen el inventario pero no la experiencia de descubrimiento flexible: Vacations To Go tiene deals pero UX de 2005; Google Flights tiene exploración pero no editorializa; Going y Jack's Flight Club alertan sobre deals pero están centrados en aeropuertos de EE.UU. y no construyen una marca aspiracional.

El argumento del fundador es que el foso real es la combinación de tres cosas que rara vez aparecen juntas en el mismo producto: origen local o regional relevante para el usuario, curaduría aspiracional (no solo precio), y narrativa de decisión que conecta el deal con el porqué emocional del viaje. Un incumbente puede copiar la UX, pero no puede copiar fácilmente la voz editorial ni la comunidad de viajeros flexibles que se construye alrededor de esa curaduría.

**Pregunta abierta:** ¿Es la curaduría editorial un foso real o solo una ventaja temporal que cualquier equipo con presupuesto puede replicar en semanas?

---

## 8. Monetización de afiliado vs esfuerzo de integración

**Hallazgo de investigación combinado con hipótesis del fundador.** La economía unitaria de vuelos como afiliado es pobre (~1.1-1.5% sobre tickets medios), lo que significa que el ingreso real está en cruceros y paquetes (3-16% sobre US$1,200-3,000+) y en experiencias (Viator/GetYourGuide 8%, Klook 5-6.5%).

La paradoja es que vuelos son la vertical más fácil de integrar técnicamente (Amadeus Self-Service, Travelpayouts Data API), mientras que cruceros y paquetes, donde está el margen real, son los más difíciles (requieren acreditación, host agency o estructura de agencia).

**Pregunta abierta:** ¿Conviene priorizar cruceros y experiencias desde el inicio aunque sean más difíciles de integrar, o usar vuelos como gancho de tráfico SEO y monetizar de verdad solo cuando llegue el volumen? La investigación sugiere lo segundo: vuelos como inspiración y SEO, monetización real en experiencias y cruceros.

---

## 9. Segmento premium vs software puro

**Hipótesis del fundador.** El usuario objetivo es el viajero de "lujo aspiracional" con poder adquisitivo medio-alto a alto y agenda flexible, no el viajero ultra-lujo. El segmento ultra-lujo sigue prefiriendo asesores humanos boutique y no encaja con un producto self-serve construido por una sola persona sin atención al cliente.

**Pregunta abierta:** ¿La capa de curaduría LLM es suficientemente buena para reemplazar al asesor humano en el segmento aspiracional, o el usuario de ese segmento también espera respuesta humana cuando algo sale mal?

La investigación de McKinsey corrobora que el 80% del mercado de ocio de lujo es menor de 60 años y que el segmento de "lujo aspiracional" (patrimonios entre US$100k y US$1M) es el más amplio (35% del mercado), validando que no hay que apuntar al ultra-lujo para encontrar un mercado real.

---

## Mapa de certeza / incertidumbre

| Riesgo | Tipo | Estado |
|---|---|---|
| Inventario bueno es confidencial | Hallazgo | Confirmado, no hay solución técnica directa |
| Amadeus no cubre LCC/AA/Delta/BA | Hallazgo | Confirmado, limitación documentada |
| Travelpayouts Search API exige 50k MAU | Hallazgo | Confirmado, limitación documentada |
| Hotellook cerrado desde oct 2025 | Hallazgo | Confirmado |
| Frescura del precio | Hallazgo | Confirmado, requiere decisión de UX |
| Cruceros sin API self-serve moderna | Hallazgo | Confirmado |
| FTC disclosure obligatorio | Hallazgo | Confirmado |
| RNT/SECTUR (frontera legal afiliado vs agencia) | Hallazgo | Parcialmente confirmado, requiere abogado |
| Deals públicos son suficientes para validar | Hipótesis fundador | Sin validar |
| Curaduría LLM reemplaza al asesor aspiracional | Hipótesis fundador | Sin validar |
| Diferenciación defensible por curaduría + comunidad | Hipótesis fundador | Sin validar |
| Vuelos como gancho, monetización real en cruceros/experiencias | Hipótesis fundador | Consistente con investigación, sin ejecutar |

---

## Enlaces relacionados

- [[proveedores-apis-e-inventario]] · detalla cada API por proveedor, umbrales de acceso, costos y limitaciones técnicas.
- [[modelo-de-negocio]] · la economía unitaria por vertical y el razonamiento detrás de la cascada afiliado → reservas propias.
- [[verticales-y-economia-unitaria]] · por qué cruceros y experiencias dominan el margen real vs vuelos.
- [[legal-y-fiscal-mexico]] · RNT, PROFECO, RFC, ISR y la línea que separa afiliado de agencia formal.
- [[acreditacion-y-host-agencies]] · IATA, CLIA, TIDS, host agencies y consolidadores como vías para la fase de reservas propias.
- [[panorama-competitivo]] · Vacations To Go, Going, CruiseSheet y por qué ninguno cubre el hueco completo.
- [[tesis-y-vision]] · la hipótesis central que estos riesgos ponen a prueba.

---

## Fuentes

- [[2026-06-prd-descubrimiento-viajes]]
- [[2026-06-investigacion-tesis-negocio]]
- [[2026-06-investigacion-apis-vuelos-experiencias]]
- [[2026-06-investigacion-competir-con-ota]]
