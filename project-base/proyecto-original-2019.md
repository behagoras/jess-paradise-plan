# Paradise Plan (2019)

> Reconstruccion a partir de los materiales originales del proyecto: mockups web (20 pantallas), mockups mobile (PDF, 13 pantallas), mapa de features, mapa conceptual de flujo, investigacion de usuarios, encuesta y wireframe en Adobe XD. Fecha aproximada de produccion: 2019.

---

## Resumen del proyecto

Paradise Plan era una app web y mobile de planificacion de viajes por sorpresa: el usuario ingresaba su presupuesto, fechas y preferencias (no un destino fijo) y la app le generaba paquetes de viaje personalizados con vuelo, hotel y actividades incluidas.

---

## El problema

Segun los materiales del proyecto (Presentation.md), las fricciones principales al planear un viaje eran:

- No saber a donde ir.
- No saber que hacer ni donde quedarse.
- El proceso de reserva es complicado.
- Falta de opciones ajustadas al presupuesto personal.
- Demasiada investigacion requerida cuando no se tiene un destino en mente.

---

## Que se construia: la propuesta de producto

Una app de reserva de viajes para encontrar destinos basados en presupuesto y preferencias personales, no en un destino predefinido. Orientada a personas que les gusta viajar pero no tienen un lugar especifico en mente y quieren ideas junto con un presupuesto calculado. El enfoque central era la eficiencia en costos.

Copiando el enunciado original: "A travel booking app for finding trips based on budget and preferences for those who like to travel but don't particularly have a destination in mind focussing in cost efficiency."

La propuesta de valor enumerada en los mockups (pantallas 6 y 20) listaba 10 puntos:

1. Clear budgeting options
2. Lower costs
3. Several trip options
4. Get competitive pricing for travel plans
5. See the best deals for what you want
6. Comparison of destinations
7. Comparison prices
8. Easy access to booking
9. Safety / More options (varia entre versiones)
10. Availability

---

## Flujo de usuario

El flujo principal del producto se resumia en 3 pasos, repetidos consistentemente en todos los mockups y materiales:

1. "Plug in info": el usuario ingresa fechas, punto de partida, presupuesto, tipo de vacacion, numero de viajeros, etc. Todo opcional segun el Presentation.md.
2. "Select from preference filter menu to customize your trip": el usuario selecciona preferencias de destino (playa, cultura, historia, gastronomia, lujo, etc.) y clima (calido, frio, soleado, etc.).
3. "Find your surprise paradise package with the best trip deals for you": la app genera un paquete sorpresa con vuelo, hotel y actividad segun los inputs.

El mapa conceptual "Planning with Paradise Plan" desglosa este flujo en 5 etapas con mayor detalle:

| Etapa | Descripcion |
|---|---|
| 1. Informacion del usuario | Who is going, actividades y preferencias, fechas, tipo de vacacion, presupuesto |
| 2. El usuario elige de las opciones que da la app | Lista de lugares y opciones generadas |
| 3. Edicion del viaje | Personalizar hotel, vuelo, actividad |
| 4. El usuario selecciona y paga | Reserva vuelo y hotel; algunas actividades si desea |
| 5. Post-compra | Pagina de confirmacion, itinerario corto generado por la app, investigacion de actividades alternativas |

---

## Investigacion de usuarios

### Como se planean los viajes (mind map de investigacion)

El mapa "How trips are planned" descomponia el proceso de planificacion en cinco categorias, usadas como base para definir los campos del formulario principal:

- **Basic info**: fechas de viaje, numero de personas, estado de animo para el viaje (travel mood), presupuesto, servicios extra.
- **Consensus**: opciones disponibles, cuantas personas deben acordar.
- **Costing / budgeting**: markups, hotel, comidas, transporte, actividades, entradas, miscelaneos.
- **Planning resources**: sitios de reserva, horarios de transporte, guias de viaje, oficinas de turismo gubernamentales, internet, libros de viaje.
- **Choosing itinerary**: mapa de ruta, intereses, ritmo del viaje (fast, slow, relaxed, extreme, children), nivel de actividad del turista.

### Que facilitaria viajar (user needs)

Del material "What Can Make Traveling Easier?", los usuarios identificaron cuatro grandes necesidades:

1. Multiples opciones de destino basadas en preferencias personales.
2. Opciones claras de presupuesto: costos mas bajos, comparacion de precios, mejores ofertas, rangos dentro de fechas y presupuesto fijo.
3. Acceso facil a reservas: mas opciones, disponibilidad, donde quedarse segun intereses.
4. Sin alzas de tarifas aereas.
5. Coordinacion de fechas con acompanantes (identificada como punto de friccion).

