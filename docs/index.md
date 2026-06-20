# Paradise Plan

> **Tipo:** indice/MOC  ·  **Parte de:** [[index]]

Motor de descubrimiento de viajes premium para viajeros flexibles. La tesis: quien junte inventario de lujo accesible a traves de verticales y lo presente con curaduria y buena UX gana al viajero que dice "quiero el mejor viaje, no se a donde ni cuando".

---

## Que es este vault

Este vault sigue el metodo Karpathy de LLM-Wiki: las notas de investigacion cruda e inmutable viven en `sources/`, la wiki compilada y estructurada vive en `wiki/`, y este archivo es el mapa que conecta todo. Las paginas wiki son atomicas (una idea por pagina) y se enlazan entre si con wikilinks. Las fuentes originales no se editan; solo se sintetizan en la wiki.

---

## La idea

- [[la-idea-de-negocio]] - El documento narrativo de la idea: el problema, el insight, la oportunidad y por que podria ser un gran negocio. Empieza aqui si quieres entender el porque antes que el como. Pensado tambien para compartir con posibles socios.

---

## Mapa de contenido

### Estrategia y producto

- [[tesis-y-vision]] - La tesis central del producto (lujo accesible por flexibilidad), el modelo mental anti-VTG multi-vertical y el reencuadre estrategico "discovery primero, booking despues".
- [[usuario-objetivo]] - Perfil del viajero flexible con poder adquisitivo medio-alto a alto (DINK, solteros, nomadas, jubilados activos) y la validacion de mercado que respalda el segmento.
- [[modelo-de-negocio]] - Estrategia por fases: afiliado puro hoy (display y redirect, sin riesgo operativo), merchant of record cuando el trafico lo justifique. Incluye la mecanica completa de tracking, atribucion y umbrales de pago.
- [[roadmap]] - Cortes secuenciales: feed de vuelos flexibles (semanas 1-4), curaduria y LLM con actividades y hoteles (semanas 4-8), cruceros (mes 3 en adelante) y horizonte de reservas propias.

### Mercado y competencia

- [[panorama-competitivo]] - Mapa de actores en deals de viaje flexibles (Going, Jack's Flight Club, Google Flights, Vacations To Go, CruiseSheet) y el hueco real: curaduria aspiracional con origen local relevante, algo que ningun actor hace junto hoy.
- [[verticales-y-economia-unitaria]] - Tabla completa de comisiones por vertical y la prioridad estrategica cruceros/paquetes > experiencias > hoteles > vuelos.

### Inventario y tecnologia

- [[proveedores-apis-e-inventario]] - Catalogo de proveedores y APIs por fase de acceso, con umbrales exactos, modelos de comision y la solucion para el patron de destino abierto y fechas flexibles.
- [[arquitectura-mvp]] - Arquitectura tecnica del MVP en Next.js: cuatro capas (sourcing, scoring, enriquecimiento, salida) sobre un modelo de datos centrado en la "oportunidad curada", con ISR y Route Handlers como proxy server-side.
- [[prototipo-drift]] - Spec y brief del prototipo interactivo "Drift": artifact React autocontenido con tres modos de descubrimiento (conversacional, filtros por vibe y feed de deals) y cuatro pantallas clave.

### Operacion legal y fiscal

- [[legal-y-fiscal-mexico]] - Marco legal para operar desde Mexico: que puedes hacer como afiliado sin ser agencia, donde se cruza la linea hacia prestador turistico formal, y como manejar RFC, ISR sobre comisiones del exterior y cobro en USD.
- [[acreditacion-y-host-agencies]] - Rutas para pasar de afiliado a reservas propias: IATA, TIDS, CLIA para cruceros, consolidadores aereos, host agencies (Fora en Mexico desde mayo 2025) y Duffel Managed Content como alternativa sin acreditacion propia.
- [[riesgos-y-preguntas-abiertas]] - Consolidacion de riesgos confirmados por investigacion (acceso a inventario, brecha de Amadeus, cierre de Hotellook) e hipotesis del fundador sin validar, organizados por tema.

### Referencia

- [[glosario]] - Referencia alfabetica de terminos tecnicos del dominio de viajes, distribucion aerea y operacion como afiliado o agencia.

---

## Empieza aqui

Si eres nuevo en el proyecto, lee en este orden:

1. [[tesis-y-vision]] - Entiende la apuesta central y por que "discovery primero, booking despues" no es un slogan sino una restriccion tecnica real.
2. [[usuario-objetivo]] - Clarifica para quien se construye exactamente y quien queda fuera del alcance inicial.
3. [[modelo-de-negocio]] - Entiende como fluye el dinero en fase afiliado y que implica la transicion a merchant of record.
4. [[verticales-y-economia-unitaria]] - Mira los numeros concretos de comision y la prioridad estrategica entre verticales.
5. [[roadmap]] - Ubicate en el tiempo: que existe hoy, que viene en las proximas semanas y que es horizonte largo.

---

## Fuentes crudas

Las siguientes notas son el material de investigacion original. Son inmutables; no se editan, solo se consultan.

- [[2026-06-investigacion-tesis-negocio]] - Investigacion de tesis, vision y modelo de negocio inicial.
- [[2026-06-investigacion-competir-con-ota]] - Investigacion sobre como competir con OTAs y el panorama competitivo.
- [[2026-06-investigacion-apis-vuelos-experiencias]] - Investigacion de APIs de vuelos, hoteles, experiencias y cruceros.
- [[2026-06-prd-descubrimiento-viajes]] - PRD de descubrimiento de viajes con requerimientos de producto.
- [[2026-06-prompt-interfaz-drift]] - Prompt e instrucciones para el prototipo interactivo Drift.

---

## Estado y proximo paso

**Fecha de ultima actualizacion:** 2026-06-20

El vault esta completo con la investigacion de la fase de descubrimiento. Las 13 paginas wiki cubren estrategia, mercado, tecnologia, operacion y diseno.

**Proximo paso inmediato:** disenar y construir la arquitectura del Corte 1 en Next.js, implementando el feed de vuelos flexibles con Amadeus Flight Inspiration Search API y Travelpayouts Data API como fuentes, Route Handlers como proxy server-side y ISR para el modelo de datos cacheado. Ver [[arquitectura-mvp]] y [[roadmap]] para la especificacion detallada.
