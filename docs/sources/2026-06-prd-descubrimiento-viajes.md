# PRD / Documento de Visión

## Proyecto: motor de descubrimiento de experiencias premium por flexibilidad

**Autor:** David
**Versión:** 0.1 (borrador inicial)
**Estado:** exploración / pre-MVP
**Última actualización:** junio 2026

---

## 1. Resumen en una frase

Un motor de descubrimiento de **lujo accesible por flexibilidad**: para viajeros con agenda libre que dicen "quiero el mejor viaje, no sé adónde ni cuándo", agregando y curando las mejores experiencias premium del mundo (cruceros, vuelo+hotel, actividades, paquetes) en un solo lugar, con una interfaz moderna y una capa de descubrimiento que los incumbentes no tienen.

El modelo mental: **el "90-Day Ticker" de Vacations To Go, pero multi-vertical y con buena UX.**

---

## 2. El problema

Hoy, el viajero flexible que quiere un gran viaje a buen precio tiene que:

- Saber de antemano qué tipo de experiencia quiere (cruceros vs vuelos vs tours están en sitios distintos).
- Tolerar interfaces obsoletas. Vacations To Go, líder en cruceros de descuento, tiene un inventario enorme pero un buscador con diseño de los 2000.
- Hacer el trabajo de curaduría él mismo: cruzar deals de vuelo con hotel y con "¿qué hago ahí?".
- Registrarse en muros de email solo para ver precios.

No existe un lugar que diga: "eres flexible en fechas y destino, aquí están las mejores experiencias del mundo ahora mismo, ya curadas y listas para soñar".

---

## 3. El usuario objetivo

**Perfil primario:** viajero con agenda flexible y poder adquisitivo medio-alto a alto, típicamente sin hijos o sin ataduras de calendario (parejas DINK, solteros con ingresos, nómadas, jubilados activos).

**Su frase clave:** "Quiero viajar. No sé adónde y no sé cuándo. Muéstrame el mejor viaje."

**Lo que valora:**
- Descubrimiento e inspiración por encima de búsqueda dirigida.
- "Lujo accesible": la mejor experiencia posible aprovechando su flexibilidad para conseguir precio.
- Cero fricción y una interfaz que se sienta moderna y confiable.

**Quién NO es el usuario (al inicio):** el viajero ultra-lujo con fechas y destino fijos. Ese segmento sigue prefiriendo un asesor humano y no encaja con un producto de software puro sin atención al cliente.

---

## 4. La tesis y el diferenciador

**Tesis central:** la flexibilidad del usuario es la llave que desbloquea inventario premium a precio bajo (cabinas y asientos que el proveedor necesita llenar). Quien junte ese inventario across-verticales y lo presente con curaduría y buena UX, gana al viajero flexible.

**Diferenciador (el "anti-VTG"):**
1. **Multi-vertical.** No solo cruceros: vuelo+hotel, experiencias/actividades y paquetes en un mismo lugar.
2. **UX moderna.** Feed de descubrimiento, filtros por "vibe"/presupuesto/días (no por destino), y modo conversacional "sorpréndeme".
3. **Curaduría.** Cada deal crudo se enriquece con el "¿y qué hago ahí?": narrativa, actividades sugeridas, por qué vale la pena. Aquí es donde un LLM aporta valor real.

**Lo que NO es el diferenciador:** tener el precio más barato del mercado. Ese es el foso de 40 años de VTG y no es replicable el día 1.

---

## 5. La barrera real del negocio (lo honesto)

Los mejores deals de flexibilidad NO salen de una API pública. Vacations To Go construyó su ventaja convenciendo a las navieras de rematar cabinas sin vender a una "lista de clientes confidencial", precisamente para no socavar la tarifa completa que venden las agencias tradicionales. Esos precios están detrás de un muro de registro a propósito, la disponibilidad promedio es de menos de 7 días, y muchos se agotan en horas.

**Implicación estratégica:** no se puede entrar compitiendo por el inventario confidencial. Se entra agregando y curando deals que ya son públicamente visibles (vía afiliados), construyendo tráfico y audiencia, y solo entonces ganando acceso a inventario negociado. **El tráfico es la llave al inventario bueno, no al revés.**

---

## 6. Modelo de negocio

**Fase afiliado (inicio):** monetización por comisión de afiliado, sin tomar pagos ni reservar dentro del sitio. Cero riesgo operativo, cero acreditación, cero atención al cliente.