### Encuesta: "Do you use a booking app?"

Los usuarios que dijeron SI usaban una app de reservas dieron estas razones (textuales):

- "It makes finding deals easier cost / budgeting"
- "Find the best deal"
- "To compare prices, options and hear other user reviews."
- "tend to have better prices than the airline/hotel websites."
- "to find cheap flights. Both the website and the app."
- "to see my options all at once"
- "Combine different airlines easily"
- "It helps you decide where to go"
- "helps with understanding more about the location"

Los usuarios que dijeron NO dieron estas razones:

- "agents do everything"
- "I like to manage my own travels"
- "I never traveled"
- "do not know of any good travel booking apps."
- "I find better deals booking by myself separately."
- "don't usually like the packages offered."
- "Mostly book things with my parents so they do it"

Los insights principales: los usuarios que SI usan apps valoran la comparacion de precios y la visualizacion de opciones en un solo lugar. Los que NO las usan desconocen alternativas buenas, prefieren control manual o dependen de terceros. Paradise Plan intentaba resolver ambos lados: ofrecer una app que resultara mejor que "reservar por separado" y que fuera suficientemente buena como para competir con agentes.

---

## User personas

Segun Presentation.md, tres personas de usuario:

### Student (Estudiante)
- Edad: 19 a 23 anos.
- Caracteristica principal: semi-sensible al precio.
- Problema clave: dificultad para elegir destinos.

### Budget Conscious (Consciente del presupuesto)
- Edad: 24 a 29 anos.
- Comportamiento: reserva con anticipacion, compara ofertas.

### Adventurous Adult (Adulto aventurero)
- Edad: 30 a 40 anos.
- Caracteristica: mayor poder adquisitivo, sin hijos.
- Necesidad: quiere opciones variadas.

### Necesidades comunes a las tres personas

Del Presentation.md:

- **Price Sensitivity**: preocupacion central con precios y presupuesto. Necesitan ayuda para presupuestar, comparar precios y manejar precios fluctuantes.
- **Usability**: herramientas intuitivas que ahorren tiempo. Facil de navegar y pagar.
- **Options and time**: les gusta viajar pero elegir destino es complicado por restricciones de presupuesto y falta de ideas. La plataforma debe tener funciones de comparacion visual.
- **Convenience**: acceso rapido a informacion, opciones y disponibilidad.

El objetivo comun descrito en los materiales: "A way to see great value vacation options comparable in different locations. Having a comparison of destinations and prices close to each other (like in a table or chart) but still be able to choose a set destination; something that shows top reviews for different destinations."

---

## Features planeadas

Del mapa de features (Features.jpg), la arquitectura de la app se organizaba en seis secciones principales:

### Cart (flujo de compra directo)
- Step 1 con campos: departure point, dates, budget range, number of travelers, package, types of vacations, optional: activity preferences + destination.
- Review.
- Book and Pay.
- Confirmation page.

### Home (flujo principal de busqueda)
- Step 1, Step 2, Step 3.
- Filtros de preferencias.
- "Suprise me" (nombre del CTA principal, con typo en el original).
- Opciones generadas: Option 1, Option 2, Option 3, cada una con hotel, vuelo y actividad.
- Select Option.
- Review (con sub-opciones: cambios de hotel, cambios de vuelo).
- Book and Pay.
- Confirmation page.

### Search
- Seccion de busqueda (sin subramas detalladas en el mapa).

### About Us
- Pagina informativa "About us page".

### Contact
- "contact page" con "info plug" (informacion de contacto).

### Account
- Sign up.
- Log in.
- View itinerary, con sub-secciones:
  - Filters.
  - Wish list (con "view my reviews" y "write a review").
  - Choose from trips (con "locations", "hotels", "activities").

---

## Planeacion: mapa conceptual del flujo

El concept map "Planning with Paradise Plan" define el journey completo del usuario en cinco columnas secuenciales con codigo de colores:

- **Columna 1 (azul acero): "information user inputs"**: Who is going, Activities and Preferences selection, Dates, Type of vacation, Choose budget.
- **Columna 2 (verde militar oscuro): "user chooses from option and options provided by the app"**: List of places and options provided by the app.
- **Columna 3 (verde lima): "Edit trip and options provided by the app"**: Personalize hotel, personalize flight, personalize activity.
- **Columna 4 (naranja/ocre): "user selects and pay and options provided by the app"**: Book major components of trip (flight + Hotel) some activities if wanted.
- **Columna 5 (beige/arena): "after purchase and options provided by the app"**: Confirmation Page, App provides a short itinerary, Research alternative activities.

