# Nota de voz — Calle Málaga 2 (canónica)

> **Tipo:** fuente · nota de voz del fundador · **Parte de:** [[index]]
> **Estado:** CANÓNICA. Esta nota es la intención cruda del fundador. Cuando un
> documento del proyecto contradiga esta nota, gana la nota (o se documenta
> explícitamente la decisión de divergir).
> **Origen:** audio `Calle Málaga 2.m4a` (10:39), transcrito con Whisper local
> y reconstruido por criterio a partir de dos pasadas de ASR.
> **Fecha:** 2026-06-21.

---

## Reconstrucción (español, primera persona)

Ok, bueno, pues la idea es la siguiente.

El proyecto que queremos hacer: el *pain point* es que **la planeación de viaje es muy difícil**. Quiero hacer un proyecto basado en algo tipo **Airbnb**, donde podamos hacer la planeación de un viaje mucho más fácil — y esto sería un proyecto de *startup*.

Es una pequeña prueba de concepto en donde hago un **wizard** donde el usuario empieza a llenar las preferencias de los viajes que le gustan. Creo que no es lo más óptimo, realmente.

Lo que pasa es que ahorita los sitios están muy **casados con las fechas**. Digamos que entro a **Expedia** y digo "quiero viajar en tal fecha a tal lugar" y me encuentras experiencias, vuelos, lo que sea. Yo quiero darle una vuelta a eso.

Quiero que una persona pueda decir: "me gusta viajar, pero no sé a dónde ir, no sé cuándo, solo sé que quiero ir 4 días, y a lo mejor tengo un presupuesto de tanto para el viaje completo." Esa es más o menos la idea. Para lograrlo habría que conectarse con **diversos proveedores de viajes** y armar una experiencia rica.

El wizard funciona como idea, pero creo que es muy complicado para *iniciar* una experiencia o una planeación de viaje. Lo que estaba planeando en paralelo es una experiencia donde conviven **dos conceptos**:

1. Un **perfil de vibe** — filtros reutilizables de lo que me gusta: "me gusta la playa", "que esté chill", "algo más de ejercicio"; "que los viajes sean locales" o "globales, en otro continente", etc. (En la wiki del proyecto esto es el *perfil de vibe / filtros* de Drift.)
2. Ese perfil se aplica **a nivel global** (descubrimiento abierto) o **dentro de un proyecto/viaje concreto** — el sistema mantiene el perfil y te hace una **propuesta de viaje** basada en lo que el **algoritmo** sabe que te gusta.

Me gustaría ver si hay **otras formas de resolverlo**. Una sería una especie de **Tinder**, donde al usuario le empiezas a preguntar: "¿playa o montaña?", "en Tulum, pagar 10 mil pesos por tal cosa, ¿caro o barato?". Así vas **personalizando el algoritmo**, y de repente ya te da **deals específicos**. Ese es un producto posible.

Otro producto posible — donde ya no veo tanto el negocio, porque sería complicado sacarle dinero, pero sí se puede — sería un **skill de inteligencia artificial**: la misma experiencia pero más **conversacional**, un **Claude Skill** estructurado. Creo que es la forma más fácil de **validar la idea** ahorita. (Es el modo conversacional "Sorpréndeme" de Drift.)

Temas pendientes: no sé cómo funcionan las **APIs de los proveedores** ni cómo se hace este **match de viajes a nivel de *trip*** — filtrando por **precio** y **tipo de experiencia** con **destino abierto**, sin tener que decir país ni estilo de entrada. Creo que es una **limitación real**, pero interesante. (El proyecto ya la resolvió: patrón *Destino Abierto + Fechas Flexibles + Precio Tope* sobre **Travelpayouts** `v2/prices/latest?origin=MEX` — la única API con acceso hoy. Amadeus **retiró su API pública Self-Service** en jun 2026 — solo queda enterprise bajo contrato, así que está fuera del MVP.)

No sé si se puede hacer esta experiencia **sin generar ingresos** al principio y monetizar después — hacer **scraping** para alimentar un **buscador**, o ganar por **publicidad**. No me gustaría que fuera por ahí: con las IA, la gente ya no entra a los sitios y el scraping complica todo. Lo dejo como **duda abierta**.

La otra cosa: quiero que me **propongas todas las ideas** para resolver este problema. Tengo **bien claro el problema**, pero no tan clara la **solución correcta**. Entonces: (1) **proponme una experiencia distinta** a la que ya planteé, y (2) **señálame los puntos débiles de mi idea**.

---

## Núcleo canónico (lo que NO se negocia)

- **Problema:** planear un viaje es difícil; las OTA están casadas con destino + fecha.
- **Inversión del flujo:** el usuario entra con *vibe + días + presupuesto*, NO con destino.
- **El fundador desconfía del wizard** como punto de entrada ("muy complicado para iniciar").
- **Tres direcciones de entrada a explorar:** wizard (heredado), perfil+filtros, swipe tipo Tinder, y skill conversacional de IA.
- **Dudas abiertas reales:** (a) APIs que filtren por precio/tipo sin pedir país; (b) monetizar sin scraping ni publicidad agresiva.
- **Encargo al equipo:** proponer una experiencia alternativa + criticar los puntos débiles.

## Notas de transcripción

`minobia`→Airbnb · `estarko`→startup · `expedida`→Expedia · `Tolum`→Tulum ·
`asquil`/`sequestrum de cloud`→Claude Skill · `gorismo/anualismo`→algoritmo ·
`scrap ingresos`→scraping · `tindas`→Tinder · `type check`/`pipe check`→match
de *trip* (destino abierto) · `PIEF`/`fibras`→perfil de vibe / filtros
(resuelto contra la wiki: Drift) · `puntos de víles de mi vida`→puntos débiles
de mi idea.
