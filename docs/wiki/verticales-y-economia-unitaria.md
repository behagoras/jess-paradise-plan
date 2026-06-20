# Verticales y Economía Unitaria

> **Tipo:** concepto  ·  **Parte de:** [[index]]

Cada vertical de viajes tiene una economía unitaria radicalmente distinta. Conocerla determina dónde poner el esfuerzo de producto y cuándo un clic se convierte en ingreso real.

---

## Tabla de economía unitaria por vertical

| Vertical | Comisión afiliado | Ticket medio | Ingreso por venta | Notas |
|---|---|---|---|---|
| **Vuelos** | ~1.1–1.5% | bajo-medio | muy baja | Aviasales vía Travelpayouts. Márgenes de aerolínea mínimos. |
| **Hoteles** | 4–5% (Travelpayouts) / 25–40% del margen de Booking | medio | media | Booking pay-per-stay, escalonado por estancias/mes. |
| **Experiencias** | Viator 8%, GetYourGuide ≥8%, Klook 5–6.5%, eSIM hasta 20% | bajo-medio | media | Cookie de 30 días, pago tras el servicio completado. |
| **Paquetes** | 8–12% (TAAP/agregadores) | alto | alta | Combinan vuelo + hotel + actividades. |
| **Cruceros** | 3% (agregadores) a 12–16% (CruiseShipCenters/mayoristas) | muy alto (US$1,200–3,000+) | muy alta | Mejor comisión absoluta por venta. |

---

## Por qué los vuelos pagan poco

Las aerolíneas operan con márgenes netos muy delgados y han desintermediado activamente a las agencias durante décadas. La comisión por boleto es mínima y muchas aerolíneas low-cost pagan casi cero. El resultado: un clic en vuelos puede valer centavos para el afiliado.

Esto no significa que los vuelos sean inútiles en el modelo. Son el gancho de tráfico y el punto de entrada emocional del viajero flexible, pero no la fuente principal de ingreso.

---

## Por qué cruceros y paquetes pagan mucho más

El ticket de un crucero (US$1,200–3,000 por persona, muchas veces más) multiplica por 10–30x el de un vuelo suelto. Las navieras y operadores de paquetes valoran al intermediario que les trae al cliente, los márgenes del operador son más gruesos y el viajero tiene baja sensibilidad al precio unitario de la comisión. Un solo crucero vendido puede generar US$100–400 de comisión.

Los paquetes (vuelo + hotel + actividades) siguen la misma lógica: valor alto, comisión porcentual alta sobre producto compuesto.

---

## Detalle por vertical

### Vuelos

Comisión ~1.1–1.5% vía Aviasales/Travelpayouts. Sirven para inspirar y atraer tráfico, no para monetizar directamente. Ver [[proveedores-apis-e-inventario]] para las restricciones de API en esta vertical.

### Hoteles

Booking.com Affiliate usa un modelo de revenue share escalonado sobre el margen que Booking cobra al hotel, no sobre el valor de la reserva:

- Tier 1 (1–50 estancias/mes): 25% del margen de Booking
- Tier 2 (51–150): 30%
- Tier 3 (151–500): 35%
- Tier 4 (501+): 40%

Ejemplo: reserva de 100 EUR, Booking gana ~15 EUR, en Tier 1 la comisión del afiliado es 3.75 EUR. El tracking es in-session (sin cookie), pago solo por estancias completadas, umbral de US$/EUR 100.

Travelpayouts citaba 4–5% directo sobre el valor de reserva, pero su API hotelera (Hotellook) cerró en octubre de 2025.

### Experiencias

Es la vertical con mejor balance de comisión, ticket alcanzable y facilidad de entrada:

- **Viator:** 8% sobre reservas completadas, cookie 30 días, pago vía PayPal semanal sin mínimo o transferencia mensual con mínimo US$50.
- **GetYourGuide:** comisión mínima del 8%, pago mensual.
- **Klook:** tours y hoteles 6.5%, atracciones 5%, eSIM hasta 20%, gift cards 2%; cookie 30 días (7 días para hoteles/autos).
- **Tiqets:** ~50% del margen de Tiqets (dato de fuentes de blog, no oficial), disponible vía Awin.

### Paquetes