---

## Diseno web: prototipo de 20 pantallas

El prototipo web estaba disenado para una resolucion de escritorio de 1920px. De las 20 pantallas exportadas, 6 resultaron en archivos en blanco (pantallas 4, 11, 13, 14, 17 y 19), probablemente frames vacios o con error de exportacion. Las 14 pantallas con contenido se agrupan en las siguientes secciones logicas:

### Landing page / Home (pantallas 1, 6, 20)

Las pantallas 1, 6 y 20 son variantes de la misma landing page, con ligeras diferencias de layout pero el mismo contenido esencial. Funcionan como el punto de entrada del usuario antes de autenticarse.

Todos los elementos compartidos:

- **Navbar**: logo "PARADISE PLAN" con icono de palmera en la esquina superior izquierda. Links de navegacion: Search, Home, Preferences, About Us, Contact Us, Account, Check out.
- **Hero**: collage fotografico de destinos turisticos (desiertos, montanas, puentes, globos aerostaticos, ciudades) con el titulo "PARADISE PLAN" y el subtitulo "Plan your paradise vacation today" superpuestos.
- **CTA principal**: boton grande "GET STARTED", que inicia el flujo de planificacion.
- **Seccion de 3 pasos**: tres columnas numeradas con iconos circulares (1, 2, 3) que explican el flujo: ingresar datos, seleccionar preferencias, recibir paquete sorpresa.
- **Footer izquierdo**: seccion "Contact Us" con informacion de contacto (contenido de relleno en el prototipo).
- **Footer derecho**: modulo "Log in or make an account" con campos de login y password.

Diferencias entre versiones:

- Pantalla 6 incluye la seccion "About Us" y "The value of Paradise Plan" (lista de 10 puntos) con tres botones de categoria: "where to go", "what to do", "where to stay", y un boton secundario "Know based on your interests".
- Pantalla 20 es identica en contenido a la pantalla 6, posiblemente una iteracion ligeramente refinada.
- Pantalla 1 es la version mas simple: solo hero, CTA y 3 pasos.

### Flujo de busqueda y preferencias (pantallas 2, 3, 7, 8, 9, 10, 12, 15)

Estas ocho pantallas representan variantes del wizard central de configuracion del viaje, el componente mas importante del producto. Todas comparten la misma estructura de tres pasos mostrados simultaneamente en tres columnas (o paneles paralelos). La tab "Preferences" aparece activa en el navbar en la mayoria de estas pantallas.

#### Estructura comun del wizard

**STEP 1: Datos basicos del viaje**

Campos presentes en todas las variantes (con asterisco = obligatorio):

- Departure point (punto de partida).
- Dates (fechas, con selector de calendario).
- Number of travelers (numero de viajeros, spinner numerico, default 2).
- Budget range (rango de presupuesto, dos campos o slider).
- Packages (dropdown con opciones: Flight, Hotel, AirBnB, Car, Tours/Activity, Boat/Cruise, segun la variante).
- Vacation Type (dropdown con opciones: family, friends, solo/lone wolf, adventure, discovery, save more, segun la variante).
- Traveler Types (dropdown con opciones: Adult, Children, Advanced Age).
- Optional: Max distance.
- Activity intensity (slider 1-5, de "low" a "high", o escala con selector numerico).
- Optional: Destination.

**STEP 2: Preferencias de experiencia**

Dropdown expandido titulado "Preferences Dropdown / Select all that apply". Dos categorias de checkboxes/radio buttons:

Categoria GENERAL (varia ligeramente entre versiones, pero incluye): Beach, Nightlife/Nights, Activities, Museums, Historic, Good food, Nature/Jungle/Forest, Luxury, Hidden, Touristic staples, Cruises, Culture, Sports, Party, Romantic, City.

Categoria WEATHER: Hot, Cold/cool, Windy, Rainy, Perfect/Sunny/Medium, Snow.

**STEP 3: Resumen y CTA**

Panel "Selections Summary" que muestra en tiempo real las selecciones del usuario: Departure, Dates, Number of travelers, Budget range, Packages, Vacation Type, Traveler Type, Activity Level, Filters seleccionados. Boton CTA principal en amarillo/dorado: "Suprise Me!" (el nombre del boton tiene un typo consistente en casi todos los mockups, falta la 'r' en "Surprise").

