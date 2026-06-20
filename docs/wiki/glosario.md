# Glosario

> **Tipo:** concepto  ·  **Parte de:** [[index]]

Referencia alfabetica de terminos del dominio de viajes, distribucion aerea y operacion como afiliado o agencia. Cada entrada incluye una definicion tecnica breve y un enlace a la pagina del wiki donde el concepto se aplica en detalle.

---

## A

**Afiliado**
Operador que dirige trafico hacia un proveedor mediante links rastreados y recibe una comision por cada reserva completada, sin tomar el pago del viajero ni emitir boletos. No requiere IATA, ARC ni CLIA. Ver [[modelo-de-negocio]] y [[verticales-y-economia-unitaria]].

**ARC (Airlines Reporting Corporation)**
Equivalente estadounidense del BSP de IATA. Autoriza a agencias domiciliadas en EE.UU. a emitir boletos y liquidar con mas de 240 aerolineas. Exige domicilio en EE.UU., instrumento financiero minimo de US$20,000, personal designado y autenticacion multifactor. No es la ruta logica para una operacion con base en Mexico. Ver [[acreditacion-y-host-agencies]].

**ATPCO (Airline Tariff Publishing Company)**
Principal fuente de datos de precios, tarifas y merchandising de la industria aerea. Los GDS como Travelport y Sabre reciben actualizaciones de tarifas de las aerolineas via ATPCO y via NDC. Ver [[proveedores-apis-e-inventario]].

---

## B

**BSP (Billing and Settlement Plan)**
Sistema de IATA que simplifica las liquidaciones entre agencias acreditadas y aerolineas. Una agencia con acreditacion IATA opera dentro del BSP para recibir y liquidar pagos de boletos. Alternativa al modelo afiliado donde el proveedor paga comision directamente. Ver [[acreditacion-y-host-agencies]].

---

## C

**CLIA (Cruise Lines International Association)**
Asociacion de la industria de cruceros que emite credenciales para agentes y agencias. La Individual Agent Membership (IAM) cuesta US$89-139/ano y exige estar afiliado a una agencia miembro de CLIA; CLIA recomienda haber generado al menos US$5,000 en comisiones de crucero el ano previo y mantener al menos 2 reservas comisionadas por ano. Es un requisito practico para acceder a comisiones directas de navieras. Ver [[acreditacion-y-host-agencies]] y [[verticales-y-economia-unitaria]].

**Consolidador aereo**
Mayorista de boletos con contratos privados con aerolineas que vende asientos a agentes calificados. Es una ruta alternativa a la acreditacion IATA propia: el consolidador tiene la acreditacion, el agente opera bajo ella. Amadeus menciona al consolidador como alternativa para llevar reservas a produccion sin acreditacion directa. Ver [[acreditacion-y-host-agencies]] y [[proveedores-apis-e-inventario]].

**Cookie window**
Periodo de tiempo durante el cual una conversion se atribuye al afiliado que genero el clic. Ejemplo: Viator y GetYourGuide tienen cookie window de 30 dias, Royal Caribbean de ~45 dias, Klook de 7 dias para hoteles y 30 dias para tours. Modelo predominante: last-click. Ver [[modelo-de-negocio]].

---

## D

**Datos cacheados**
Precios e inventario almacenados en cache a partir de busquedas y reservas pasadas, actualizados periodicamente (Amadeus: diariamente; Travelpayouts: hasta 7 dias). No son precios en vivo. Los endpoints de inspiracion de Amadeus (Flight Inspiration Search, Flight Cheapest Date Search) y la Data API de Travelpayouts devuelven datos cacheados; son utiles para discovery y paginas editoriales, pero requieren confirmacion en vivo antes de cualquier compra. Ver [[proveedores-apis-e-inventario]] y [[arquitectura-mvp]].

**Deal quality score**
Puntuacion editorial que combina precio absoluto, rareza relativa, tipo de vuelo (non-stop vs escalas), duracion posible de la escapada y criterios aspiracionales para determinar si una oportunidad merece ser destacada. Es una capa de scoring propia del producto, no un estandar de la industria. Ver [[arquitectura-mvp]].

---

## G

