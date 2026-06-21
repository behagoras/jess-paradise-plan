# Paradise Plan — Style Guide / Análisis Visual

> Análisis visual consolidado del wireframe móvil **Paradise Plan** (app de vacaciones sorpresa), sintetizado a partir de cuatro auditorías por dimensión (color, tipografía/layout, iconografía/componentes y fidelidad) y de la paleta hex real extraída de los PNGs.

---

## 1. Resumen del lenguaje visual y nivel de fidelidad

**Veredicto: fidelidad BAJA-a-MEDIA — un "wireframe vestido".**

Paradise Plan es esencialmente un **wireframe de baja fidelidad con una capa de alta fidelidad aplicada de forma desigual**. Conviven señales mid-fi (una foto real de resort tropical, botones con color y sombra suave, un indicador de pasos con estado activo) con señales claramente low-fi que lo anclan: campos de resumen literalmente vacíos, footer dibujado como barras grises placeholder, notas internas al diseñador en lugar de copy final ("Plug in info ex)…"), ausencia total de estados de error/vacío/carga/validación, y erratas en CTAs y copy clave.

**Lenguaje visual:** sistema cromático mínimo y funcional sobre fondo casi blanco, con un "marco de cromo" gris (header + footer) que encierra el contenido. El color se usa para **jerarquía de navegación y estado**, no para decoración. Bordes finos grises, mínimas sombras, esquinas de rectas a ligeramente redondeadas, controles de aire desktop (caret dropdowns, spinner numérico, scrollbar con flechas) reutilizados en mobile.

**Mood buscado vs. logrado:** se busca *tropical + amigable + playful* (foto de palmeras/laguna, nombre "Paradise Plan", logo con palmera + maleta + ✕, tono "Suprise Me!"). Se logra de forma **parcial (~40%)**: la foto transmite el mood al instante, pero la paleta verde-oliva/mostaza/gris se siente institucional y apagada, los grises pesados aplastan la energía vacacional, y la personalidad se vuelve plana y administrativa en el flujo de Steps. No es un mockup hi-fi ni un prototipo listo para handoff.

---

## 2. Paleta de color

Paleta hex **real** extraída de los PNGs, agrupada por rol semántico.

### Marca / Verde
| Nombre semántico | Hex | Uso |
|---|---|---|
| `--primary` | `#72A267` | Verde de marca: banner de cada STEP, breadcrumb/pill activo (relleno sólido + texto blanco) |
| `--primary-dark` / `--primary-border` | `#374A3D` | Borde y texto de breadcrumbs inactivos, tipografía sobre claro |
| `--primary-light` | `#B0CAAB` / `#B3CEAE` / `#BDD2AC` | Fondos suaves, hover, estados sutiles |
| (foto hero) | `#324B30` / `#576127` | Verdes/tierra que aporta la foto de la landing (page-01) |

### Acción / CTA / Amarillo
| Nombre semántico | Hex | Uso |
|---|---|---|
| `--accent` / `--cta` | `#EED350` / `#DBCF5E` | Único color de acción culminante: botón **"Suprise Me!"** (Step 3) |
| (foto hero) | `#B7AE53` | Amarillo terroso aportado por la foto hero |

### Neutrales / Grises (chrome y UI)
| Nombre semántico | Hex | Uso |
|---|---|---|
| `--surface` / `--bg` | `#FFFFFF` / `#FCFCFC` / `#F3F3F3` | Fondo dominante de la app, lienzo de formularios |
| `--surface-muted` | `#F3F3F3` | Paneles sutiles (ej. bloque "Activity intensity") |
| `--chrome` / `--neutral-700` | `#6D6D6D` / `#6C6D6B` | Header superior y footer "Contact Us" (marco de cromo) |
| `--neutral-400` | `#A1A4A2` / `#A4A8A5` | Iconos UI, flechas de paginación, bordes de input, controles deshabilitados |

### Azul legacy (solo landing)
| Nombre semántico | Hex | Uso |
|---|---|---|
| `--info` (legacy) | `#9BD4F2` | Banner "Know based on your interests" (page-01) |
| `--info` (legacy) | `#66A1CF` | Chips "where to go / what to do / where to stay", botón **Confirm** del date picker |
| `--info` (legacy) | `#9EB8C4` | Acentos azulados secundarios de la landing |

