# Legal y Fiscal Mexico

> **Tipo:** concepto  ·  **Parte de:** [[index]]

Este documento cubre el marco legal y fiscal relevante para operar [[modelo-de-negocio|el negocio]] desde Mexico: que puedes hacer como afiliado sin necesidad de ser agencia formal, donde se cruza la linea hacia la figura regulada, y como manejar tu situacion fiscal como residente en Mexico que cobra comisiones del exterior.

---

## Lo que SI puedes hacer como afiliado (sin ser agencia)

En modo afiliado puro, muestras resultados de busqueda o inspiracion, comparas precios, publicas contenido y redirigis al usuario al sitio del proveedor con tu link. No tomas pagos del viajero, no emites boletos ni vouchers a tu nombre, y no eres el merchant of record. Cobras comision por referir trafico.

Bajo esa definicion operativa, **no necesitas IATA, ARC ni CLIA** para empezar. El bloqueo historico de la acreditacion IATA (un bono promedio de aproximadamente USD 50,000 por pais, una cuota de aplicacion de aproximadamente USD 1,300, anualidad de aproximadamente USD 200 y no menos de 90 dias de tramite) aplica solo cuando migras a reservas propias con emision de boletos.

Esta fase de afiliacion es la entrada logica descrita en [[tesis-y-vision]] y sostiene la primera etapa del [[roadmap]].

---

## Donde se cruza la linea hacia agencia formal

La transicion de afiliado a operador regulado ocurre cuando:

- **Tomas el pago del cliente** directamente (eres merchant of record).
- **Emites la confirmacion o boleto a tu nombre** y asumes responsabilidad frente al viajero.
- **Manejas dinero del viajero** como anticipo o deposito.
- Ofreces servicios turísticos de forma organizada bajo tu marca y cobras al usuario final (y no solo una comision del proveedor).

En ese momento entras en la definicion de prestador de servicios turisticos bajo la legislacion mexicana y la carga regulatoria aumenta de forma significativa.

### Ley General de Turismo y RNT

La Ley General de Turismo establece que los prestadores de servicios turisticos deben inscribirse en el **Registro Nacional de Turismo (RNT/SECTUR)** dentro de los 30 dias naturales siguientes al inicio de operaciones. La ventanilla oficial del RNT y su consulta publica estan activas en linea.

### PROFECO y contrato al usuario

La **PROFECO** (Procuraduria Federal del Consumidor) establece que una agencia que contrata con el usuario final debe entregarle un contrato. Existen modelos y registros publicos de contratos de adhesion relacionados con servicios turisticos. Si en algun momento ofreces paquetes o reservas directas bajo tu marca, el contrato al usuario y el cumplimiento de proteccion al consumidor dejan de ser opcionales.

Mientras te mantengas como capa de descubrimiento y redireccion, el encuadre regulatorio es considerablemente mas liviano, aunque conviene verificarlo con un abogado especializado en turismo y consumidor antes de lanzar.

---

## Fiscal: residente en Mexico que cobra del exterior

### RFC y figura tributaria

Como **residente fiscal en Mexico** (casa habitacion en territorio nacional), debes inscribirte en el **RFC** ante el SAT y declarar tus ingresos mundiales, incluyendo las comisiones de afiliado que vengan del exterior. Mexico tiene tratados para evitar doble tributacion con varios paises.

Las dos figuras mas comunes para empezar son:

- **Persona fisica con actividad empresarial:** aplica cuando el nivel de ingresos o la naturaleza de la actividad no encaja en el regimen simplificado.
- **RESICO (Regimen Simplificado de Confianza):** tasa reducida y declaracion mas sencilla si calificas (ingresos anuales bajo el umbral y actividad elegible). Confirma con un contador si tu actividad de afiliados califica.

Para tramitar tu RFC necesitas tu **CURP**. El CURP no se entrega a las plataformas extranjeras; es solo para tus tramites ante el SAT.

### Retencion de ISR: las plataformas extranjeras normalmente no retienen

Las plataformas como Travelpayouts, Booking, Viator o GetYourGuide **no son residentes en Mexico** y en el escenario tipico no te retienen ISR mexicano. La logica es la siguiente: el Titulo V de la LISR aplica a quien paga desde Mexico a un residente en el extranjero (fuente de riqueza en territorio nacional). En tu caso ocurre lo opuesto: tu eres el residente mexicano que recibe del extranjero. Por tanto, la obligacion de calcular y enterar el ISR es tuya directamente ante el SAT; los proveedores extranjeros no lo hacen por ti.

Esto significa que **debes declarar y pagar tu propio ISR** sobre las comisiones recibidas. No asumir que las plataformas ya lo descuentan.

### CFDI

Si estas dado de alta en el SAT con actividad empresarial, debes emitir **CFDI** por tus ingresos. Cuando el pagador es una empresa extranjera y no exige factura mexicana, la practica comun es emitir el CFDI a tu propio RFC como "ingreso global", pero la forma correcta depende de tu situacion concreta. Esto es otro motivo por el que un contador especializado es indispensable.