**GDS (Global Distribution System)**
Plataforma tecnologica que agrega inventario de aerolineas, hoteles, autos y otros proveedores para que agencias y OTAs puedan buscar y reservar. Los tres grandes son Amadeus, Sabre y Travelport (Galileo/Apollo/Worldspan). Distribuyen tarifas via EDIFACT historicamente y cada vez mas via NDC. El acceso enterprise requiere contrato comercial, posible PCC y acreditacion para ticketing. Ver [[proveedores-apis-e-inventario]].

---

## H

**Host agency**
Agencia acreditada (IATA/ARC) que presta su numero, relaciones comerciales y estructura a agentes independientes o startups que aun no tienen acreditacion propia. A cambio procesa comisiones y reduce la friccion de onboarding. Fora, por ejemplo, opera en Mexico desde mayo de 2025, paga en MXN y pide RFC y CURP. Es una ruta practica para vender vuelos y cruceros sin el bono IATA propio. Ver [[acreditacion-y-host-agencies]].

---

## I

**IATA (International Air Transport Association)**
Organizacion global de la industria aerea que emite acreditaciones para agencias de viajes (modalidades GoLite, GoStandard, GoGlobal). La acreditacion plena exige un bono financiero de ~US$50,000 por pais, cuota de aplicacion de ~US$1,300, anualidad de ~US$200 y un proceso minimo de 90 dias. Necesaria para emitir boletos y operar dentro del BSP. No se requiere en el modelo afiliado. Ver [[acreditacion-y-host-agencies]].

**ISR (Impuesto Sobre la Renta)**
Impuesto mexicano sobre ingresos. Un afiliado residente fiscal en Mexico debe declarar al SAT las comisiones recibidas del extranjero aunque los proveedores (Travelpayouts, Booking, Viator) normalmente no realicen retencion de ISR mexicano, ya que esa obligacion aplica a quienes pagan desde Mexico a residentes en el extranjero, no al reves. Ver [[legal-y-fiscal-mexico]].

**ISR/RESICO (Regimen Simplificado de Confianza)**
Regimen fiscal mexicano para personas fisicas con actividad empresarial con ingresos anuales hasta cierto umbral. Es una alternativa al regimen general de actividad empresarial para declarar ingresos por comisiones de afiliacion. La conveniencia de este regimen vs el general depende de la situacion fiscal especifica de cada persona. Ver [[legal-y-fiscal-mexico]].

---

## L

**Look-to-book**
Ratio entre el numero de busquedas realizadas y el numero de reservas completadas. Duffel exige mantener un maximo de 1,500:1 (es decir, no mas de 1,500 busquedas por cada reserva). Por encima de ese ratio cobra un "Excess Search fee" de US$0.005 por busqueda adicional. Esta restriccion hace que Duffel sea inadecuado para funciones de calendario de precios o destino abierto, donde el ratio de busqueda es altisimo. Ver [[proveedores-apis-e-inventario]] y [[arquitectura-mvp]].

---

## M

**MAU (Monthly Active Users)**
Usuarios activos mensuales. Metrica de trafico usada como criterio de acceso a ciertas APIs: Kiwi Tequila exige >=50,000 MAU; Skyscanner Travel API exige >100,000 visitas/mes; GetYourGuide API basica exige 100,000 visitas/mes y su API completa exige 1M visitas y 300 reservas/mes. Ver [[proveedores-apis-e-inventario]] y [[roadmap]].

**Merchant of record**
Entidad que toma el pago del cliente final, asume la responsabilidad frente al viajero y gestiona fraudes, chargebacks y reembolsos. Ser merchant of record requiere PCI DSS si se procesan tarjetas, soporte postventa y estructura legal/financiera mas robusta. En el modelo afiliado el proveedor es el merchant; el afiliado solo refiere trafico. Ver [[modelo-de-negocio]] y [[riesgos-y-preguntas-abiertas]].

---

## N

**NDC (New Distribution Capability)**
Estandar API abierto definido por IATA para que aerolineas distribuyan su contenido (tarifas, ancillaries, merchandising) directamente a agencias, OTAs y otros vendedores con logica moderna de offers and orders. Permite contenido mas rico y diferenciacion de producto respecto al modelo EDIFACT tradicional de los GDS. Duffel conecta a mas de 300 aerolineas via NDC, GDS y LCC en una sola integracion. Ver [[proveedores-apis-e-inventario]].

---