Fuentes de comisión por vertical:
- **Vuelos / vuelo+hotel:** Travelpayouts (Data API + afiliado), Booking afiliado. (Amadeus self-service quedó descontinuado en jun 2026; solo enterprise bajo contrato.)
- **Experiencias / actividades:** GetYourGuide afiliado, Viator (red Tripadvisor), Klook, Tiqets.
- **Cruceros:** programa de afiliados de naviera o agregador / operadora mexicana (deals públicos + comisión).

**Comisiones de referencia del sector:** hoteles 10-25%; vuelos bajos (1-5% o gancho); **paquetes y cruceros pueden alcanzar ~15%**, que es donde está el margen real.

**Fase reservas propias (futuro, con volumen):** integrar una API moderna tipo Duffel (sin acreditación, pago por uso) para vuelos, y acreditación ligera CLIA para cruceros. Migrar de "redirijo y cobro" a "reservan dentro de mi sitio" cuando el tráfico lo justifique.

---

## 7. Roadmap por cortes

### Corte 1 — Feed de deals de flexibilidad sobre vuelos (semanas 1-4)
- Empezar por vuelos, no por cruceros: la data es la más fácil de obtener gratis/barato y sin acreditación.
- Mecánica núcleo: origen fijo (ej. CDMX) → "cualquier destino, próximos N días, bajo cierto precio".
- Objetivo: validar que el viajero flexible muerde el anzuelo de "no sé adónde, muéstrame lo mejor barato".
- Entregable: algo que David mismo usaría.

### Corte 2 — Capa de curaduría / IA (semanas 4-8)
- Agrupar deals por "vibe" y enriquecer cada uno con el "¿y qué hago ahí?".
- Un deal de vuelo a Lisboa se convierte en una mini-experiencia curada (narrativa + actividades sugeridas).
- Aquí entra el LLM para generar contenido a partir del deal crudo.

### Corte 3 — Segunda vertical: cruceros (mes 3+)
- Sumar cruceros como ejemplo perfecto de "lujo accesible por flexibilidad".
- Afiliación a operadora mexicana o host agency para la comisión.
- Empezar a unificar verticales bajo el mismo motor de descubrimiento.

### Más adelante (no ahora)
- Experiencias/actividades como tercera vertical.
- Paquetes completos armados (dynamic packaging: vuelo + hotel + actividad).
- Reservas propias vía Duffel.
- Acreditación CLIA / TIDS.

---

## 8. Definición de éxito

**A 3 meses (side project):** un producto funcional que David mismo usaría para planear un viaje real. No se busca facturación ni usuarios todavía; se busca validar la tesis y tener algo vivo.

**A mediano plazo:** tráfico recurrente de viajeros flexibles + primeras comisiones de afiliado que demuestren que el motor mueve reservas.

**A largo plazo:** convertirse en el lugar de referencia para descubrir experiencias premium por flexibilidad, con acceso a inventario negociado y reservas propias.

---

## 9. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Producto inicial | Motor de descubrimiento multi-vertical, no OTA general |
| Involucramiento | Solo software, cero atención al cliente |
| Meta | Side project → proyecto completo |
| Interfaz | Mezcla: IA conversacional + filtros por vibe + feed de descubrimiento |
| Qué pasa al encontrar algo | Empieza afiliado → luego reservas propias |
| Mercado | Global, enfoque premium/flexible |
| Verticales | Todas eventualmente; empezar por vuelos |
| Diferenciador | Curaduría + UX (no precio) |
| Manos | Construido por David solo |
| Stack | Next.js |
| Éxito a 3 meses | Algo que David mismo usaría |

---

## 10. Riesgos y preguntas abiertas

- **Acceso a inventario bueno.** El mejor inventario es confidencial. ¿La versión "solo deals públicos" es suficientemente atractiva para validar? (Hipótesis: sí, si la curaduría y UX son fuertes.)
- **Segmento premium vs software puro.** El lujo alto quiere asesor humano. ¿La IA cura "suficientemente bien" para reemplazarlo, o conviene apuntar un escalón debajo del lujo puro?
- **Frescura de datos.** Los deals de flexibilidad se agotan en horas. ¿Cómo se maneja la actualización y el "ya no disponible" sin frustrar al usuario?
- **Monetización afiliado vs esfuerzo.** Las comisiones de afiliado de vuelos son bajas. ¿El valor está en cruceros/paquetes desde el principio aunque sean más difíciles de integrar?
- **Diferenciación defensible.** Si la idea funciona, ¿qué impide que un incumbente con inventario copie la UX? (Hipótesis: la curaduría y la comunidad de viajeros flexibles como foso.)

---

## 11. Próximo paso inmediato

Definir la **arquitectura técnica del Corte 1 en Next.js**: qué API de vuelos usar, cómo estructurar el "feed de flexibilidad", el flujo de afiliación/comisión y un esquema de datos para empezar a codear.
