# Panorama Competitivo

> **Tipo:** concepto  ·  **Parte de:** [[index]]

El espacio de "deals de viaje flexibles" tiene varios actores ya establecidos, pero ninguno resuelve el mismo problema de la misma manera ni para el mismo usuario. Entender sus modelos es la base para identificar el hueco real y elegir la primera batalla técnica correcta.

## Modelos de monetización de las OTAs

Las OTAs grandes operan principalmente en dos modos. En el modelo **merchant**, la OTA cobra al viajero y luego liquida al proveedor; asume el riesgo de fraude, chargebacks y reembolsos. En el modelo **agency**, solo intermedia la reserva y recibe comisión del proveedor. Expedia describe ambos en sus reportes financieros, y su red de agentes (TAAP) opera sobre el modelo agency.

La distinción importa para [[arquitectura-mvp]] porque en cuanto un fundador pasa de "display y redirect" a "merchant of record", cambia por completo el riesgo operativo: pagos, cancelaciones, conciliación y soporte al cliente. Para una operación inicial sin equipo, la afiliación pura es la única entrada viable.

## Actores principales y sus enfoques

### Going, Jack's Flight Club, Secret Flying

Los tres se especializan en alertas de vuelos baratos, incluyendo error fares. Going se define como un servicio de deals desde aeropuertos de EE. UU. que avisa al usuario en vez de venderle directamente. Jack's Flight Club y Secret Flying operan con la misma lógica.

Lo que estos tres prueban es importante: el hábito de "compra por oportunidad" ya existe. El usuario flexible que no sabe exactamente a dónde ir, pero sí sabe que si sale algo excepcional reserva, ya está entrenado. El problema de Going es geográfico: está calibrado para aeropuertos norteamericanos. Ninguno de los tres construye una narrativa aspiracional ni conecta el deal con el "por qué emocional" del viaje.

### Google Flights "to anywhere"

Google Flights permite explorar destinos sin fecha ni destino fijo, con precios ordenados desde un origen dado. Es poderoso como herramienta de discovery pero no editorializa, no construye marca de deseo ni produce contenido que ayude al usuario a decidir. Es una interfaz, no una propuesta curatorial.

### Vacations To Go (90-Day Ticker)

Vacations To Go construyó su posición sobre un activo muy específico: el **90-Day Ticker**, un listado de cruceros de último minuto con disponibilidad promedio menor a siete días y, según ellos, muchos cupos que se agotan en horas. Su propuesta es cobertura de inventario actualizado y velocidad de cierre.

Lo relevante no es su UX (que no es particularmente contemporánea) sino la operación detrás: sourcing persistente, actualización constante y triggers de disponibilidad. Ese es el verdadero moat, no la interfaz.

### CruiseSheet

CruiseSheet rastrea cerca de **20,000 cruceros**, ofrece alertas de precio y price-drop alerts, y reconoce en su propio producto que los precios cambian rápido y no siempre están 100% actualizados. Al igual que Vacations To Go, su valor está en la maquinaria de actualización de inventario, no solo en mostrar opciones.

## Por qué no entrar por cruceros como primera batalla técnica

Vacations To Go y CruiseSheet son instructivos precisamente porque revelan la naturaleza del problema. El incumbente de cruceros no solo tiene SEO o marca, tiene **operación de inventario**. Replicarla requiere membresías CLIA, relaciones con host agencies y acceso B2B a mayoristas. No existe una API moderna, pública y self-serve para retail de cruceros comparable a lo que Duffel ofrece en vuelos.

La secuencia lógica para cruceros es: afiliación o lead-gen primero, luego acuerdo con host agency o wholesaler, y solo después una experiencia transaccional propia. Entrar por cruceros en el primer corte sería elegir la vertical con mayor barrera de entrada técnica y menor posibilidad de validar rápido. Ver [[acreditacion-y-host-agencies]] para la capa de credenciales que ese camino requiere.

