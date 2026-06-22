# Modelo de negocio

> **Tipo:** concepto  ·  **Parte de:** [[index]]

El negocio opera en dos fases claramente separadas: una fase inicial de afiliado (cero riesgo operativo, cero atención al cliente) y una fase futura de reservas propias que se activa solo cuando el volumen de tráfico lo justifica. La transición entre fases no es un hito de calendario sino de demanda demostrada.

---

## Fase 1: modelo afiliado

En modo afiliado el producto nunca toca el dinero del viajero. Se muestran resultados, se inspira al usuario, y al momento de reservar se le redirige al proveedor con un enlace de afiliado. La comisión llega del proveedor, no del usuario.

Esto implica tres ventajas operativas fundamentales:

- **Sin acreditación.** No se requiere IATA, ARC ni CLIA para redirigir tráfico y cobrar comisión. La barrera del bono IATA (aproximadamente US$50,000 por país, cuota de aplicación ~US$1,300, anualidad ~US$200, proceso de 90 días o más) solo aparece cuando se emiten boletos propios.
- **Sin atención al cliente.** Los cambios, cancelaciones y reembolsos son responsabilidad del proveedor, no del producto.
- **Sin riesgo de fraude o chargeback.** Al no ser merchant of record, no se asumen chargebacks ni fraude transaccional.

### Mecánica de tracking y atribución

El sistema de comisiones descansa en tres piezas técnicas:

1. **Marker / SubID (Travelpayouts):** el `marker` es el identificador de afiliado que se embebe en cada deep link. El `SubID` permite saber qué página o herramienta específica generó cada clic y reserva, lo que habilita atribución interna granular.

2. **Cookie de last-click:** la mayoría de los programas (Viator, GetYourGuide, Klook) usan cookie de 30 días con atribución last-click. Si el usuario hace clic en el enlace y reserva dentro de los 30 días siguientes, la comisión se atribuye al afiliado sobre el valor total de la orden. Royal Caribbean extiende esa ventana a ~45 días. Booking.com es la excepción: su programa directo es in-session (sin cookie), es decir, la reserva debe completarse en la misma sesión del navegador.

3. **Postbacks server-to-server:** las redes como Travelpayouts, CJ, Awin e Impact soportan postback URLs con macros para registrar conversiones servidor a servidor, evitando pérdidas por bloqueo de cookies en el navegador.

### Cuándo se confirma y paga la comisión

La comisión no se paga al momento del clic sino cuando el servicio se realiza:

- Viator: paga tras realizarse el tour (cancelaciones revierten la comisión).
- Booking.com: paga tras completarse la estancia (modelo pay-per-stay, no paga reservas canceladas).
- Cruceros: en algunos programas se paga parcialmente antes de zarpar.

**Umbrales de pago:** Travelpayouts requiere un mínimo de US$50 para pago por PayPal, US$400 por transferencia bancaria y US$10 por WebMoney. Los pagos son automáticos, normalmente entre el día 11 y 20 del mes siguiente. Viator acepta PayPal semanal sin mínimo o transferencia mensual con mínimo US$50. Booking.com requiere US$/EUR 100.

---

## La cascada de monetización por vertical

No todos los verticales pagan igual. La economía unitaria real ordena las prioridades de producto:

| Vertical | Comisión afiliado | Ticket medio | Por qué importa |
|---|---|---|---|
| Vuelos | ~1.1-1.5% | bajo | Gancho de tráfico e inspiración, no fuente de ingreso |
| Hoteles | 4-5% (Travelpayouts) / 25-40% del margen de Booking | medio | Booking usa escala escalonada: Tier 1 (1-50 estancias) 25%, Tier 2 (51-150) 30%, Tier 3 (151-500) 35%, Tier 4 (501+) 40% |
| Experiencias | 5-8% | bajo-medio | Viator 8%, GetYourGuide minimo 8%, Klook 5-6.5% (eSIM hasta 20%) |
| Paquetes | 8-12% | alto | Combinan componentes; mejor margen compuesto |
| Cruceros | 3% (agregadores) hasta 12-16% (mayoristas) | muy alto, US$1,200-3,000+ | Mejor comisión absoluta por venta |

**Implicación estratégica:** un clic en vuelos puede valer centavos de comisión; un crucero vendido puede valer US$100-400. Los vuelos funcionan como gancho de descubrimiento y SEO; el ingreso real viene de cruceros, paquetes, experiencias y hoteles. Véase [[verticales-y-economia-unitaria]] para el desglose completo por vertical.

### Proveedores de afiliación por vertical

