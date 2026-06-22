# Contexto: el grafo de conocimiento frente a la nota canónica

> **Tipo:** contexto / reconciliación · **Parte de:** [[index]]
> **Fuente canónica:** [[2026-06-nota-voz-calle-malaga]] (nota de voz del fundador).
> **Grafo:** `graphify-out/GRAPH_REPORT.md` — 1224 nodos · 1564 aristas · 115 comunidades.
> **Frescura:** grafo construido desde commit `969468f4`; HEAD actual `b354f95`
> (ligeramente desactualizado — correr `graphify update .` para refrescar).

Este documento ancla el grafo a la **intención cruda del fundador**. La nota de
voz es la semilla; el grafo es donde esa semilla ya creció. Aquí se mapea
qué partes del grafo **encarnan** la nota, cuáles **ya responden** sus dudas
abiertas, y dónde hay **drift** (desviación) respecto al canon.

---

## TL;DR

El grafo no contradice la nota: es una **versión más evolucionada de la misma
visión**. La tesis documentada ("lujo accesible por flexibilidad: *quiero el
mejor viaje, no sé adónde ni cuándo*") es una reescritura casi literal de la
nota. Las tres direcciones de producto de la nota ya existen como el prototipo
**Drift**. Las dos dudas abiertas de la nota **ya están resueltas en la
investigación** del grafo. El único drift real: **la app construida sigue siendo
el wizard de 3 pasos que la nota critica explícitamente**.

---

## 1. La nota ya es el ADN del grafo

| Elemento de la nota canónica | Dónde vive en el grafo | Estado |
|---|---|---|
| "Planear es difícil; las OTA están casadas con fecha" | God node `La idea de negocio`; comunidad *Travel Pain-Point Research*; `tesis-y-vision` | ✅ Canon documentado |
| "Entrar con vibe+días+presupuesto, sin destino" | `Destino Abierto + Fechas Flexibles + Precio Tope`; `Discovery primero, booking después` | ✅ Núcleo de la tesis |
| Frase "no sé adónde ni cuándo" | `tesis-y-vision` la cita textual; landing de `prototipo-drift` la usa de copy | ✅ Literal |
| "Conectarme con diversos proveedores" | God node `Proveedores, APIs e Inventario`; comunidades *Amadeus / Affiliate Inventory / Flight Content APIs* | ✅ Investigado a fondo |

## 2. Las tres direcciones de la nota = el prototipo **Drift**

La nota propone tres formas de entrada. Las tres ya están especificadas en
`docs/wiki/prototipo-drift.md` (comunidad *Prototipo Drift*, cohesión 0.22):

| Dirección en la nota | Modo en Drift |
|---|---|
| "Skill conversacional de IA" / "la misma experiencia pero conversacional" | **Modo conversacional "Sorpréndeme"** (entrada principal del landing) |
| "Tinder: ¿playa o montaña?, ¿caro o barato en Tulum?" | **Filtros por vibe / presupuesto / días** (reemplazan destino+fecha) |
| "Deals específicos según el algoritmo" | **Feed de deals de flexibilidad** (estilo 90-Day Ticker de Vacations To Go) |
| "Perfil (PIEF) de filtros de lo que me gusta" | Capa de filtros + nivel de flexibilidad (el campo más diferenciador) |

> **Lectura:** la nota describe la *intuición*; Drift es esa intuición ya
> ordenada en producto. Drift debe tratarse como la **materialización fiel** del
> canon, no como una idea paralela.

## 3. Las dudas abiertas de la nota — ya respondidas por el grafo

**Duda A — "no sé cómo filtrar por precio/tipo sin pedir país/estilo":**
Resuelta a nivel de patrón: **Destino Abierto + Fechas Flexibles + Precio Tope**,
con `Datos cacheados (no precio en vivo)`. Es precisamente el "match a nivel de
trip" que pide la nota.

> ⚠️ **Realidad de APIs (2026-06-21):** la única fuente con acceso real hoy es
> **Travelpayouts** (`v2/prices/latest?origin=MEX` → destinos más baratos vistos
> desde un origen), ya cableada en `convex/travelpayouts.ts`. La comunidad
> *Amadeus Flight Sourcing APIs* del grafo (`Flight Inspiration Search`, `Flight
> Cheapest Date Search`) describe el plan ideal pero **Amadeus NO está operativo**.
> El sourcing de descubrimiento se construye sobre Travelpayouts; la búsqueda por
> ruta de Travelpayouts queda como paso "confirmar tarifa" en el detalle.

**Duda B — "¿monetizar sin scraping ni publicidad?":**
Resuelta, y en contra del scraping (que la propia nota rechaza). El grafo elige
el **modelo afiliado**: `El tráfico es la llave al inventario`, `CTA de afiliado
(Reservar en proveedor)`, comunidades *Affiliate / GDS Economics*, *Booking.com
Affiliate*, *Travelpayouts marker/SubID*, con toda la capa fiscal mexicana
(*CFDI*, *RESICO/ISR*, *Merchant of record*). No hay checkout propio en fase 1.

> Conviene actualizar [[riesgos-y-preguntas-abiertas]] para marcar A y B como
> **cerradas por investigación**, citando esta nota como su origen.

## 4. El drift real: lo construido vs. el canon

La nota es tajante: *"el wizard funciona como idea, pero es muy complicado para
**iniciar** una experiencia."* Sin embargo, **la app construida sigue siendo un
wizard de 3 pasos**:

- Comunidades *App Shell & Screen Components*, *Wizard Step 1 Form Fields*,
  *3-Step Preference Wizard*, *Built Mobile UI*, y el god node `usePlanner()`
  (15 aristas) modelan un flujo Landing → Wizard Step 1/2/3 → Results → Detail.
- El grafo ya nombró esta tensión: existe una comunidad ***Prototipo Drift*** y
  una nota `prototipo-drift` *separadas* del flujo construido — señal de que el
  **diseño objetivo (Drift) y la implementación (wizard) divergieron**.

**Conclusión de canon:** según la nota, la entrada por wizard es deuda heredada,
no el destino. El siguiente movimiento alineado con el fundador es **mover la
entrada del app del wizard al modo "Sorpréndeme"/feed de Drift** — o, como
mínimo, ofrecer Drift como entrada por defecto y degradar el wizard a "modo
avanzado".

## 5. Lo que la nota pide y el grafo aún no contiene

La nota cierra con un encargo explícito que **no** está resuelto en el grafo:

1. **Proponer una experiencia distinta** a las ya planteadas (wizard/perfil/swipe/skill).
2. **Criticar los puntos débiles** de la idea.

Esto es trabajo nuevo, no documentación existente. Queda como el siguiente
entregable pendiente (ver [[riesgos-y-preguntas-abiertas]] para enganchar la crítica).

---

## Enlaces relacionados

- [[2026-06-nota-voz-calle-malaga]] — la fuente canónica de este contexto.
- [[tesis-y-vision]] — reescritura formal de la nota; misma frase núcleo.
- [[prototipo-drift]] — las tres direcciones de la nota, ya hechas producto.
- [[proveedores-apis-e-inventario]] — responde la duda A (APIs / destino abierto).
- [[modelo-de-negocio]] — responde la duda B (afiliado, no scraping).
- [[arquitectura-mvp]] / [[roadmap]] — dónde aterriza el salto wizard → Drift.
- [[riesgos-y-preguntas-abiertas]] — dónde registrar el encargo pendiente del fundador.