> ⚠️ **El azul solo existe en la landing (page-01) y en el botón Confirm del calendario.** Desaparece del resto del flujo. Ver §5.

### Texto
| Nombre semántico | Hex | Uso |
|---|---|---|
| `--ink` / `--text` | `#070707` / `#090909` / `#101010` | Texto principal, labels, carets, botones negros (sign in / login) |

### Estados
| Nombre semántico | Hex | Uso |
|---|---|---|
| `--required` / `--danger` | `#C96C5D` / `#C17960` | Asteriscos `*` de campo obligatorio, "✕" del logo |
| `--state-active` | `#72A267` (+ blanco) | Pill/breadcrumb del paso en curso |
| `--state-inactive` | blanco + borde `#374A3D` | Breadcrumbs de los otros pasos |
| `--state-disabled` | `#A1A4A2` | Flechas de paginación, controles pasivos |

**Jerarquía cromática (mayor → menor peso visual):**
1. Amarillo CTA `#EED350` (un único punto de conversión)
2. Verde marca `#72A267` (progreso y navegación de pasos)
3. Gris chrome `#6D6D6D` (marco header/footer)
4. Negro texto `#101010`
5. Rojo `#C96C5D` (micro-acento de estado obligatorio)
6. Blanco/gris claro `#F3F3F3` (lienzo de fondo)
7. Azul `#66A1CF` (outlier: alto peso en una sola pantalla, ausente en el resto)

**Riesgo de contraste:** texto blanco sobre amarillo `#EED350` puede quedar por debajo de WCAG. Usar texto oscuro (`--ink`) sobre el CTA amarillo.

---

## 3. Tipografía y layout

### Familias
- **Una sola familia sans-serif del sistema** (Helvetica/Arial/system-ui) para toda la UI, sin serifas ni variación entre páginas — típica fuente por defecto de wireframe.
- **El logo "PARADISE PLAN" es la única excepción**: tipografía display/decorativa condensada y pesada, con outline/sombra dura y color rojo-verde. Es un asset raster aparte (estilo "WordArt"), no texto del sistema.
- **Placeholders de input** se ven como fuente nativa del control (más redondeada/condensada) frente al texto colocado en la página → posible inconsistencia placeholder vs. texto.

### Jerarquía de tamaños (mayor → menor)
| Nivel | Elemento | Tamaño relativo | Peso |
|---|---|---|---|
| 1 | Logo "PARADISE PLAN" | Display | Extra-bold + outline |
| 2 | Banner verde "STEP 1/2/3" | ~20–24px | Regular/medium, blanco centrado |
| 3 | Pills "STEP 1/2/3" (nav superior) | ~16px | Regular |
| 4 | Títulos de sección ("Selections Summary", "Prefrences Dropdown", "GENERAL"/"WEATHER") | ~16–18px | **Bold** |
| 5 | Labels / body / opciones / líneas del summary | ~14–15px | Regular (claves del summary en bold: "Packages:", "Departure:") |
| 6 | Subtexto "*Select all that apply" | ~12px | *Italic*, gris |
| 7 | Placeholders y "Optional:" | Base/pequeño | Regular, gris claro (estado vacío) |
| 8 | Footer "Contact Us" + columnas de enlaces | Pequeño | Regular |
| 9 | Botones "sign in" / "login" | Pequeño | Regular, blanco sobre negro |

**Pesos:** escala binaria — solo **Regular** y **Bold** (+ Bold-Italic puntual). No hay light ni semibold intermedios → jerarquía pobre, apoyada solo en bold/tamaño manual.

### Alineación
- Header (toolbar de iconos): `space-between`, iconos centrados verticalmente; Home resaltado con fondo gris.
- Banner "STEP X": centrado (h+v).
- Pills STEP: texto centrado en cada pill.
- Formulario (page-02): labels y campos a la izquierda, pero con **mezcla de patrones**: label-a-la-derecha del control ("# of travelers", "Budget range") vs. texto-dentro-del-campo ("Packages", "Vacation Type").
- Summary (page-13): **eje de alineación mixto** — título centrado, contenido a la izquierda.
- Lista de preferencias (page-11): a la izquierda, con prefijo "O" (círculo simulando radio).

