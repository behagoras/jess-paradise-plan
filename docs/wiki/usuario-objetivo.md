# Usuario objetivo

> **Tipo:** concepto  ·  **Parte de:** [[index]]

El viajero flexible con poder adquisitivo medio-alto a alto es el usuario para el que se construye todo en Paradise Plan. Entenderlo con precision es la base de cada decision de producto.

---

## Perfil primario

Parejas DINK (doble ingreso sin hijos), solteros con ingresos, nomadas digitales y jubilados activos. Lo que los une no es su edad ni su ocupacion, sino su condicion de calendario: no tienen ataduras de fecha que les impidan moverse cuando aparece una oportunidad.

Su frase clave es:

> "Quiero viajar. No se a donde y no se cuando. Muestrame el mejor viaje."

Esa frase sintetiza la propuesta de valor entera. El usuario no llega con un destino en mente; llega con un deseo difuso de vivir algo excepcional y con la capacidad real de actuar si aparece la oferta correcta. El producto existe para convertir ese deseo en una decision concreta.

---

## Lo que valora

**Descubrimiento por encima de busqueda.** No quiere rellenar un formulario de origen/destino/fechas como en Expedia. Quiere que algo le llame la atencion mientras explora, de la misma forma en que un feed bien editado le muestra algo que no sabia que queria.

**Lujo accesible.** No busca el precio mas bajo, busca la experiencia mas alta que puede conseguir aprovechando su flexibilidad. Que una cabina con balcon en un crucero premium cueste lo mismo que un hotel boutique es exactamente el tipo de descubrimiento que lo mueve.

**Cero friccion y UX moderna.** Tiene capacidad economica para pagar y no tolerara una interfaz torpe, muros de registro o promesas de precio que no se cumplen al hacer clic. La confianza se gana con transparencia ("precio visto hace X horas") y con una experiencia que se sienta contemporanea.

---

## Validacion de mercado

Tres fuentes respaldan que este segmento es real y suficientemente grande:

- **McKinsey:** el 35% del mercado de lujo turistico esta compuesto por viajeros con patrimonios de entre 100,000 y 1 millon de dolares. No compran lujo en todo el viaje; eligen componentes premium concretos y exigen valor por su dinero. Eso es exactamente "lujo accesible".

- **McKinsey:** el 80% del mercado de ocio de lujo tiene menos de 60 anos. El segmento no es el imaginario de jubilados millonarios; es activo, digital y relativamente joven.

- **Phocuswright:** 7 de cada 10 viajeros priorizan la flexibilidad en la reserva mas que antes. La sensibilidad a la flexibilidad como forma de reducir arrepentimiento esta instalada en el comportamiento del viajero moderno.

Estos datos no apuntan al ultra-lujo. Apuntan al espacio entre el viajero comun y el cliente de lujo exclusivo: el viajero aspiracional y selectivo que "splurge" en piezas concretas de la experiencia.

---

## Quien NO es el usuario (al inicio)

El viajero ultra-lujo con fechas fijas y destino decidido no encaja con un producto de software puro. Ese perfil prefiere un asesor boutique que le construya una experiencia end-to-end muy personalizada. McKinsey confirma que los segmentos HNWI y superiores siguen confiando en agentes boutique y buscan privacidad y exclusividad que un producto self-serve no puede ofrecer hoy.

Intentar servir a ese segmento desde el inicio obligaria a agregar atencion al cliente y operaciones que contradicen la arquitectura de afiliacion con la que arranca el negocio. Ver [[modelo-de-negocio]] para el detalle de por que esa decision es estrategica.

---

## Por que la flexibilidad es el mecanismo central

La flexibilidad del usuario no es solo un rasgo de estilo de vida: es el activo que desbloquea el [[modelo-de-negocio]]. Los proveedores de viajes, desde navieras hasta aerolineas, tienen inventario que necesitan llenar y estan dispuestos a rematar cabinas y asientos a precios muy por debajo de su tarifa completa. El viajero flexible puede capturar ese valor porque no necesita una fecha ni un destino especifico.

Eso genera una sinergia concreta: el usuario gana una experiencia premium a precio inusual, y el producto gana comision por haber conectado esa oportunidad con el usuario correcto. Ver [[tesis-y-vision]] para la articulacion completa de este mecanismo.

---

## Implicaciones de diseno de producto

Dado este perfil, el producto no debe empezar con una caja de busqueda vacia. El punto de entrada es un feed editorial, con filtros por "vibe", presupuesto y cantidad de dias disponibles, no por destino. El modo conversacional ("sorprendeme") es una extension natural de como este usuario expresa su necesidad.

La capa de curaduria, donde un deal de vuelo se convierte en una mini-experiencia con narrativa y actividades sugeridas, existe especificamente porque este usuario no compra un precio: compra la promesa de una experiencia memorable. Ver [[arquitectura-mvp]] para como se traduce esto en decisiones tecnicas.

---

## Enlaces relacionados

- [[tesis-y-vision]] · la tesis de negocio parte directamente de la flexibilidad de este usuario como mecanismo de valor.
- [[modelo-de-negocio]] · explica por que el usuario no ultra-lujo es el segmento mas adecuado para una fase afiliada sin atencion al cliente.
- [[panorama-competitivo]] · los incumbentes (VTG, Going, Google Flights) sirven partes de este usuario pero ninguno combina curaduría aspiracional con flexibilidad multi-vertical.
- [[verticales-y-economia-unitaria]] · cada vertical del producto se justifica por su capacidad de servirle al usuario flexible con deals de alto valor percibido.
- [[arquitectura-mvp]] · las decisiones tecnicas del MVP estan condicionadas a lo que este perfil espera como experiencia de descubrimiento.

---

## Fuentes

- [[2026-06-prd-descubrimiento-viajes]]
- [[2026-06-investigacion-tesis-negocio]]