### Cobro en USD via PayPal o Payoneer

En la practica, la mayoria de plataformas paga en **USD o EUR**. Los metodos mas accesibles desde Mexico son:

- **PayPal:** Travelpayouts (umbral USD 50, cubre la comision de envio), Viator (semanal sin minimo), GetYourGuide (mensual).
- **Payoneer:** da datos bancarios en USD/EUR para recibir transferencias; fees de hasta aproximadamente 3% por conversion de divisa y aproximadamente USD 1.50 flat al enviar USD. CJ Affiliate usa Payoneer o deposito directo.
- **Transferencia bancaria:** Travelpayouts (umbral USD/EUR 400), Booking (umbral USD/EUR 100).

Al retirar a tu cuenta bancaria en Mexico conviertes a MXN. Esa conversion genera un tipo de cambio que debes registrar para efectos fiscales (el SAT reconoce el tipo de cambio publicado por el Banco de Mexico).

### Cuando pases a reservas propias (merchant)

Al convertirte en merchant of record el panorama fiscal cambia de forma importante: ya no recibes solo comision sino ingresos brutos del cliente, lo que implica **IVA, CFDI por cada venta al consumidor, manejo de anticipos y reembolsos** y posiblemente la conveniencia de constituir una persona moral. En esa etapa, operacion afiliada y operacion merchant no se tratan igual ante el SAT.

---

## Acreditacion y figura de host agency

Si quisieras dar el salto a emitir boletos de vuelo sin obtener tu propia acreditacion IATA, la alternativa mas practica es usar el **Managed Content de Duffel** (presta sus 5 acreditaciones IATA globales) o bien colgarte de una **host agency**. Fora opera en Mexico desde mayo de 2025, paga comisiones en MXN y solicita RFC y CURP para pagos; es un ejemplo de host que reduce la friccion de onboarding para operadores nuevos.

Para cruceros con navieras la membresía **CLIA** (Individual Agent Membership) es el equivalente: USD 89 a USD 139 por ano segun el nivel, con requisito de haber generado al menos USD 5,000 en comisiones de crucero el ano previo y mantener al menos 2 reservas comisionadas por ano para renovar.

Estos temas se desarrollan con mas detalle en [[acreditacion-y-host-agencies]].

---

## FTC Disclosure

Si tu audiencia incluye usuarios en Estados Unidos (o publicas contenido en ingles accesible desde ese mercado), las reglas de divulgacion de la **FTC (Federal Trade Commission)** aplican de facto: debes revelar de forma clara y prominente que los links de tu sitio son de afiliado y que recibes comision por las reservas. La formula exacta puede ser tan simple como un aviso visible al inicio de cada pagina con links de afiliado o una politica de disclosure accesible desde el footer.

Aunque no tengas presencia legal en Estados Unidos, las plataformas de afiliados (Travelpayouts, CJ, Impact, Awin) pueden darte de baja si violas los terminos de disclosure. Es un riesgo operativo real, no solo legal.

---

## Recomendacion practica

El orden recomendado para no acumular deudas regulatorias desde el inicio:

1. **Tramita tu RFC antes de recibir el primer pago.** No esperes a tener ingresos relevantes; darte de alta cuesta cero y evita sanciones por inicio tardio.
2. **Elige figura tributaria con un contador.** RESICO vs actividad empresarial depende de tu situacion; no lo resuelvas solo con googling.
3. **Lleva un registro en MXN de cada pago recibido en USD**, usando el tipo de cambio del dia de cobro (Banco de Mexico).
4. **Mantente en modo afiliado puro** mientras el producto no justifique asumir la carga operativa y regulatoria de ser merchant of record.
5. **Antes de escalar a reservas propias**, revisa con abogado especializado en turismo si tu modelo requiere RNT/SECTUR y que documentacion contractual debes tener con el usuario.

---

## Enlaces relacionados

- [[modelo-de-negocio]] la fase afiliada es la primera etapa del modelo y define por que el encuadre regulatorio empieza siendo liviano.
- [[acreditacion-y-host-agencies]] cubre IATA, ARC, CLIA, host agencies y TIDS en detalle; este documento solo resume las implicaciones legales de cada transicion.
- [[verticales-y-economia-unitaria]] las comisiones por vertical (vuelos, experiencias, cruceros) determinan los montos que declararas al SAT.
- [[proveedores-apis-e-inventario]] los proveedores (Travelpayouts, Duffel, Viator, etc.) son quienes emiten los pagos en USD que debes declarar.
- [[riesgos-y-preguntas-abiertas]] incluye riesgos regulatorios y la recomendacion de validar el encuadre legal antes de escalar.
- [[tesis-y-vision]] define que el proyecto arranca como capa de descubrimiento (afiliado), lo que determina el perfil legal inicial descrito aqui.

---

## Fuentes

- [[2026-06-investigacion-competir-con-ota]]
- [[2026-06-investigacion-apis-vuelos-experiencias]]
