# Tesis y Vision

> **Tipo:** concepto  ·  **Parte de:** [[index]]

## Resumen en una frase

Un motor de descubrimiento de **lujo accesible por flexibilidad**: para viajeros con agenda libre que dicen "quiero el mejor viaje, no se adonde ni cuando", agregando y curando las mejores experiencias premium del mundo en un solo lugar, con una interfaz moderna y una capa de descubrimiento que los incumbentes no tienen.

## El modelo mental

El referente es el **"90-Day Ticker" de Vacations To Go**: un listado en tiempo real de cruceros de ultimo minuto donde la disponibilidad promedio es menor a siete dias y muchos deals se agotan en horas. Ese modelo funciona, pero tiene 40 anos de UX encima y cubre solo cruceros.

La vision de Paradise Plan es ser ese mismo concepto pero **multi-vertical y con buena UX**. El "anti-VTG" se define por tres diferenciadores:

1. **Multi-vertical.** No solo cruceros: vuelos, vuelo+hotel, experiencias/actividades y paquetes en un mismo motor de descubrimiento.
2. **UX moderna.** Feed de descubrimiento, filtros por "vibe"/presupuesto/dias (no por destino fijo), y modo conversacional "sorprendeme".
3. **Curaduria.** Cada deal crudo se enriquece con el "y que hago ahi": narrativa, actividades sugeridas, por que vale la pena. Ese enriquecimiento es donde un LLM aporta valor real y donde nadie mas lo esta haciendo todavia.

Lo que **no** es el diferenciador: tener el precio mas barato del mercado. Ese es el foso de cuatro decadas de Vacations To Go y no es replicable el dia 1.

## La tesis central

La flexibilidad del usuario es la llave que desbloquea inventario premium a precio bajo: cabinas y asientos que el proveedor necesita llenar antes de salir. Quien junte ese inventario a traves de verticales y lo presente con curaduria y buena UX gana al viajero flexible.

El mercado valida la tesis por tres angulos:

- **Lujo aspiracional.** McKinsey encontro que 35% del mercado de lujo turistico esta compuesto por viajeros con patrimonios de entre 100,000 y 1 millon de dolares, y que 80% del segmento de ocio de lujo tiene menos de 60 anos. Estos viajeros no compran lujo en todo el viaje: eligen componentes premium concretos y exigen valor por su dinero.
- **Gasto en experiencias.** McKinsey estima que el gasto global en experiencias de destino representa entre 1.1 y 1.3 billones de dolares, con actividades turisticas estructuradas en el rango de 250,000 a 310,000 millones de dolares anuales. Los viajeros jovenes protegen su presupuesto para experiencias incluso cuando recortan en vuelos o comida.
- **Habito digital y flexibilidad instalada.** Phocuswright reporto que 7 de cada 10 viajeros priorizan mas que antes la flexibilidad en la reserva, y el mercado global de bookings online llego a 1.07 billones de dolares en 2025.

El segmento que **no** es el objetivo inicial es el ultra-lujo con fechas y destino fijos. Ese segmento sigue prefiriendo boutique travel agents y no encaja con un producto self-serve construido por un solo fundador.

## El reencuadre estrategico: discovery primero, booking despues

La investigacion produjo un reencuadre importante. El producto no debe lanzarse como "agencia de viajes de lujo de ultimo minuto" ni como "metabuscador generalista". La forma correcta es:

> **Motor editorializado de oportunidades aspiracionales para viajeros flexibles**, con monetizacion afiliada simple y una capa de curaduria fuerte.

Este reencuadre no es estetico: viene de una restriccion tecnica concreta. Las APIs de busqueda en tiempo real con afiliacion full-funnel (Aviasales Search API, Kiwi API dentro de Travelpayouts) exigen proyectos con al menos 50,000 MAU. Sin esa escala, la entrada correcta es un modelo de discovery con datos cacheados (Amadeus Inspiration Search, Aviasales Data API) y salidas de afiliacion white-label. Primero se construye habito y trafico; luego se negocia acceso a herramientas mas potentes.

El [[modelo-de-negocio]] sigue esa logica: fase afiliado primero, reservas propias despues.

## La barrera real del negocio

Los mejores deals de flexibilidad no salen de una API publica. Vacations To Go construyo su ventaja convenciendo a las navieras de rematar cabinas sin vender a una lista de clientes confidencial, precisamente para no socavar la tarifa completa de las agencias tradicionales. Esos precios estan detras de un muro de registro a proposito.

La implicacion estrategica es directa: **no se puede entrar compitiendo por el inventario confidencial desde el dia 1. Se entra agregando y curando deals que ya son publicamente visibles (via afiliados), construyendo trafico y audiencia, y solo entonces ganando acceso a inventario negociado.**

El trafico es la llave al inventario bueno, no al reves.

Este mecanismo explica por que el hueco competitivo verdadero no esta en cobertura bruta de precios, sino en combinar tres cosas que hoy rara vez aparecen juntas: origen local o regional relevante para el usuario, curaduria aspiracional en vez de mero precio, y una narrativa de decision que conecte el deal con el porque emocional del viaje.

## La vision a largo plazo

- **A 3 meses (side project):** un producto funcional que el propio fundador usaria para planear un viaje real. No se busca facturacion todavia; se busca validar la tesis y tener algo vivo.
- **A mediano plazo:** trafico recurrente de viajeros flexibles y primeras comisiones de afiliado que demuestren que el motor mueve reservas.
- **A largo plazo:** convertirse en el lugar de referencia para descubrir experiencias premium por flexibilidad, con acceso a inventario negociado y reservas propias dentro del sitio.

## El perfil del usuario que sustenta esta vision

El [[usuario-objetivo]] es el viajero con agenda flexible y poder adquisitivo medio-alto a alto, tipicamente sin ataduras de calendario (parejas DINK, solteros con ingresos, nomadas, jubilados activos). Su frase clave: "Quiero viajar. No se adonde y no se cuando. Muestrame el mejor viaje."

## Enlaces relacionados

- [[usuario-objetivo]] - define el perfil primario y el segmento que no es el objetivo, base de la tesis de "lujo accesible"
- [[modelo-de-negocio]] - la cascada afiliado-a-reservas-propias que operacionaliza el principio "trafico primero, inventario despues"
- [[panorama-competitivo]] - analiza a VTG, Going, Google Flights y CruiseSheet como referentes del hueco que esta tesis busca llenar
- [[verticales-y-economia-unitaria]] - detalla por que vuelos es la primera vertical y cruceros la segunda pese a ser el modelo mental principal
- [[proveedores-apis-e-inventario]] - explica la restriccion tecnica (50,000 MAU) que convirtio "discovery primero" en la arquitectura correcta
- [[arquitectura-mvp]] - la implementacion concreta del reencuadre: publisher transaccional con alma de producto, no OTA clasica
- [[riesgos-y-preguntas-abiertas]] - el inventario confidencial, la frescura de datos y la diferenciacion defensible como riesgos derivados de esta tesis

## Fuentes

- [[2026-06-prd-descubrimiento-viajes]]
- [[2026-06-investigacion-tesis-negocio]]