### Grid / columnas
- **Layout de una sola columna** para el contenido principal (mobile-first) en todas las páginas.
- Header: fila única de ~7 iconos.
- Pills STEP: fila de 3 columnas iguales.
- **Footer**: único grid multi-columna real — ~4–5 columnas de enlaces (placeholder) + 1 columna a la derecha con sign in / login apilados.
- No hay sistema de columnas formal de contenido; anchos de campo ad-hoc (ej. "departure point" ancho + "dates" estrecho en la misma fila → grid de 2 columnas improvisado).

### Márgenes y densidad
- Márgenes laterales generosos y consistentes (~24–30px).
- page-02: densidad media-baja, buen ritmo vertical (~16–20px entre filas).
- page-11: **densidad ALTA** — lista "GENERAL/WEATHER" con interlineado muy apretado + scrollbar interno → contraste fuerte con el resto y riesgo de **doble scroll**.
- page-13: densidad baja, gran zona vacía entre el summary y el CTA.
- Agrupación por whitespace (líneas en blanco), sin separadores gráficos.

### Header / footer fijos y sub-header de sección
- **Header fijo**: toolbar gris oscuro con iconos, idéntico en alto y posición en todas las páginas → candidato a `sticky/fixed`.
- **Footer fijo**: barra gris "Contact Us" + enlaces + sign in/login, idéntico en todas las páginas.
- **Sub-header de sección** (logo + pills STEP + banner verde): repetido en las páginas de flujo, no forma parte del toolbar.
- **Flechas `<` `>`**: ancladas a izquierda/derecha justo encima del footer, fuera del flujo de contenido (navegación entre pasos).
- El área scrolleable queda entre el banner verde y las flechas.

---

## 4. Iconografía y componentes

### Set de iconos (top nav, 7 iconos)
Estilo **mixto, predominantemente de línea (outline/stroke), monocromático (blanco/gris claro)**, sin relleno sólido salvo el botón activo. Grosor de trazo homogéneo, esquinas levemente redondeadas.

| Pos. | Icono | Función probable | Estilo |
|---|---|---|---|
| 1 | Lupa | Buscar | Línea, trazo grueso |
| 2 | Casa (home) | Inicio / **activo** | Línea, dentro de botón gris claro elevado (estado seleccionado) |
| 3 | Líneas horizontales | Menú / categorías | Línea, 3–4 barras |
| 4 | "i" en círculo | Información | Outline circular |
| 5 | Teléfono en círculo | Contacto / llamar | Outline circular |
| 6 | Tarjeta de contacto / ID | Cuenta / perfil | Línea, retrato + líneas de texto |
| 7 | Carrito | Carrito / reservar | Línea pura |

> Dos iconos (info, phone) usan contenedor circular; el resto son glifos libres. Único estado filled/elevado: Home activo.

### Inventario de componentes
| Componente | Estilo |
|---|---|
| **Top nav bar** | Banda full-width gris oscuro; rectas en page-01, contenedor levemente redondeado en pages de flujo; sin sombra marcada; iconos equiespaciados; Home con recuadro elevado |
| **Breadcrumbs / pills STEP 1·2·3** | 3 pills rectangulares levemente redondeados; activo = relleno verde sólido + texto blanco; inactivo = blanco con borde verde fino + texto verde; sin sombra |
| **Step banner** | Barra grande verde sólido, texto blanco centrado; esquinas levemente redondeadas; encabezado de sección (alto desproporcionado a su valor informativo) |
| **Inputs de texto** | Rectangulares, borde gris fino, fondo blanco, esquinas rectas/levemente redondeadas, sin sombra; placeholder gris claro; requeridos con asterisco rojo a la izquierda |
| **Stepper numérico** ("# of travelers") | Input pequeño con valor ("2") + doble caret (▲▼) negro adosado a la derecha; borde fino |
| **Budget range** | Dos inputs "$$$" separados por dash central; mismo borde fino; asterisco rojo |
| **Dropdowns con caret** | Campo ancho con label interna ("Packages", "Vacation Type", "Traveler Types") + botón cuadrado con caret negro a la derecha; borde fino, sin sombra; asterisco rojo |
| **Grupos de opciones** (page-11) | Lista precedida por círculo "O" de línea (radio outline) usado como **multi-selección** ("*Select all that apply"); agrupada por encabezados en mayúsculas (GENERAL, WEATHER) |
| **Escala 1–5** ("Activity intensity") | 5 celdas numeradas con borde fino; extremos "low"/"high"; contenedor gris claro levemente redondeado (segmented scale) |
| **Date picker popup** (page-03) | Overlay flotante blanco con borde sutil; "When are you departing?" + 2 radios; rejilla mensual ("MAY") con flechas ‹ ›; botones **Back** (gris) / **Confirm** (azul sólido) |
| **Icono de calendario** | Glifo de línea junto al campo "dates"; abre el popup |
| **Botones landing** | "GET STARTED" (blanco/semi-translúcido sobre hero); "Know based on your interests" (azul sólido); chips "where to go / what to do / where to stay" (azul) |
| **CTA "Suprise Me!"** | Medio-grande, bold, blanco sobre amarillo `#EED350` (Step 3); contiene errata |
| **sign in / login** (footer) | Botones oscuros (negro en flujo, gris en landing), texto claro, levemente redondeados, sin sombra; desconectados del verde de marca |
| **Flechas prev/next** | Chevrons grandes gris medio en bordes inferiores; sin contenedor ni sombra |
| **Scrollbars** (page-11) | Barra vertical fina a la izquierda (decorativa) + scrollbar funcional a la derecha con flechas ▲▼ y thumb negro (estilo desktop) |

