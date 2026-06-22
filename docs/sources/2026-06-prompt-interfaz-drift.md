<objective>
Diseña y construye un prototipo visual interactivo de alta fidelidad para una aplicación web de descubrimiento de viajes premium. El producto se llama (placeholder) "Drift" y su tesis es "lujo accesible por flexibilidad": el usuario no llega con destino ni fecha, llega con ganas de viajar, y la app le genera las mejores experiencias premium del mundo (cruceros, vuelo+hotel, actividades, paquetes) cuando hay un deal increíble.

El objetivo de esta tarea es producir una interfaz que el propio fundador usaría: algo que haga tangible la idea de negocio para validarla, mostrarla a posibles socios y servir de base de diseño para el MVP real. No es un ejercicio de crítica de diseño; es generación de producto desde cero.

Genera el resultado como un artifact de React autocontenido (un solo archivo, Tailwind para estilos, sin dependencias externas de datos: usa datos de ejemplo realistas hardcodeados). Si tienes el plugin Frontend Design disponible, úsalo para lograr un diseño distintivo que evite la estética genérica de IA.
</objective>

<context>
Este producto es el equivalente a "Vacations To Go pero multi-vertical y con buena UX". Vacations To Go es líder en cruceros de descuento de último minuto (su "90-Day Ticker") pero tiene una interfaz obsoleta. La oportunidad es tomar esa misma lógica de "deals increíbles si eres flexible" y aplicarla a todas las experiencias premium, con una interfaz moderna.

Usuario objetivo: viajero con agenda flexible y poder adquisitivo medio-alto a alto, típicamente sin hijos ni ataduras de calendario (parejas DINK, solteros con ingresos, nómadas, jubilados activos). Su frase clave: "Quiero viajar. No sé adónde ni cuándo. Muéstrame el mejor viaje." Valora el descubrimiento y la inspiración por encima de la búsqueda dirigida, el "lujo accesible" (la mejor experiencia posible aprovechando su flexibilidad para conseguir precio), y una interfaz que se sienta moderna y confiable.

Modelo de negocio en la fase actual: afiliado. La app NO toma pagos ni reserva internamente; redirige al proveedor (aerolínea, naviera, plataforma de experiencias) con un link de afiliado y cobra comisión. Esto importa para el diseño: los CTA finales son "Ver oferta" / "Reservar en [proveedor]", no un checkout propio. Los precios deben mostrarse como "desde" / aproximados, porque provienen de datos cacheados de inspiración (Travelpayouts Data API; Amadeus Flight Inspiration quedó descontinuado en jun 2026) y se confirman en el sitio del proveedor.

Verticales a representar: cruceros y paquetes (los mejor pagados, deben sentirse protagonistas), experiencias/actividades, hoteles, y vuelos (estos últimos funcionan como gancho de inspiración, no como producto estrella).

Mercado: global, con sensibilidad premium. Idioma de la interfaz: español (es el mercado inicial del fundador, en México), con tono aspiracional pero no acartonado.
</context>

<requirements>
La interfaz debe combinar TRES modos de descubrimiento, porque el usuario decidió que quiere una mezcla:

1. Modo conversacional "Sorpréndeme": una entrada tipo prompt donde el usuario escribe o elige su estado de ánimo de viaje ("quiero desconectar", "algo de fiesta", "naturaleza", "lujo total") y un presupuesto y días disponibles aproximados, y la app responde con experiencias curadas. No necesitas IA real; simula la respuesta con datos de ejemplo.

2. Filtros por "vibe" / presupuesto / días disponibles en lugar de los filtros tradicionales de destino y fecha. El usuario NO parte de un destino. Los filtros deben incluir: presupuesto máximo (slider), días disponibles (rango), tipo de experiencia (cruceros, playa, ciudad, aventura, gastronomía, etc.), y "qué tan flexible eres" (muy flexible / algo flexible / fechas fijas), porque la flexibilidad es lo que desbloquea los mejores precios.

3. Un feed de descubrimiento (estilo tarjetas / scroll) que muestre "deals de flexibilidad" como protagonista, equivalente al 90-Day Ticker pero bonito: cada tarjeta es una experiencia premium con un gran descuento por ser de salida próxima o por flexibilidad.