- **Vuelos y hoteles:** Travelpayouts (una sola alta gratuita da acceso a Aviasales, Jetradar, Kiwi via links, Booking, Hotellook y más). Su **Data API** (`v2/prices/latest`, `v2/prices/month-matrix`) es el motor de inspiración. (Amadeus Self-Service cumplía antes ese rol, pero quedó **descontinuado** en jun 2026; solo enterprise bajo contrato.)
- **Experiencias:** Viator directo (alta en menos de 1 minuto vía cuenta Tripadvisor), GetYourGuide (vía CJ Affiliate o directo), Klook (vía Travelpayouts o portal propio), Tiqets (vía Awin).
- **Cruceros:** programas de navieras (Royal Caribbean ~4%, cookie ~45 días), GoToSea (3% o más), Expedia CruiseShipCenters (hasta 12%).

Véase [[proveedores-apis-e-inventario]] para el detalle técnico de cada integración y los umbrales de tráfico que abren o cierran el acceso a cada API.

---

## El salto de "display + redirect" a merchant of record

El modelo afiliado es "display + redirect": se muestra el deal y se redirige al proveedor. El salto a reservas propias convierte al producto en merchant of record, lo que cambia por completo el perfil de riesgo:

- Se asumen pagos, fraude, chargebacks y reembolsos.
- Se requiere atención al cliente para cambios y cancelaciones.
- En vuelos, se necesita acreditación IATA (o usar el "Managed Content" de Duffel, que presta sus acreditaciones) para emitir boletos.
- En cruceros, se necesita número IATA (vía [[acreditacion-y-host-agencies]]) y membresía CLIA (Individual Agent Membership: US$89-139/año).
- En hoteles como merchant, se entra en obligaciones PCI DSS si se procesan tarjetas.
- En México, pasar a intermediar servicios turísticos de forma directa activa la obligación de inscripción en el Registro Nacional de Turismo (RNT/SECTUR) dentro de los 30 días naturales del inicio de operaciones.

**Por qué se evita al inicio:** para un proyecto operado por una sola persona sin equipo de soporte, el costo operativo y regulatorio de ser merchant hace inviable el modelo como side project. La fase afiliada elimina todos esos costos mientras el producto valida tracción y construye tráfico.

La ruta de migración cuando llegue el momento:

1. Vuelos: usar Duffel Managed Content (no requiere bono IATA propio, cubre aerolíneas como Volaris, LATAM y Copa).
2. Cruceros: incorporarse a una host agency para obtener número IATA y luego membresía CLIA.
3. Hoteles: contratos con bedbanks (Hotelbeds, TBO) con net rates y markup propio.

---

## Umbrales que cambian la estrategia de APIs

El acceso a ciertas APIs escala con el tráfico. Estos son los benchmarks relevantes:

- **Sin mínimo / inmediato:** Travelpayouts, Viator, Klook, Royal Caribbean afiliado. (Amadeus Self-Service estaba aquí; quedó descontinuado en jun 2026.)
- **50,000 MAU:** Kiwi Tequila API (vía Travelpayouts).
- **100,000 visitas/mes:** Skyscanner Travel API, GetYourGuide API básica.
- **1,000,000 visitas/mes + 300 reservas/mes:** GetYourGuide Booking API completa.
- **Cuando la comisión de afiliado supere el 10% de bookings o haya demanda de checkout propio:** evaluar Duffel para vuelos transaccionales.

---

## Cobro desde México

Las plataformas extranjeras calculan y pagan en USD o EUR. Los métodos prácticos son PayPal y Payoneer. Las plataformas (Travelpayouts, Booking, Viator) no son residentes fiscales en México y normalmente no retienen ISR mexicano al afiliado residente en México: la obligación de declarar y pagar ISR recae en el afiliado. Lo recomendable es darse de alta en el RFC como persona física con actividad empresarial o en RESICO (si califica) y declarar esos ingresos mundiales al SAT. Véase [[legal-y-fiscal-mexico]] para el detalle fiscal completo.

---

## Enlaces relacionados

- [[verticales-y-economia-unitaria]]: tabla detallada de comisiones, tickets medios y prioridad de producto por vertical.
- [[proveedores-apis-e-inventario]]: detalle técnico de cada API y programa de afiliados, umbrales de acceso y orden de alta recomendado.
- [[legal-y-fiscal-mexico]]: obligaciones fiscales en México, RFC, CFDI, RNT/SECTUR y lo que cambia al pasar a merchant.
- [[acreditacion-y-host-agencies]]: IATA, CLIA, TIDS, consolidadores y la ruta concreta para emitir boletos o vender cruceros sin acreditacion propia desde el inicio.
- [[tesis-y-vision]]: por que el modelo afiliado es la entrada correcta dada la barrera real del negocio (el inventario confidencial requiere tráfico previo, no al revés).
- [[riesgos-y-preguntas-abiertas]]: la pregunta abierta sobre si los deals públicos de afiliado son suficientemente atractivos para validar la hipótesis central.

---

## Fuentes

- [[2026-06-prd-descubrimiento-viajes]]
- [[2026-06-investigacion-apis-vuelos-experiencias]]
- [[2026-06-investigacion-competir-con-ota]]
