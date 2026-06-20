# Roadmap

> **Tipo:** concepto  ·  **Parte de:** [[index]]

El roadmap está dividido en cortes secuenciales que respetan una lógica clara: primero construir tráfico con lo que hoy es técnicamente alcanzable sin acreditación, después añadir verticales de mayor margen, y solo entonces buscar acceso a inventario negociado. El orden no es arbitrario; lo dicta la restricción de inventario descrita en [[proveedores-apis-e-inventario]].

---

## Corte 1: feed de deals de flexibilidad sobre vuelos (semanas 1-4)

El primer corte arranca con vuelos porque es la vertical donde los datos son más accesibles sin credenciales ni músculo de tráfico.

**Mecánica núcleo:** origen fijo (por ejemplo, CDMX) hacia cualquier destino, próximos N días, por debajo de cierto precio. No es un buscador tradicional; es un feed de oportunidades curadas que el usuario puede consumir sin saber de antemano adónde quiere ir.

**Orden de alta de proveedores en esta fase:**

1. **Amadeus Flight Inspiration Search API** como fuente principal de discovery. Permite filtrar por precio, duración de viaje, non-stop y ventana de fechas. Ofrece cuota gratuita desde el primer día. Su limitación más importante es que no cubre low-cost carriers, American Airlines, Delta ni British Airways.
2. **Aviasales Data API / Travelpayouts** como fuente complementaria de precios cacheados. Los datos se almacenan hasta 7 días y son adecuados para un feed editorial y páginas SEO estáticas. El Search API en tiempo real de Aviasales requiere 50,000 MAU, por lo que en esta fase solo se usa la capa de datos de caché.
3. **Travelpayouts White Label Web** como salida de afiliación para el usuario que quiere cerrar la búsqueda. Es la opción de menor fricción para monetizar click-outs de vuelo sin cumplir el umbral de MAU.

**Objetivo de validación:** comprobar que el viajero flexible "muerde el anzuelo" de un feed estilo "no sé adónde, muéstrame lo mejor barato". El criterio de éxito interno es que el propio fundador use el producto para planear un viaje real.

**Nota de honestidad sobre precios:** tanto Amadeus como Aviasales son explícitos en que sus capas de inspiración son datos de caché. La UX debe comunicarlo con textos del tipo "precio visto hace X horas" en lugar de fingir exactitud transaccional.

---

## Corte 2: capa de curaduría y LLM (semanas 4-8)

Con el feed funcionando, el segundo corte convierte cada deal crudo en una mini-experiencia aspiracional.

**Qué se construye:**

- Agrupación de deals por "vibe" (escapada de playa, ciudad cultural, aventura de montaña, gastronomía urbana, etc.).
- Enriquecimiento editorial generado por LLM: narrativa del destino, razón por la que ese deal vale la pena, actividades sugeridas para el número de días disponibles.
- Un "deal quality score" que combine precio absoluto, rareza relativa, non-stop vs escalas, duración posible y un umbral editorial de "se siente premium aunque no sea el más barato".

**Alta de proveedores en esta fase:**

- **Viator Affiliate API** para attach de actividades. Con más de 300,000 experiencias en 2,500 destinos, cookie window de 30 días y dos modalidades de checkout (referral o in-site), es la integración de actividades con mejor balance entre inventario y claridad de onboarding para un solo fundador.
- **Booking.com Affiliate** como capa de alojamiento. Hotellook cerró en octubre de 2025 y Travelpayouts no ofrece hoy otra API hotelera activa, por lo que Booking.com es la ruta vigente. Cubre más de 28 millones de alojamientos y opciones adicionales de transporte y atracciones en más de 60,000 ubicaciones.

La cascada de monetización queda así al finalizar el Corte 2: click-out de vuelo (primera fuente de ingreso) + attach de hotel (segunda) + attach de actividades (tercera).

---

## Corte 3: segunda vertical, cruceros (mes 3 en adelante)

Los cruceros son el ejemplo perfecto de lujo accesible por flexibilidad y tienen comisiones que pueden alcanzar el 15%, pero requieren una operación de inventario y actualización más compleja que vuelos. Por eso entran en el tercer corte.

**Qué implica:**

- Afiliación a una operadora mexicana o host agency que tenga acceso a deals públicos de naviera y comparta comisión.
- Integración de listados bajo el mismo motor de descubrimiento del Corte 1, unificando la experiencia de usuario across verticales.
- Gestión de frescura de datos más crítica: la disponibilidad promedio de un crucero de último minuto es menor a 7 días y muchos se agotan en horas.

La acreditación CLIA o el uso de una host agency con credenciales ya establecidas pertenecen a esta fase. Ver detalles en [[acreditacion-y-host-agencies]].

---

## Más adelante (sin fecha comprometida)

Estas iniciativas no tienen ventana definida porque su viabilidad depende de haber validado tráfico y modelo en las fases anteriores:

- **Tercera vertical: experiencias y actividades** como categoría de descubrimiento independiente, no solo como attach de un vuelo.
- **Dynamic packaging:** armar paquetes completos (vuelo + hotel + actividad) de forma dinámica. Requiere orquestar múltiples proveedores con coherencia de fechas y precios.
- **Reservas propias vía Duffel:** migrar de "redirijo y cobro comisión" a "el usuario reserva dentro del sitio". Duffel es una API moderna de vuelos sin acreditación IATA, con pago por uso. Solo tiene sentido cuando el tráfico justifique absorber la responsabilidad operativa.
- **Acreditación CLIA / TIDS:** credenciales de industria para acceder a comisiones de naviera directamente y, eventualmente, a inventario negociado confidencial. El tráfico es la llave al inventario bueno, no al revés.

---

## Definición de éxito por horizonte

**A 3 meses (side project):** producto funcional que el propio fundador use para planear un viaje real. No se busca facturación ni usuarios; se busca validar la tesis y tener algo vivo.

**A mediano plazo:** tráfico recurrente de viajeros flexibles con primeras comisiones de afiliado que demuestren que el motor mueve reservas. La métrica de salud más temprana es el hábito de descubrimiento, no el ingreso confirmado, porque los sistemas de afiliación tienen estados intermedios (processing, paid, canceled) y el ingreso real llega tarde.

**A largo plazo:** convertirse en el lugar de referencia para descubrir experiencias premium por flexibilidad, con acceso a inventario negociado y reservas propias. Ahí es donde el tráfico acumulado abre puertas que hoy están cerradas.

---

## Enlaces relacionados

- [[proveedores-apis-e-inventario]] · detalle técnico de cada API mencionada en este roadmap, umbrales de acceso y estado actual de cada proveedor.
- [[modelo-de-negocio]] · la cascada de monetización afiliada y la transición futura a reservas propias.
- [[acreditacion-y-host-agencies]] · cómo funciona la acreditación CLIA y el modelo de host agency relevante para el Corte 3.
- [[arquitectura-mvp]] · la implementación técnica en Next.js que materializa el Corte 1 y el Corte 2.
- [[verticales-y-economia-unitaria]] · por qué cruceros y paquetes son las verticales de mayor margen y se dejan para fases posteriores.
- [[riesgos-y-preguntas-abiertas]] · los cinco riesgos concretos de ejecución que este roadmap asume pero no elimina.

---

## Fuentes

- [[2026-06-prd-descubrimiento-viajes]]
- [[2026-06-investigacion-tesis-negocio]]