Pantallas / secciones a incluir en el prototipo:
- Landing / home con la propuesta de valor clara y el modo "Sorpréndeme" destacado.
- El feed de deals con tarjetas (mezclando cruceros, paquetes, experiencias y algún vuelo de inspiración).
- Una vista de detalle de una experiencia (por ejemplo un crucero curado): qué incluye, por qué es un buen deal, el "¿y qué hago ahí?" (narrativa + actividades sugeridas, que es el diferenciador de curaduría), y el CTA de afiliado "Reservar en [proveedor]".
- La capa de filtros por vibe/presupuesto/días en acción.

Datos de ejemplo: usa experiencias realistas y aspiracionales (cruceros por el Mediterráneo o el Caribe, vuelo+hotel a Lisboa o Tokio, una experiencia gastronómica en Oaxaca, etc.), con precios "desde", porcentaje de descuento, días de duración, y ventana de salida. Mexicaniza algunos ejemplos para que el fundador se identifique (salidas desde CDMX).
</requirements>

<design_direction>
Estética: premium, editorial, con aire de revista de viajes moderna; no parecer una OTA barata ni un panel corporativo. Fotografía grande y evocadora (usa bloques de color o gradientes como placeholder si no hay imágenes reales), tipografía con personalidad, mucho espacio en blanco, y un acento de color que transmita descubrimiento/aventura sin caer en clichés.

Evita la estética genérica de IA: nada de tarjetas grises idénticas, gradientes morados por defecto, ni emojis decorativos por todos lados. Busca una identidad visual con intención (jerarquía clara, contraste deliberado, microinteracciones sutiles).

El "deal de flexibilidad" debe sentirse emocionante y escaso (señales de urgencia honestas: "salida en 18 días", "quedan pocos lugares"), porque ese es el gancho psicológico del modelo Vacations To Go, pero sin caer en patrones oscuros.

Debe ser responsive y verse bien en móvil, ya que el fundador trabaja y revisa cosas desde el teléfono.
</design_direction>

<constraints>
- Un solo archivo de artifact React, autocontenido, con datos hardcodeados. No llamadas de red reales.
- No construyas un checkout ni cobres pagos: el flujo termina en un CTA de afiliado hacia un proveedor externo (puede ser un botón que no navega a ningún lado real).
- Muestra los precios como "desde" / aproximados, con una nota sutil de que el precio final se confirma en el sitio del proveedor. Esto es importante porque legalmente, en modo afiliado y con datos de inspiración cacheados, no puedes presentar el precio como definitivo.
- No uses localStorage ni sessionStorage (no funcionan en los artifacts de Claude). Usa estado de React en memoria.
- Texto de la interfaz en español. Evita el uso de em dashes en el copy, porque el fundador los considera marca de texto generado por IA.
</constraints>

<output>
Genera un artifact de React (un solo archivo) que implemente el prototipo descrito, con navegación funcional entre las secciones (home / feed / detalle) mediante estado de React, los tres modos de descubrimiento operativos sobre datos de ejemplo, y un diseño premium y responsive.
</output>

<verification>
Antes de darlo por terminado, verifica que:
- Las tres modalidades de descubrimiento (conversacional "Sorpréndeme", filtros por vibe/presupuesto/días, y feed de deals) estén presentes y sean interactivas.
- Exista al menos una vista de detalle que muestre el diferenciador de curaduría (el "¿y qué hago ahí?").
- Todos los CTA finales sean de tipo afiliado ("Reservar en [proveedor]"), nunca un checkout propio.
- Los precios aparezcan como "desde" con la nota de confirmación en el proveedor.
- El copy esté en español, sin em dashes, y la interfaz sea responsive.
- El diseño no caiga en la estética genérica de IA.
</verification>

<success_criteria>
El fundador puede abrir el prototipo, navegar entre las secciones, probar el modo "Sorpréndeme" y los filtros por flexibilidad, ver un deal en detalle con su curaduría, y sentir que "esto es algo que yo mismo usaría" para descubrir su próximo viaje. El prototipo comunica la tesis de negocio (lujo accesible por flexibilidad, multi-vertical, modelo afiliado) sin necesidad de explicación adicional.
</success_criteria>
