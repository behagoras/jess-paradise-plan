# Acreditación y Host Agencies

> **Tipo:** concepto  ·  **Parte de:** [[index]]

Esta página cubre las rutas para pasar de afiliado a "reservas propias": los sistemas de acreditación aérea, sus costos reales, las alternativas modernas que los evitan, y cómo aterrizar esto desde México.

---

## Por qué importa la acreditación

En modo afiliado, el producto solo redirige tráfico y cobra comisión; no hay emisión de boletos ni toma de pagos. Eso significa que IATA, ARC y CLIA son irrelevantes en esa fase. La barrera aparece en cuanto se quiere hacer reservas propias: en ese momento hay que o bien acreditarse, o bien apoyarse en alguien que ya lo esté.

El costo concreto de no conocer las rutas alternas es alto: la acreditación IATA plena implica un bono de aproximadamente 50,000 USD por país de operación, una cuota de aplicación de alrededor de 1,300 USD, una anualidad de unos 200 USD y un proceso de no menos de 90 días. Eso es mucho fricción para un producto que todavía no ha demostrado demanda en reservas propias.

---

## IATA: modalidades y BSP

IATA ofrece tres modalidades de acreditación para agencias:

- **GoLite**: acreditación estándar sin cash facility. Punto de entrada más accesible.
- **GoStandard**: amplía opciones de pago.
- **GoGlobal**: alcance más amplio y opciones adicionales.

Las tres conectan con el **BSP** (Billing and Settlement Plan), el sistema que simplifica liquidaciones entre agencias acreditadas y aerolíneas. En México, la solicitud se tramita país por país y tiene requisitos locales específicos. El proceso toma en la práctica no menos de 90 días.

**TIDS** (Travel Industry Designator Service) es una alternativa de bajo costo que IATA define como un código para agencias y operadores no ticketing. Hoy es gratuito. No sustituye la acreditación plena para emitir boletos, pero funciona como identificador frente a proveedores y como paso intermedio dentro del ecosistema. Duffel, por ejemplo, lo pide para acceder a Qantas sin acreditación IATA/ARC propia.

---

## ARC (Estados Unidos)

ARC es el equivalente de IATA para agencias domiciliadas en Estados Unidos. Sus requisitos incluyen domicilio en EE.UU., un instrumento financiero mínimo de 20,000 USD, formación, personal designado, especialista ARC y autenticación multifactor. ARC da acceso a ticketing y settlement con más de 240 aerolíneas.

Si la base operativa es México, ARC no es la primera vía lógica salvo que se estructure una entidad y operación en EE.UU.

---

## CLIA para cruceros

Para vender cruceros directamente con navieras como agente, se requiere número IATA (típicamente vía host agency) y membresía CLIA:

- **Individual Agent Membership (IAM)**: 139 USD/año afiliada a un Travel Agency Member, o 89 USD/año afiliada a un Premier Agency Member; más 19.99 USD por listado en Agent Finder.
- CLIA recomienda haber generado al menos 5,000 USD en comisiones de crucero el año previo.
- Para mantener la membresía se requieren al menos 2 reservas comisionadas por año.
- Las navieras tienen políticas estrictas anti-rebating: no se puede anunciar por debajo de tarifa publicada.

Mientras no se alcance ese nivel, la ruta práctica para cruceros es afiliación o lead-gen primero, después host agency o mayorista.

---

## Consolidadores aéreos

Un consolidador aéreo es un mayorista de boletos que tiene contratos privados con aerolíneas y vende esos asientos a agentes calificados. La propia documentación de Amadeus los menciona como alternativa a la acreditación propia para llegar a producción con Flight Create Orders.

**Centrav** es un ejemplo de consolidador aéreo relevante para el contexto de este proyecto. Esta ruta reduce las barreras de entrada pero crea dependencia de un tercero para ticketing, políticas y en algunos casos soporte operativo.

---

## Host agencies

Una host agency presta su número IATA y sus relaciones comerciales a agentes que quieren operar sin acreditación propia. Desde el punto de vista económico, el host procesa comisiones, reduce fricción de onboarding y permite arrancar sin el bono y los plazos de IATA.

**Fora** es la opción más relevante para este proyecto:

- Opera en México desde mayo de 2025.
- Paga comisiones en MXN.
- Requiere RFC y CURP para procesar pagos.

Expedia reconoce que muchas agencias nuevas usan hosts para acreditación, herramientas y procesamiento de comisiones, y que su programa TAAP trabaja con ese modelo.

---

## El Managed Content de Duffel: vender vuelos sin acreditarte