**Notas globales:** wireframe de media fidelidad; bordes finos grises, mínimas sombras, esquinas rectas a ligeramente redondeadas; indicador de obligatorio = asterisco rojo a la izquierda; **controles tipo desktop** (caret dropdowns, spinner, scrollbar con flechas) reutilizados en mobile delatan un wireframe no totalmente nativo-móvil.

---

## 5. Inconsistencias visuales

1. **Azul (landing) vs. verde (flujo) — hallazgo principal.** La landing enseña que *azul = interactivo/marca* (banner + chips + botón Confirm). Desde Step 1 el azul desaparece y la marca/acción pasa a verde. Hay **dos colores de "marca" compitiendo** sin regla que los relacione → expectativa rota e identidad diluida.

2. **Dos estilos / redundancia del stepper de pasos.** El paso activo se comunica **dos veces** simultáneamente: como pill verde sólido (nav superior) y como banner verde grande ("STEP X"). Coherente entre páginas, pero redundante y costoso en alto vertical.

3. **Radio usado como checkbox.** En page-11 las opciones llevan círculo "O" (semántica de radio = selección única), pero la instrucción "*Select all that apply" indica multi-selección. El glifo contradice el comportamiento → debería ser checkbox.

4. **Posición de label inconsistente** (page-02): label-a-la-derecha vs. texto-dentro-del-campo en el mismo formulario.

5. **Eje de alineación mixto** dentro del summary (page-13): título centrado / contenido a la izquierda.

6. **Densidad/interlineado dispar:** lista apretadísima en page-11 frente al espaciado holgado del resto; doble scroll potencial.

7. **Uso inconsistente del asterisco de requerido:** distancia variable al campo, sin leyenda que lo explique; presente en page-02 y en "Prefrences Dropdown" (page-11) pero ausente como criterio uniforme.

8. **Capitalización inconsistente** (page-11): "Beach"/"Nightlife"/"Activities" y "Hot" capitalizados vs. "cold"/"windy"/"perfect"/"medium"/"snow" en minúscula bajo WEATHER → sin regla de caso.

9. **Ortografía / copy:** "**Suprise** Me!" → *Surprise*; "**Prefrences**" → *Preferences*. Erratas en CTA y copy clave, inaceptables en hi-fi. Además, notas al diseñador ("Plug in info ex)…") en lugar de microcopy real.

10. **Logo y header variables:** logo tratado como imagen raster con sombra dura estilo "WordArt"; header/logo de la landing distinto en tamaño, layout y jerarquía respecto al header de los Steps → sin sistema de header unificado.

11. **Botones sign in/login fuera de sistema:** negros en el flujo, grises en la landing; estilísticamente desconectados del verde de marca (parecen controles de sistema).

12. **Escala de pesos binaria** (solo Regular/Bold) y type scale ad-hoc, sin niveles intermedios.

13. **Estados faltantes:** sin error, vacío, carga (spinner del "Suprise Me!"), validación, sin-resultados ni confirmación; los campos del summary (page-13) están literalmente vacíos.

---

## 6. Recomendaciones para llevarlo a alta fidelidad consistente