La alternativa en vuelos es estructuralmente más accesible: Travelpayouts/Aviasales ofrece un Data API con precios de caché abierto a partners registrados (la fuente accesible hoy, tras la baja del Self-Service de Amadeus), y Duffel permite vender vuelos reales sin acreditación IATA/ARC propia desde el día uno. Ver [[proveedores-apis-e-inventario]] para el detalle técnico de cada opción.

## El hueco competitivo real

La brecha no está en cobertura bruta de inventario. Ningún jugador individual combina hoy las tres dimensiones siguientes:

1. **Origen local o regional relevante** para el usuario concreto (no solo aeropuertos de EE. UU.).
2. **Curaduría aspiracional** en vez de puro ordenamiento por precio.
3. **Narrativa de decisión**: una explicación de por qué ese deal es especial, qué se puede hacer ahí, por qué encaja con el momento del usuario.

Going alerta, pero no editorializa. Google Flights explora, pero no construye deseo. Secret Flying prioriza el "wow" del precio. Vacations To Go y CruiseSheet demuestran que el deal funciona, pero no construyen una marca contemporánea ni una UX pensada para el usuario aspiracional.

El espacio disponible no es "ser más grande" sino **ser el mejor para el viajero flexible que quiere sentirse listo para reservar**. Eso implica combinar un feed de oportunidades reales con una capa editorial que transforme un precio en una decisión emocionalmente clara.

Ese enfoque encaja con el [[modelo-de-negocio]] afiliado: primero generás hábito de descubrimiento, después monetizás el click-out. La unidad de valor no es una reserva, es una "oportunidad curada" con origen, destino, ventana de salida, precio observado, vibe editorial y CTA primario hacia afiliación.

## El modelo de Expedia como referencia de madurez

Expedia describe en sus reportes financieros un negocio para agentes y socios que se apoya en acceso a inventario, comisiones y herramientas de gestión, no en inventario propio. Su programa TAAP trabaja con host agencies para que asesores independientes puedan usar acreditaciones ya establecidas.

Para un proyecto en etapa inicial, lo importante de ese modelo es lo que revela sobre el ecosistema: las comisiones y el inventario ya están estructurados, el acceso ya es programático, y la barrera de entrada real no es técnica sino de volumen y credenciales. La propuesta diferenciada tiene que estar en el producto, no en la tubería de datos.

## Implicaciones para la estrategia

El panorama competitivo sugiere tres decisiones de posicionamiento concretas:

- Entrar por **vuelos flexibles** como primera vertical técnica, donde las APIs son más abiertas y el modelo afiliado está más estandarizado.
- Construir la diferenciación en la **capa editorial y de curaduría**, no en la amplitud de inventario.
- Calibrar el producto para **un origen específico** (aeropuerto o región) antes de intentar cobertura global, porque la relevancia local es precisamente lo que los jugadores grandes no optimizan.

Ver [[tesis-y-vision]] para la propuesta de valor completa y [[roadmap]] para cómo se secuencia la entrada.

## Enlaces relacionados

- [[tesis-y-vision]] -- la propuesta diferenciada parte del hueco que ningún competidor llena hoy.
- [[modelo-de-negocio]] -- el modelo afiliado es la forma de monetizar sin convertirse en OTA tradicional.
- [[verticales-y-economia-unitaria]] -- cruceros como vertical futura versus vuelos como primera batalla técnica.
- [[proveedores-apis-e-inventario]] -- el acceso técnico real a inventario de vuelos, hoteles y actividades.
- [[acreditacion-y-host-agencies]] -- la capa de credenciales que se requiere si se escala hacia cruceros o emisión propia.
- [[riesgos-y-preguntas-abiertas]] -- los riesgos de cobertura de inventario y frescura de precios heredados de este panorama.
- [[usuario-objetivo]] -- el viajero flexible aspiracional que ninguno de los competidores sirve bien hoy.

## Fuentes

- [[2026-06-investigacion-tesis-negocio]]
- [[2026-06-investigacion-competir-con-ota]]