## O

**OTA (Online Travel Agency)**
Agencia de viajes online que agrega y vende inventario de multiples proveedores (vuelos, hoteles, autos, actividades, cruceros). Opera en modelo merchant (cobra al viajero y liquida al proveedor) y/o modelo agency (intermedia la reserva y recibe comision). Ejemplos: Expedia, Booking.com, Despegar. Ver [[panorama-competitivo]] y [[tesis-y-vision]].

---

## P

**PCC (Pseudo City Code)**
Identificador de cuenta que un GDS (Sabre, Travelport, Amadeus Enterprise) asigna a una agencia para operar dentro de su plataforma. Se obtiene tras firmar contrato comercial y completar certificacion. Necesario para acceso pleno al inventario y funciones de servicio (cambios, cancelaciones, emision). Ver [[proveedores-apis-e-inventario]] y [[acreditacion-y-host-agencies]].

---

## R

**RFC (Registro Federal de Contribuyentes)**
Numero fiscal mexicano asignado por el SAT. Obligatorio para personas fisicas residentes en Mexico que perciban ingresos, incluyendo comisiones de afiliacion provenientes del extranjero. Necesario para inscribirse en cualquier regimen fiscal, emitir CFDI y cumplir obligaciones ante el SAT. Ver [[legal-y-fiscal-mexico]].

**RNT/SECTUR (Registro Nacional de Turismo)**
Registro obligatorio para prestadores de servicios turisticos en Mexico, incluyendo agencias de viajes, bajo la Ley General de Turismo. Debe tramitarse dentro de los 30 dias naturales desde el inicio de operaciones. El modelo puramente afiliado (redirect sin tomar pagos) puede tener un encuadre regulatorio diferente, pero al intermediar y cobrar como agencia el registro es requerimiento legal. Ver [[legal-y-fiscal-mexico]].

---

## T

**TIDS (Travel Industry Designator Service)**
Codigo de identificacion de IATA para agencias y operadores no ticketing, gratuito desde 2024. No sustituye la acreditacion plena para emision de boletos, pero permite operar dentro del ecosistema de proveedores y en algunos casos es requisito para ciertos partners (Duffel documenta que para acceder a Qantas sin ARC/IATA propia se puede usar TIDS). Es un paso intermedio util entre el modelo afiliado puro y la acreditacion completa. Ver [[acreditacion-y-host-agencies]].

---

## W

**White Label**
Solucion tecnologica (motor de busqueda, sitio, aplicacion) construida por un proveedor y desplegada con la marca del partner. Travelpayouts ofrece un White Label Web para vuelos: low-code, gratuito, con calendario de tarifas bajas y busqueda multi-city, desplegable con marca propia. Permite ofrecer busqueda de vuelos sin necesidad de 50,000 MAU ni desarrollo propio de buscador. Ver [[arquitectura-mvp]] y [[proveedores-apis-e-inventario]].

---

## Enlaces relacionados

- [[modelo-de-negocio]] - donde se aplican los conceptos de afiliado, merchant of record y cascada de monetizacion
- [[verticales-y-economia-unitaria]] - usa terminos como comision, CLIA, cookie window y MAU en contexto de economia por vertical
- [[proveedores-apis-e-inventario]] - detalla GDS, NDC, ATPCO, Amadeus, Duffel, look-to-book y datos cacheados
- [[acreditacion-y-host-agencies]] - cubre IATA, ARC, BSP, TIDS, host agency y consolidador aereo en profundidad
- [[legal-y-fiscal-mexico]] - desarrolla RFC, ISR, RESICO, RNT/SECTUR y obligaciones del SAT
- [[arquitectura-mvp]] - aplica deal quality score, datos cacheados, white label y look-to-book en decisiones tecnicas
- [[panorama-competitivo]] - contextualiza OTA y los modelos merchant vs agency frente a competidores
- [[tesis-y-vision]] - marco donde los terminos OTA, afiliado y merchant definen el posicionamiento del producto
- [[roadmap]] - usa umbrales de MAU y visitas/mes como hitos para migrar entre proveedores de API

## Fuentes

- [[2026-06-investigacion-apis-vuelos-experiencias]]
- [[2026-06-investigacion-competir-con-ota]]
- [[2026-06-investigacion-tesis-negocio]]