**Prioridad de impacto:** (1) color + (2) sistema de pasos/header unificado + (5) contenido real + (6) estados son lo que más distancia da del "wireframe vestido" hacia un hi-fi coherente. (4) logo y (3) erratas son *quick wins* de credibilidad.

**1. Definir tokens de color (un solo sistema).**
- Adoptar un **primario único** de extremo a extremo. Dos caminos:
  - *Conservador:* unificar todo en el **verde de marca** (`--primary #72A267` / `--primary-dark #374A3D`) y reconstruir el banner y los chips de la landing en verde o `--primary-light` con borde `--primary-dark`. Promover el azul a un rol semántico definido (`--info`) y aplicarlo de forma consistente, o eliminarlo.
  - *Ambicioso (mejora de mood):* migrar a una paleta tropical — primario turquesa/teal, secundario cálido (coral/arena), acento amarillo soleado, neutros cálidos (arena/off-white) en lugar de grises fríos — para que el "paraíso" se sienta playero y no institucional.
- **Una sola convención de acción:** *primary action* = un único color. Reservar el amarillo `#EED350` **exclusivamente** como CTA, con **texto oscuro** encima (contraste WCAG). Resolver el reparto azul/verde/amarillo/negro.

**2. Sistema de pasos único + header unificado.**
- Elegir **un solo** indicador de progreso: o las pills STEP 1·2·3 o el banner verde, **no ambos** (eliminar la redundancia y recuperar alto vertical).
- Unificar header/logo entre landing y Steps en un solo componente. Decidir entre la barra de iconos **o** el stepper, no ambos compitiendo. Documentar el patrón de navegación back/next en lugar de los chevrons gigantes de prototipo.

**3. Corregir ortografía y copy.**
- "Suprise" → **Surprise**; "Prefrences" → **Preferences**. Pasar todo el copy por revisión. Convertir las notas al diseñador ("Plug in info…") en microcopy final.

**4. Rehacer el logo como activo vectorial (SVG).**
- Eliminar sombra dura/WordArt; tipografía de marca limpia; palmera/maleta/✕ como ícono escalable. Definir versión full (landing) y versión compacta (header de Steps).

**5. Rellenar TODO el contenido real.**
- Sin campos vacíos ni placeholders. "Selections Summary" debe mostrar valores ejemplo realistas (ej. *Departure: Miami · Dates: Aug 12–19 · 2 travelers · $$–$$$*). Reemplazar las barras grises del footer por enlaces y contenido reales.

**6. Diseñar los estados faltantes** (lo que más sube la fidelidad real).
- Vacío / cargando (spinner del "Surprise Me!") / error / validación de formulario / sin-resultados / confirmación. Añadir un color explícito de **error**, **éxito** y **focus** de input (hoy el rojo solo marca "obligatorio", no "error").

**7. Establecer escala tipográfica y spacing.**
- Type scale formal (H1/H2/body/caption) con pesos intermedios (Regular/Medium/Semibold/Bold) y un sistema de spacing (grid 8pt). Normalizar capitalización (Title Case o sentence case, una sola regla) y la posición de labels (un único patrón: label arriba o label a la derecha).

**8. Librería de componentes consistente.**
- Documentar cada componente con sus estados (default / hover / focus / active / disabled / error):
  - **Checkbox real** para multi-selección (sustituir el "O" radio de page-11).
  - Inputs, dropdowns, stepper numérico, segmented scale 1–5 con borde, radio y foco unificados.
  - Botones con jerarquía clara (primary/secondary/tertiary) y sign in/login dentro del sistema de marca (no negros/grises sueltos).
  - Reemplazar la **scrollbar de escritorio** por scroll nativo móvil y evitar el doble scroll de page-11.
  - Estandarizar la navegación entre pasos (componente back/next) en vez de chevrons sueltos.

**9. Tratamiento de imagen consistente.**
- Si la foto real es el ancla del mood, usar fotografía de calidad en más pantallas (no solo la landing) con tratamiento uniforme (overlay, radios de esquina, ratio) para que el mood tropical no se evapore en el flujo de Steps.

---

*Assets analizados:* `/Users/behar/git/people/jess/paradise-plan/design/assets-export/mobile-png/page-01.png`, `page-02.png`, `page-03.png`, `page-11.png`, `page-13.png`.