#### Sidebar instructiva (presente en varias variantes)

Columna izquierda con tres circulos numerados en rojo/coral que explican el flujo al usuario nuevo. Es informativa, no interactiva.

#### Diferencias entre variantes del wizard

- Pantallas 2 y 3: versiones tempranas del wizard; la pantalla 3 incluye un panel "Selections Summary" con datos de ejemplo ya precargados (Budget: $30-333, Vacation Type: Friends, Adventure, Traveler Type: Adult, Activity Level: +).
- Pantallas 7, 8, 9: variantes con ligeros cambios en la lista de preferencias (por ejemplo, pantalla 8 agrega "Jungle" y "Party" en GENERAL, pantalla 9 agrega "Romantic" y "Cultural").
- Pantalla 10: la version mas detallada del wizard. Incluye el campo "Optional: Max distance" y muestra la escala de Activity intensity con botones numerados 1-5 (el 4 aparece seleccionado). El resumen en Step 3 muestra: Departure, Dates, # of travelers, Budget range $$$-$$$, Packages: Flight, hotel, activity, Vacation Type: Friends, Adventure, Traveler Type: Adult, Activity Level: 4, Filters: Beach, nightlife, hot.
- Pantalla 12: el Step 2 aparece como el paso activo (encabezado verde), con Beach y Hot marcados como seleccionados.
- Pantalla 15: similar a pantalla 12, Step 2 activo, con Forest en lugar de City/Jungle como opcion de GENERAL. El resumen de Step 3 muestra Budget range: $500-$$$ y Vacation Type: Relax, activity.

### Resultados de paquetes (pantalla 18)

Esta pantalla muestra los resultados generados despues de presionar "Surprise Me!". Es la pantalla de listado de opciones de viaje.

Layout de dos columnas:

**Columna izquierda (lista de resultados, aprox. 70% del ancho)**: tarjetas apiladas verticalmente. La primera tarjeta (Option 1: Cancun) esta completamente poblada con datos reales de ejemplo:

- Imagen de playa/destino.
- Nombre del destino: "Cancun, QROO, Mexico" con descripcion textual: "Cancun, the Caribbean playground of spring breakers, luxury seekers and beach lovers."
- Hotel: Red Idol Cancun, 2 personas, 2 queen beds.
- Vuelo: JetBlue, 00:00pm July 2 - 00:00pm July 4 2019.
- Actividad: "Concert, Steve Aoki Live".
- Precio: placeholder "$$$".
- Boton "Select".

Las dos tarjetas siguientes usan texto placeholder ("location ....", "mini description ....") indicando que son wireframe.

Cada tarjeta incluye un panel de "Reviews" con estrellas (cinco estrellas en los ejemplos de wireframe).

**Columna derecha "Selection Summary" (aprox. 30% del ancho)**: panel fijo con desglose de la seleccion: Option 1, 1 location, Departure flight (aerolinea, fecha, hora, precio), Return flight, Hotel name, Type of room (precio), Activity + fecha (precio), Taxes, Fees, Total price. Boton CTA naranja/rojo: "Continue to edit", que lleva al siguiente paso de edicion.

### Detalle y edicion del itinerario (pantalla 16)

Pantalla de revision final antes del checkout. El usuario ya personalizo todos los componentes y ahora los revisa en conjunto.

Layout de tres columnas:

**Columna izquierda estrecha (stepper vertical 1-4)**:
1. Edit and personalize flight information.
2. Edit and personalize Hotel and Hotel information.
3. Edit and personalize activity.
4. Checkout and pay (paso activo).

**Columna central ancha**: encabezado del destino (Cancun, con descripcion y boton "Learn more"), seguido de tres tarjetas apiladas:

- **Flight Information**: tabla con columnas Dep. / Airports / Time / Return / Airports / Time / Price. Datos ejemplo: JetBlue, LAX, Jul 2 2019, retorno BOG, Jul 5 2019. Precio "$$$". Boton "Edit flight".
- **Hotel (Real Inn Cancun)**: imagen, descripcion ("Real Inn Cancun features an outdoor pool and a fitness centre. Other facilities offered include a restaurant, a coffee shop/cafe, and a snack bar/deli. A business center is on site at the 3.5 star property."), direccion (Boulevard Kukulcan, Zona Hotelera Cancun, QROO 77500), tipo de cuarto, precio "$$". Boton "Edit Hotel".
- **Concert (Steve Aoki, Conciertos Melody Parade 2019)**: imagen del evento, descripcion del artista, ubicacion (Bird Kulukan Km 9.5, Punta Hotelera, Zona Hotelera, 77500), fecha July 3 2019, precio "$$$". Boton "Edit activity".