Comisión 8–12% sobre el valor total del paquete (TAAP de Expedia y agregadores). Alta barrera de entrada en fase afiliada pura, pero excelente economía unitaria cuando el volumen lo justifica.

### Cruceros

La vertical con la comisión más alta en términos absolutos:

- Agregadores (GoToSea, etc.): ~3% o más por reserva.
- Expedia CruiseShipCenters: hasta 12%, cookie 7 días.
- Mayoristas y navieras directas (vía estructura de agencia): 12–16%, sobre tickets de US$1,200–3,000+.
- Royal Caribbean vía afiliado: ~4% sobre AOV de ~US$2,500, cookie ~45 días.

Para acceder a las comisiones más altas en México se requiere número IATA (vía [[acreditacion-y-host-agencies]]) y membresía CLIA. La CLIA Individual Agent Membership (IAM) cuesta US$89–139/año dependiendo del tipo de agencia anfitriona, y requiere al menos 2 reservas comisionadas/año para mantenerla.

---

## Prioridad estratégica de verticales

La economía unitaria dicta un orden claro para asignar esfuerzo de producto:

1. **Cruceros y paquetes** (ingreso más alto por conversión)
2. **Experiencias** (comisión sólida, entrada sin fricción, inventario maduro)
3. **Hoteles** (capa de attach natural, económica razonable)
4. **Vuelos** (gancho de tráfico e inspiración, no fuente de ingreso primaria)

Este orden replica exactamente el modelo de Vacations To Go, el referente más cercano en la categoría: lideran en cruceros y paquetes, usan los vuelos para atraer al usuario, no para monetizarlo.

---

## Implicación para el producto

Un clic en vuelos puede valer centavos; un crucero vendido puede valer US$100–400. La estrategia de producto correcta es usar los vuelos y el discovery de destinos como gancho de tráfico y SEO, y estructurar la monetización real en torno a experiencias, hoteles, paquetes y cruceros.

Esto conecta directamente con la [[tesis-y-vision]] del proyecto: no es un buscador de vuelos baratos, es un motor de descubrimiento de oportunidades aspiracionales donde el vuelo es la puerta de entrada y el resto del viaje es donde se captura el valor.

---

## Umbrales relevantes para el acceso a APIs

Algunas comisiones o APIs en estas verticales tienen barreras de entrada:

- Kiwi Search API (vía Travelpayouts): requiere 50,000 MAU.
- Skyscanner Travel API: requiere más de 100,000 visitas/mes.
- GetYourGuide API básica: 100,000 visitas/mes; Booking API completa: 1M visitas + 300 reservas/mes.
- Booking Demand API: requiere ser Managed Affiliate aprobado.

Ver [[proveedores-apis-e-inventario]] para el detalle completo de acceso a cada proveedor.

---

## Fiscalidad básica sobre comisiones desde México

Las comisiones se calculan y pagan normalmente en USD o EUR. Las plataformas extranjeras (Travelpayouts, Booking, Viator) no retienen ISR mexicano ya que no son residentes en México. La obligación de declarar recae en el afiliado residente fiscal en México, que debe inscribirse en el RFC y declarar estos ingresos al SAT. Ver [[legal-y-fiscal-mexico]] para el detalle.

---

## Enlaces relacionados

- [[tesis-y-vision]] · la economía unitaria fundamenta por qué el modelo es discovery-first y no booking-first.
- [[modelo-de-negocio]] · cómo se estructura la cascada de monetización entre verticales.
- [[proveedores-apis-e-inventario]] · acceso técnico a cada vertical y sus restricciones de tráfico mínimo.
- [[acreditacion-y-host-agencies]] · IATA y CLIA son la puerta a las comisiones altas en cruceros y fase de reservas propias.
- [[panorama-competitivo]] · Vacations To Go como referente que valida la priorización de cruceros/paquetes.
- [[roadmap]] · en qué fase se activa cada vertical según el crecimiento del proyecto.
- [[legal-y-fiscal-mexico]] · obligaciones fiscales al recibir comisiones en USD desde el extranjero.

---

## Fuentes

- [[2026-06-investigacion-apis-vuelos-experiencias]]
- [[2026-06-investigacion-tesis-negocio]]