La ruta más práctica para vender vuelos con reservas propias sin pasar por IATA es el **Managed Content** de Duffel. Duffel tiene 5 acreditaciones IATA globales y las "presta" al vendedor para que pueda emitir boletos sin acreditarse. La cobertura alcanza más de 300 aerolíneas, incluyendo carriers relevantes para México como Volaris, LATAM y Copa.

El modelo de pricing de Duffel es pay-as-you-go: aproximadamente 3 USD más 1% del valor de la orden más 2% de FX. También aplica un "Excess Search fee": cada 10 órdenes al mes incluyen 15,000 búsquedas gratis, y el excedente cuesta 0.005 USD por búsqueda.

Una advertencia crítica: Duffel exige mantener un look-to-book de 1,500:1 y advierte explícitamente que no es adecuado para metabuscadores o búsquedas de calendario. Esto lo hace incompatible con la función de "destino abierto / fechas flexibles"; debe usarse solo en el paso transaccional, cuando el usuario ya eligió un itinerario concreto. Para el componente de inspiración, ver [[proveedores-apis-e-inventario]].

El vendedor que ya tiene acreditación propia puede llevar sus relaciones privadas y tarifas propias a Duffel. El que no tiene puede empezar con Managed Content y decidir después.

---

## Cuándo conviene cada ruta

| Situación | Ruta recomendada |
|---|---|
| Fase afiliada (sin reservas propias) | Sin acreditación. Solo links/APIs de afiliado. |
| Primeras reservas propias de vuelos | Duffel Managed Content (presta su IATA, sin bono). |
| Se quiere ampliar ticketing y tarifas privadas | Consolidador aéreo (Centrav) o host agency. |
| Escala real con volumen en vuelos | Acreditación IATA GoLite propia (90+ días, bono ~50k USD). |
| Cruceros en fase temprana | Afiliación vía Travelpayouts, GoToSea o redes CJ/Awin. |
| Cruceros con volumen en México | Host agency + membresía CLIA (IAM 89-139 USD/año). |
| Identificación frente a proveedores sin ticketing | TIDS (gratuito, paso intermedio). |
| Base en EE.UU. con operación formal | ARC (instrumento financiero mínimo 20,000 USD). |

---

## Regulación en México

Cuando el negocio pasa de redirigir tráfico a intermediar y ofrecer servicios turísticos bajo marca propia, la carga regulatoria cambia. La Ley General de Turismo establece que la inscripción al **Registro Nacional de Turismo (RNT)** es obligatoria para prestadores de servicios turísticos y debe hacerse dentro de los 30 días naturales desde el inicio de operaciones. PROFECO además requiere que la agencia entregue contrato al usuario y que los contratos de adhesión de servicios turísticos estén registrados.

En modo puramente afiliado, el encuadre es diferente. Pero en cuanto se toman pagos, se emiten confirmaciones propias o se actúa como intermediario formal, esta capa ya no es opcional. Ver [[legal-y-fiscal-mexico]] para el detalle completo.

---

## Secuencia de maduración recomendada

1. Fase afiliada con reporting robusto (Travelpayouts, Viator, Booking).
2. Vertical transaccional en vuelos con Duffel Managed Content.
3. TIDS como identificador frente a proveedores.
4. Acuerdos con host agency o consolidador para ampliar ticketing y tarifas privadas.
5. CLIA si el vertical de cruceros demuestra volumen real.
6. Acreditación IATA propia solo si el volumen lo justifica.

Este orden minimiza costo hundido y preserva el enfoque en el diferencial del producto: descubrimiento y curaduría, no replicar el back office de una agencia tradicional. Ver [[roadmap]] para la secuencia en contexto de fases del proyecto.

---

## Enlaces relacionados

- [[modelo-de-negocio]] porque la elección de ruta de acreditación determina cuándo y cómo se captura margen propio versus comisión de afiliado.
- [[proveedores-apis-e-inventario]] porque Duffel, Amadeus Self-Service y los consolidadores son los proveedores técnicos que hacen posibles las reservas propias.
- [[verticales-y-economia-unitaria]] porque la priorización de cruceros, experiencias y vuelos afecta directamente qué acreditaciones importan y en qué orden.
- [[legal-y-fiscal-mexico]] porque la transición de afiliado a merchant activa el RNT, CFDI, IVA y otras obligaciones.
- [[roadmap]] porque la secuencia afiliado → Duffel → host/consolidador → IATA propia es la ruta de maduración del negocio.
- [[riesgos-y-preguntas-abiertas]] porque los costos de acreditación y los tiempos de onboarding son riesgos operativos relevantes.

---

## Fuentes

- [[2026-06-investigacion-competir-con-ota]]
- [[2026-06-investigacion-apis-vuelos-experiencias]]