**Columna derecha "Selection Summary"**: campos editables: Choose your location, Departure flight (fecha, hora, precio), Return flight (fecha, hora, precio), Hotel name, Type of room, Activity (concert name, fecha), Taxes, Fees, Total price (resaltado en verde). Boton prominente "Checkout" en verde.

### Pagina de contacto (pantalla 5)

Pagina informativa "Contact Us" (tab activo en navbar).

- Columna izquierda: datos de contacto con iconos circulares: telefono (617) 262-6188, Email, Fax, Social media / link / link. Boton CTA negro grande: "GET STARTED".
- Columna central: seccion "1. Office Location" con la direccion 187 Dartmouth St, Boston, MA 02116 y un mapa embebido de la ubicacion en Boston/Back Bay.
- Columna derecha: fotografia de un puente sobre un rio con arquitectura clasica europea (aparenta ser Roma) como inspiracion visual.
- Seccion inferior: flujo de 3 pasos con circulos numerados en rojo/naranja, el paso 2 aparece resaltado.
- Footer: modulo de login con campos y boton "sign in".

La direccion de Boston sugiere que el proyecto fue desarrollado por estudiantes ubicados en esa ciudad.

### Pantallas en blanco

Las pantallas 4, 11, 13, 14, 17 y 19 son archivos PNG de 1456 x 816 px completamente blancos. No es posible determinar su contenido. En el contexto del flujo, es probable que algunas de estas correspondiesen a: pagina de resultados intermedios, pagina de detalle de una opcion de viaje, pagina de confirmacion de reserva, o pagina de cuenta/itinerario guardado. Esto queda sin confirmar por el material disponible (no claro en los materiales).

---

## Diseno mobile

El PDF "ParadisePlanMobile.pdf" contiene 13 pantallas en formato retrato (~820px de ancho). La app mobile replica el mismo flujo de 3 pasos del web, adaptado a una navegacion vertical con componentes expandibles.

### Nav bar global (persistente)
Barra gris oscura en la parte superior con 7 iconos: lupa, casa (home), hamburger/lista, (i) informacion, telefono, tarjeta de contacto, carrito. El icono activo de la pantalla actual tiene fondo gris claro ligeramente diferenciado.

### Footer global (persistente)
Fondo gris oscuro. Izquierda: "Contact Us" con columnas de texto placeholder. Derecha: dos botones apilados, "sign in" (borde gris) y "login" (fondo negro).

### Pantalla 1: Home / Landing

- Logo "PARADISE PLAN" en tipografia bold con palmas tropicales verdes, maleta amarilla y avion rojo con X.
- Tagline: "Plan your paradise vacation today".
- Boton primario azul/morado: "Know based on your interests".
- Tres botones secundarios del mismo color: "where to go", "what to do", "where to stay".
- Hero image de ancho completo: resort tropical con palmeras, piscina, playa y sombrillas.
- Boton blanco centrado sobre la imagen: "GET STARTED".
- Debajo: tres pasos numerados en circulos con borde rojo/salmon (1, 2, 3) con descripcion textual del flujo.

### Sub-nav de progreso (pantallas de formulario)

Barra con tres botones de igual tamano: STEP 1, STEP 2, STEP 3. El paso activo tiene fondo verde solido; los otros tienen borde verde y texto verde sobre fondo blanco. El logo aparece a la izquierda del sub-nav.

### STEP 1: Formulario de datos basicos (pantallas 2 a 11)

El formulario mobile muestra los mismos campos que el web, organizados en una sola columna vertical con componentes expandibles. Campos marcados con asterisco = obligatorios:

- **departure point**: campo de texto.
- **dates**: campo de texto con icono de calendario. Al tocar: se despliega un overlay con el calendario del mes MAY mostrando precios por dia (ejemplos: $270, $287, $309 resaltado en naranja, $100, $70, $150, etc.) y dos opciones radio: "Pick your preferred departure date" / "Select other dates to consider". Botones Back y Confirm.
- **# of travelers**: spinner numerico (default: 2).
- **Budget range**: dos campos "$$$" separados por guion.
- **Packages** (dropdown expandible, *select all that apply): Flight, Hotel, Activity, Car, Cruise.
- **Vacation Type** (dropdown, *select all that apply): family, friends, adventure, discovery, lone wolf.
- **Traveler Types** (dropdown, *select all that apply): Adult, Children, Advanced Age.
- **Optional: Max distance**: campo de texto.
- **Activity intensity**: escala 1 a 5 con etiquetas "low" y "high". Se muestra estado con "4" seleccionado (fondo gris oscuro en el numero).
- **Optional: Destination**: campo de texto.

Las pantallas 2 a 11 muestran los distintos estados de interaccion de este formulario: campos vacios, calendario abierto, dropdowns expandidos sin seleccion, y dropdowns expandidos con items seleccionados (circulo relleno vs. circulo vacio "O"). Ejemplos de selecciones mostradas: Packages con Flight, Hotel y Activity marcados; Vacation Type con friends y adventure marcados; Traveler Type con Adult marcado.

Flechas de navegacion < > en la parte inferior para ir al paso anterior o siguiente.

### STEP 2: Preferencias (pantallas 12 y 13)

Banner verde con label "STEP 2". Titulo: "Prefrences Dropdown" (typo en el original) con instruccion "*Select all that apply".

Lista con scrollbar vertical, dividida en dos secciones:

- **GENERAL**: Beach, Nightlife, Activities, Museums, Historic, Good food, Nature, Luxury, Hidden, Touristic staples, Cruises.
- **WEATHER**: Hot, cold, windy, perfect, medium, snow.

Se muestran dos estados: todos vacios, y con Beach, Nightlife y Hot seleccionados.

### STEP 3: Resumen y CTA (pantalla 14)

Banner verde con label "STEP 3". Titulo "Selections Summary" en negrita.

Resumen de selecciones mostrado en lista:
- Departure (campo vacio en el ejemplo).
- Dates (campo vacio en el ejemplo).
- # of travelers.
- Budget range: $$$-$$$.
- Packages: Flight, hotel, activity.
- Vacation Type: Friends, Adventure.
- Traveler Type: Adult.
- Activity Level: 4.
- Filters: Beach, nightlife, hot.

CTA principal: boton ancho amarillo dorado con icono de lupa a la izquierda y texto "Suprise Me!" (typo consistente con las versiones web).

---

## Contenido del PDF principal (Paradise plan xd.pdf)

El PDF "Paradise plan xd.pdf" es un documento de una sola pagina exportado desde Adobe XD que muestra el mockup de la homepage de la app web. Su contenido no agrega informacion nueva respecto a lo ya documentado en las pantallas web 1, 6 y 20, pero confirma:

- El software de diseno usado era Adobe XD.
- La navegacion en esta version es una barra vertical lateral (sidebar izquierdo), no horizontal. Incluye los mismos items: Home, Search, Preferences, About Us, Contact Us, Account, Check out, cada uno con un icono.
- El collage de fotos del hero (fondo de la pantalla) es la misma grilla de imagenes de destinos de la version web.
- El panel de login (sidebar derecho) y el footer de "Contact Us" son los mismos.
- Los typos "Prefrences" y "vaccation" estan presentes, lo que sugiere que este fue un archivo de trabajo (no la version final pulida).

---

## Estado del proyecto en 2019

Segun la evidencia disponible, Paradise Plan habia alcanzado las siguientes etapas:

**Investigacion (completada)**: Existia un mind map de como se planean los viajes, una diapositiva de "what can make traveling easier?", y resultados de una encuesta cualitativa sobre uso de apps de reserva con respuestas reales de usuarios.

**Concepto y arquitectura (completado)**: Existia un mapa de features con la arquitectura de navegacion completa (sitemap) y un mapa conceptual del flujo del usuario en 5 etapas.

**Diseno visual y prototipado (en progreso)**: Existian 20 pantallas web disenadas en Figma o herramienta similar (6 de ellas en blanco, posiblemente no completadas al momento de exportacion), 13 pantallas mobile en PDF, y una pantalla exportada desde Adobe XD. Las pantallas con contenido muestran alta consistencia en los flujos de busqueda, preferencias y checkout.

**Desarrollo (no claro en los materiales)**: No hay evidencia de codigo, repositorio ni implementacion tecnica entre los archivos disponibles.

**Estado general**: Prototipo de media fidelidad con investigacion de usuarios documentada, propuesta de valor definida y flujo principal disenado. El proyecto estaba en etapa de prototipado UX, probablemente como entrega de un curso universitario de diseno de producto o UX (no claro en los materiales si fue presentado o entregado).
