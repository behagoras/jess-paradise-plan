# Deep Research: APIs y feeds para Travel Paradise

**Fecha de corte: 22 de junio de 2026**

## Conclusión ejecutiva

No encontré una sola API que combine simultáneamente:

- búsqueda por presupuesto sin destino ni fecha;
- vuelos, hoteles, paquetes, actividades y cruceros;
- catálogo completo indexable localmente;
- precios y disponibilidad actualizados;
- y afiliación pública con deep links.

La arquitectura realista para Travel Paradise es una **capa propia de búsqueda inversa** sobre varias fuentes especializadas.

Los proveedores más cercanos a una búsqueda inversa nativa son:

1. **Sabre Flight Search**, para vuelos con destino, origen o fechas abiertas.
2. **Skyscanner Indicative Prices**, para exploración por rutas y fechas flexibles.
3. **Travelpayouts/Aviasales**, para destinos baratos y precios cacheados accesibles a un proyecto pequeño.
4. **LiteAPI**, para hoteles con búsqueda semántica por lenguaje natural, estilo, amenidades y tipo de viaje.
5. **Booking.com Demand API**, que está introduciendo búsqueda hotelera mediante texto natural, aunque todavía requiere parámetros estructurados.

Sabre y Skyscanner son comercialmente gated; Travelpayouts y LiteAPI son mucho más cercanos a un MVP self-service. ([Sabre Developer Hub][1])

Los mejores candidatos para construir un **índice local propio** son Hotelbeds, RateHawk, Expedia Rapid Content, Viator Full, OpenTripMap y proveedores de cruceros como Widgety y Odysseus. Sus permisos varían por campo: que puedas guardar el nombre y las amenidades no significa necesariamente que puedas guardar indefinidamente precios, disponibilidad, reviews, fotos o descripciones. ([Hotelbeds Developer Portal][2])

---

## Cómo interpretar el mapa

### Acceso

- **🟢 Self-service:** puedes registrarte o comenzar con sandbox sin negociación importante.
- **🟡 Aprobación:** puedes solicitar acceso, pero producción, catálogo completo o booking requieren revisión.
- **🔴 Enterprise:** contrato, account manager, acreditación o volumen comercial.
- **⚪ Sin API pública confirmada:** puede existir integración privada, pero no encontré documentación pública utilizable.

### Búsqueda inversa nativa

- **Alta:** permite dejar abierto destino, fechas o expresarse mediante lenguaje natural.
- **Media:** tiene filtros amplios, categorías o flexibilidad, pero todavía exige destino, región o fechas.
- **Baja:** es búsqueda tradicional o solo entrega catálogo.
- **Nula:** no es motor de búsqueda; es metadata, afiliación o conectividad.

### Cacheabilidad

Distingo entre:

- **Cache del proveedor:** la API responde desde datos precalculados, pero no necesariamente permite que Travel Paradise los almacene.
- **Cache local:** la documentación permite crear una copia o índice local.
- **Contenido estático:** nombres, fotos, descripciones y amenidades.
- **Datos volátiles:** tarifas, disponibilidad, promociones y cupo.

---

# 1. Proveedores con mayor encaje general

| Proveedor                     | Vertical                          | Acceso | Búsqueda inversa                                                                                            | Índice/cache local                                                                                                                                  | Monetización                                                                                                                                              | Evaluación                                                                                                   |
| ----------------------------- | --------------------------------- | -----: | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Travelpayouts / Aviasales** | Vuelos y afiliados                |  🟢/🟡 | **Alta** para precios baratos, destinos populares y tendencias; la búsqueda live requiere aprobación        | Los datos de inspiración son cacheados y están concebidos para páginas de contenido; la búsqueda live es efímera                                    | Deep links; Aviasales publica 40% de sus ingresos de afiliación, equivalente históricamente a alrededor de 1.1–1.3% del boleto, con atribución de 30 días | **Primera integración recomendada para vuelos** ([Travelpayouts][3])                                         |
| **LiteAPI**                   | Hoteles                           |     🟢 | **Alta dentro de hoteles:** lenguaje natural, amenidades, ratings, coordenadas, IATA y tipos de experiencia | No encontré un dump masivo público; tarifas y disponibilidad son live                                                                               | Modelo neto/comisionable; Travel Paradise puede controlar markup. No depende de cookie                                                                    | **Mejor candidato para búsquedas como “resort romántico frente al mar”** ([liteAPI][4])                      |
| **Skyscanner**                | Vuelos y hoteles                  |     🟡 | **Alta:** precios indicativos, agregación por ruta o fecha y comparación flexible                           | Los precios indicativos están cacheados por Skyscanner; no encontré derechos públicos de bulk ingest local                                          | Affiliate links, widgets y comisión flexible negociada; cookie exacta no publicada                                                                        | **Muy buen fit funcional; acceso comercial es la barrera** ([Skyscanner Developers][5])                      |
| **Sabre Flight Search**       | Vuelos                            |     🔴 | **Muy alta:** admite origen, destino o fechas abiertos y preferencias de región, actividad o experiencia    | Utiliza contenido cacheado dentro de Sabre; no implica derecho a replicarlo localmente                                                              | GDS/B2B transaccional; sin cookie clásica. Ingresos por markup, fee o comisión contractual                                                                | **La API que más se acerca al concepto puro de Travel Paradise, pero enterprise** ([Sabre Developer Hub][1]) |
| **Hotelbeds / HBX**           | Hoteles                           |  🟡/🔴 | Baja nativamente                                                                                            | **Muy alta:** Content API y Cache API para mantener contenido, precio y disponibilidad local; incluye señales de promociones, opaque y package-only | Mayorista B2B; tarifas netas o contractuales. No cookie clásica                                                                                           | **Excelente materia prima para construir el motor propio** ([Hotelbeds Developer Portal][6])                 |
| **RateHawk / ETG**            | Hoteles                           |     🟡 | Baja nativamente                                                                                            | **Muy alta:** dumps completos, personalizados e incrementales. Existen restricciones por campo para indexar fotos, descripciones y reviews          | API B2B y Affiliate; condiciones económicas privadas                                                                                                      | **Muy buen catálogo local, siempre que se modele la licencia campo por campo** ([Emerging Travel Group][7])  |
| **Expedia Rapid**             | Hoteles y expansión a actividades |     🔴 | Baja/media                                                                                                  | Permite mantener un cache local de contenido con actualizaciones incrementales; ciertas disponibilidades no pueden cachearse                        | Contrato comercial; modelos API, redirect y white-label. Comisión privada                                                                                 | **Gran opción futura cuando exista tráfico y entidad comercial** ([Expedia Group Developer Hub][8])          |
| **Viator Full**               | Actividades                       |     🟡 | Media por destino, categoría, atracción, rating y tipo de producto                                          | **Alta:** bulk ingestion y `modified-since` en Full Access                                                                                          | 8% base y cookie de 30 días; deep links y redirect                                                                                                        | **La mejor fuente indexable de experiencias** ([Viator Partner Resource Center][9])                          |
| **TourRadar**                 | Viajes organizados y circuitos    |     🟡 | Media: destino, duración, estilo y operador; no es un “anywhere” puro                                       | API con contenido, fechas y precios validados diariamente; derechos de cache sujetos al acuerdo                                                     | Links, affiliate y white-label; white-label publica hasta 6%. Una página comercial publica atribución first-click de 90 días para afiliados               | **La opción más cercana a paquetes completos listos para explorar** ([TourRadar][10])                        |
| **Widgety**                   | Cruceros                          |     🔴 | Media/alta una vez ingerido el feed                                                                         | **Alta:** itinerarios, barcos, puertos, precios por cabina, fare sets y promociones                                                                 | Feed B2B; no programa de afiliado público confirmado                                                                                                      | **Muy buen candidato para construir un “Vacations To Go” propio** ([Widgety][11])                            |
| **Odysseus Solutions**        | Cruceros                          |     🔴 | Media/alta sobre su cache                                                                                   | **Muy alta:** Cruise Data Cache en formato estandarizado, actualizado varias veces al día                                                           | Booking engine/private label; condiciones negociadas, sin cookie clásica                                                                                  | **Una de las mejores piezas para un índice local de cruceros** ([Odysseus Solutions][12])                    |
| **OpenTripMap**               | Metadata de destinos              |     🟢 | No vende viajes, pero permite descubrimiento por tipos de lugar y ubicación                                 | **Muy alta:** permite prefetchear, indexar, almacenar, cachear y modificar bajo ODbL                                                                | Sin afiliación; sirve como enriquecimiento                                                                                                                | **Base abierta recomendada para la taxonomía de destinos** ([OpenTripMap API][13])                           |

---

# 2. Vuelos flexibles e inspiración

## Travelpayouts / Aviasales

Es la opción más pragmática para el MVP.

La **Flight Data API** entrega tendencias, destinos populares y precios baratos previamente observados. Sirve para construir páginas como:

- “Destinos baratos desde CDMX”
- “Dónde viajar por menos de $8,000 MXN”
- “Vuelos baratos en los próximos meses”

La **Flight Search API** ofrece búsquedas en tiempo real más complejas, pero requiere aprobación y sus links tienen una vigencia corta. Travelpayouts también permite construir deep links con origen, destino y fechas precargadas. ([Travelpayouts][3])

**Evaluación:**

- Inversa nativa: **alta para inspiración**, menor para combinaciones completas.
- Cache local: viable para la capa de datos cacheados; se debe mantener separada de los resultados live.
- Afiliación: clara y apta para un proyecto individual.
- Riesgo: los precios de inspiración no garantizan que la tarifa continúe disponible cuando el usuario haga clic.

## Skyscanner

La **Flights Indicative Prices API** está diseñada expresamente para comparar precios en ventanas flexibles y agrupar por ruta o fecha. Skyscanner también dispone de Flights Live, Hotels Live, Hotels Indicative, Content, Reviews y Affiliate Links. ([Skyscanner Developers][5])

**Evaluación:**

- Inversa nativa: **alta**.
- Cache local: precios indicativos cacheados por Skyscanner; no encontré autorización pública para descargar el catálogo completo y crear una copia permanente.
- Afiliación: disponible mediante links, widgets y acuerdos flexibles; las condiciones precisas se definen al aprobar al partner.
- Acceso: application/partner approval. ([Skyscanner Partners][14])

## Sabre

Sabre es el hallazgo técnicamente más cercano al concepto completo de Travel Paradise. Su Flight Search API se describe como un producto de inspirational shopping y puede trabajar con origen, destino o fechas abiertas. También incorpora preferencias como región, actividad o experiencia y consulta contenido multi-source cacheado. ([Sabre Developer Hub][1])

**Evaluación:**

- Inversa nativa: **muy alta**.
- Cache local: no; el cache pertenece a la infraestructura Sabre.
- Monetización: transaccional GDS; no afiliación por cookie.
- Acceso: requiere relación comercial, PCC o account manager. ([Sabre Developer Hub][15])

## Amadeus

Flight Inspiration Search y Flight Cheapest Date trabajan sobre precios precalculados, pero la cobertura depende de pares origen-destino presentes en su cache. No reemplazan una búsqueda live completa. ([Amadeus IT Group SA][16])

El problema principal ya no es técnico: el portal Self-Service está programado para apagarse el **17 de julio de 2026** y la continuidad queda en Enterprise. Por tanto, no es una base razonable para un nuevo MVP. ([Amadeus IT Group SA][17])

## Travelport

Permite fechas flexibles y aeropuertos alternativos dentro de una distancia determinada. Sin embargo, es una flexibilidad alrededor de una búsqueda tradicional, no una búsqueda global “origen → cualquier lugar”. Su acceso es comercial/GDS. ([Travelport Support][18])

## Wego

Su Affiliate API inicia búsquedas, permite consultar resultados y redirige al usuario mediante links de Wego. Tiene restricciones importantes: las consultas deben corresponder a usuarios reales, no a recolección automatizada, y exige una relación mínima entre búsquedas y clics de salida. La compensación es variable por exit click y la atribución pública es de 30 días. ([Wego Developers Portal][19])

Esto lo vuelve útil como **metabuscador monetizable**, pero poco apropiado para construir un índice offline o ejecutar búsquedas de fondo.

## Duffel

Duffel es accesible para startups y ofrece vuelos de más de 300 aerolíneas, además de stays. Su modelo permite markup, pero su API está orientada a búsquedas origen-destino y booking, no a inspiración abierta. ([Duffel][20])

Es una buena pieza futura para checkout propio, no para resolver el descubrimiento inicial.

## Kiwi.com / Tequila

Kiwi tuvo históricamente una de las experiencias más flexibles, incluyendo búsquedas tipo nomad. Actualmente, las nuevas integraciones están sujetas a invitación o partnership, y el acceso mediante ciertos programas de afiliados exige volumen relevante, como 50,000 usuarios activos mensuales. ([Kiwi.com][21])

## Google Flights Explore

Google Flights ofrece al consumidor una experiencia “Anywhere” muy cercana a Travel Paradise. Sin embargo, en este barrido no encontré una API pública oficial para reproducir Google Flights Explore dentro de un producto externo. Debe verse como benchmark de UX, no como fuente de datos. ([Google][22])

### Decisión para vuelos

| Etapa                  | Proveedor recomendado                  |
| ---------------------- | -------------------------------------- |
| MVP individual         | Travelpayouts Flight Data + deep links |
| Aplicación paralela    | Skyscanner                             |
| Futuro enterprise      | Sabre Flight Search                    |
| Checkout propio futuro | Duffel o GDS contratado                |
| No construir sobre él  | Amadeus Self-Service                   |

---

# 3. Hoteles, resorts y all-inclusive

## LiteAPI

Es el hallazgo más interesante para la experiencia “vibe-first”. Su endpoint de tarifas puede buscar por:

- ciudad, país, coordenadas, Place ID o IATA;
- amenidades y rating;
- texto natural;
- conceptos como escapada romántica, tipo de ubicación, estilo o persona.

Puede devolver miles de hoteles con tarifas y disponibilidad live. ([liteAPI][4])

No es una búsqueda completamente abierta sin fechas, pero sí permite que Travel Paradise traduzca:

> “Quiero playa, descanso, adults only y lujo accesible”

a una consulta semántica mucho más rica que un buscador hotelero convencional.

Su modelo no depende de cookie: puede trabajar con tarifas netas, comisionables o package rates y permitir al distribuidor controlar su margen. Tiene sandbox gratuito. ([liteAPI][23])

**Limitación:** no encontré un dump masivo público equivalente al de RateHawk o Hotelbeds. Lo trataría como fuente live de rates y búsqueda semántica, no como base maestra.

## Hotelbeds / HBX

Hotelbeds destaca por tres familias:

- Booking API;
- Content API;
- Cache API.

La Cache API está pensada para que plataformas de terceros recuperen volúmenes grandes de precio y disponibilidad y mantengan un cache local. La Content API permite construir una copia de datos relativamente estáticos de hoteles. ([Hotelbeds Developer Portal][6])

También expone señales particularmente útiles para Travel Paradise:

- promociones;
- tarifas opaque;
- tarifas exclusivas para paquetes;
- disponibilidad y condiciones.

Estas señales permiten distinguir “inventario normal” de “precio utilizable como deal”. ([Hotelbeds Developer Portal][24])

El modelo es mayorista B2B. Normalmente Travel Paradise obtendría una tarifa neta o contractual y ganaría mediante margen, no mediante una cookie de afiliación.

## RateHawk / Emerging Travel Group

RateHawk ofrece:

- dumps completos semanales;
- dumps incrementales diarios;
- regiones;
- puntos de interés;
- políticas;
- amenidades;
- reviews;
- contenido por hotel.

Esto lo hace muy atractivo como catálogo maestro. ([Emerging Travel Group][25])

La restricción importante es jurídica y técnica: algunos campos internos, fotos, descripciones o reviews no pueden indexarse públicamente, aunque otros campos de contenido sí. El acuerdo debe modelarse a nivel de campo y no como un simple `cacheable=true`. ([Emerging Travel Group][7])

Producción requiere acuerdo firmado y, en algunos casos, certificación. Tiene modalidades B2B y Affiliate, pero las condiciones económicas no son públicas. ([Emerging Travel Group][26])

## Expedia Rapid

Expedia permite almacenar contenido de propiedades y mantenerlo actualizado mediante campos de alta y modificación. Es una buena solución para catálogo estático. Sin embargo, determinadas disponibilidades, como calendarios de Vrbo, tienen prohibiciones explícitas de cacheo. ([Expedia Group Developer Hub][8])

Su acceso depende de aprobación comercial. Expedia también ofrece modelos white-label con hoteles, vuelos, autos, actividades, traslados y paquetes. ([Expedia Group Developer Hub][27])

**Encaje:** alto para una fase con tracción; bajo para un MVP individual sin tráfico.

## Booking.com Demand API

La versión beta de búsqueda de alojamiento admite una consulta en lenguaje natural combinada con datos estructurados de ubicación, fechas y huéspedes. Es un avance hacia búsquedas más conversacionales, pero todavía no equivale a “tengo $20,000 y cualquier fecha”. ([Booking.com Developers][28])

Booking admite modalidades de contenido, search-look-redirect y search-look-book. Parte del contenido estático puede mantenerse localmente según la integración, pero el acceso es de partner administrado mediante contrato/account manager. ([Booking.com Developers][29])

Comisión, cookie y límites se fijan por cuenta; no encontré valores públicos universales para la API Demand actual.

## Agoda

Agoda dispone de Search API y Content/Data Services. Su CDS puede entregar itinerarios y datos para escenarios donde un partner precarga tarifas. ([Agoda Partners][30])

La documentación pública de afiliación ha mostrado comisiones progresivas aproximadamente entre 5% y 7%, pero deben confirmarse en el contrato y mercado concreto. ([Agoda Partners][31])

## Priceline Partner Solutions

Priceline ofrece APIs y private label para hoteles, vuelos y autos, con tarifas netas o comisionables. También dispone de capacidades de bundling Air + Hotel + Car. ([pricelinepartnersolutions.com][32])

Es una plataforma comercial/enterprise. No encontré derechos públicos de catálogo masivo ni una comisión/cookie universal.

## Skyscanner Hotels

Ofrece Hotel Live, Hotel Indicative, Content, Reviews y Affiliate Links. Puede ayudar a construir exploración indicativa antes de ejecutar una búsqueda live, pero sigue sujeto a aprobación de partner y no publica un derecho general de bulk ingest. ([Skyscanner Developers][33])

## Stay22

Stay22 no es una base de datos hotelera para indexar. Es una capa de monetización que transforma links o recomendaciones en deep links hacia la OTA con mayor probabilidad de conversión. También anuncia una Direct Travel API mediante partnership. ([Stay22][34])

Es útil para monetizar contenido donde Travel Paradise no tenga integración directa, no para alimentar el motor principal.

### Decisión para hoteles

La combinación más interesante sería:

1. **OpenTripMap/Wikidata o RateHawk para catálogo y clasificación.**
2. **LiteAPI para búsqueda semántica y tarifas live.**
3. **Hotelbeds o RateHawk para inventario profundo y señales de package/deal.**
4. **Expedia/Booking cuando exista acceso comercial suficiente.**

---

# 4. Paquetes vacacionales y dynamic packaging

Esta es la vertical donde menos encontré búsqueda inversa nativa y más dependencia de contratos enterprise.

La mayoría de los sistemas puede combinar vuelo, hotel y extras **después** de que el usuario elige parámetros. Pocos resuelven directamente:

> “Tengo $20,000 MXN, no sé destino ni fecha, dime qué paquete existe.”

## TourRadar

TourRadar agrega más de 50,000 viajes organizados de aproximadamente 2,500 operadores. Su API permite buscar, mostrar y reservar, y valida diariamente contenido, fechas y precios. ([TourRadar][10])

Es especialmente útil para:

- circuitos;
- expediciones;
- viajes de aventura;
- tours de varios días;
- viajes por estilo, duración o región.

No es dynamic packaging de vuelo + hotel, pero sí inventario de viaje completo y naturalmente filtrable. Ofrece affiliate links, promo codes, white-label y API. La solución white-label publica una comisión de hasta 6%; otra página de su programa publica atribución first-click de 90 días. Las condiciones finales pueden variar por canal. ([TourRadar][35])

## lastminute.com Dynamic Packaging

Su solución B2B combina vuelos, hoteles y ancillaries dentro de un sitio con marca del partner y maneja obligaciones asociadas a paquetes en mercados europeos. ([lastminute.com Investor Portal][36])

El producto consumidor muestra señales útiles como:

- “Last Minute deal”;
- vencimiento de la oferta;
- precio tachado;
- ahorro del paquete contra los componentes.

Pero no encontré un feed público para ingerir esas ofertas. Es una solución white-label/enterprise. ([lastminute.com][37])

## Hopper Technology Solutions

HTS Packages empaqueta vuelos y hoteles con descuentos y ofrece white-labels de viajes, hoteles, autos y loyalty portals. Su tecnología de predicción de precio puede ser valiosa para discovery, pero se comercializa mediante demo y acuerdo empresarial. ([HTS][38])

No encontré:

- API pública self-service;
- catálogo descargable;
- afiliación con comisión/cookie pública.

## Traveltek

Traveltek cubre vuelos, alojamiento, cruceros, tour operators, pagos y dynamic packaging. Puede combinar crucero, vuelo y hotel y ofrece APIs REST/JSON y GraphQL según el producto. ([Traveltek][39])

Tiene un fit muy alto para una plataforma madura, especialmente si Travel Paradise llega a reservar paquetes o cruceros. Su acceso es comercial.

## Travel Compositor

Permite paquetes dinámicos, circuitos fijos y viajes tailor-made, combinando vuelos, trenes, autobuses, ferries, hoteles, tickets, transfers, autos, seguros y tours. ([Travel Compositor][40])

Es un sistema SaaS para agencias, OTAs y operadores; no es una fuente afiliada self-service ni un catálogo público.

## Juniper

Juniper permite crear paquetes dinámicos, agregar transfers, actividades, seguros y autos y validar la consistencia del precio. ([Juniper Travel Technology][41])

Su ventaja es la amplitud operativa. Su desventaja para Travel Paradise es que no resuelve por sí solo el descubrimiento abierto; necesita una capa de producto encima.

## Nezasa

Nezasa combina vuelos, hoteles y actividades con pricing live/cacheado y arquitectura API-centric enterprise. ([Nezasa][42])

Es interesante para una etapa de operador o plataforma, no para una primera validación afiliada.

### Decisión para paquetes

| Necesidad                               | Opción                           |
| --------------------------------------- | -------------------------------- |
| Inventario de viajes completos para MVP | TourRadar                        |
| Vuelo + hotel white-label               | lastminute.com o HTS             |
| Plataforma de paquetes y cruceros       | Traveltek                        |
| Configuración compleja multi-producto   | Travel Compositor o Juniper      |
| Itinerarios a medida enterprise         | Nezasa                           |
| Búsqueda abierta por presupuesto        | Debe construirla Travel Paradise |

---

# 5. Tours, actividades y atracciones

## Viator

Viator continúa siendo la base más fuerte para actividades:

- Basic Access inmediato;
- Full Access mediante aprobación;
- Full + Booking mediante aprobación adicional.

Full Access permite ingestión masiva, sincronización incremental y contenido enriquecido. Basic y Full pueden monetizar mediante redirect. ([Viator Partner Resource Center][9])

Afiliación pública:

- 8% base;
- atribución de 30 días;
- deep links, widgets y API;
- aproximadamente 300,000 experiencias en 2,500 destinos. ([Viator Partner Resource Center][43])

La búsqueda inversa no es global por presupuesto. Travel Paradise tendría que recorrer destinos o trabajar sobre el catálogo ingerido y aplicar su propia clasificación.

## Tiqets

La API permite catálogo, filtros por ubicación/categoría, precios, disponibilidad, booking y webhooks. El nivel Essential ofrece acceso rápido a contenido, disponibilidad y precio; Booking API se habilita en función del desempeño, con una referencia pública aproximada de 200 órdenes mensuales. ([Tiqets Portals][44])

No encontré un permiso público tan explícito de bulk ingest como el de Viator. Una ficha pública de Travelpayouts indica aproximadamente 3.5–8% y cookie de 30 días, pero debe confirmarse en el acuerdo directo o en la red seleccionada. ([Travelpayouts][45])

## GetYourGuide

GetYourGuide mantiene infraestructura de Partner API y un programa público de afiliados con links y hasta aproximadamente 8% de comisión y atribución de 30 días. ([GitHub][46])

La API programática real continúa gated. Los umbrales concretos de tráfico que aparecían en el research inicial no fueron revalidables en una página oficial pública durante este barrido; conviene considerarlos una referencia a confirmar con Partner Support, no una regla pública garantizada.

## Klook

Klook ofrece afiliación y herramientas de partner. Páginas oficiales regionales han publicado una cookie de 30 días, mientras que la comisión concreta depende del mercado, producto y dashboard del afiliado. ([Klook Travel][47])

La API/distribución programática no tiene un camino self-service público comparable a Viator Basic.

## Musement / TUI

Musement dispone de métodos para buscar actividades por ciudad, país, categoría, actividad o venue y gestionar carrito/booking. Sin embargo, requiere contrato firmado antes de acceder al sandbox. ([Musement Partner API][48])

Es una opción de distribución B2B, no una afiliación abierta.

## Headout

Headout ofrece programa de afiliados y acceso API/sandbox mediante su plataforma de partners. Publica un catálogo de miles de actividades, pero no una comisión o cookie universal. ([Headout][49])

## GlobalTix

GlobalTix es un marketplace y channel manager API-ready con decenas de miles de productos y capacidad de crear paquetes. Es B2B y sus términos económicos son negociados. ([GlobalTix - Tech Inspired Xperiences][50])

## OCTO

OCTO no entrega inventario. Es un estándar abierto para conectar resellers y suppliers y soporta contenido, disponibilidad y booking. Su calendario de disponibilidad está pensado para rangos amplios de fechas. ([OCTO Developer Hub][51])

La capability de promociones se encontraba todavía como propuesta no ratificada a finales de 2025, por lo que no debe suponerse que todos los proveedores OCTO exponen descuentos de forma uniforme. ([OCTO Developer Hub][52])

### Decisión para actividades

- **Base principal:** Viator Full.
- **Complemento accesible:** Tiqets.
- **Aplicaciones comerciales posteriores:** Headout, Musement y GlobalTix.
- **Afiliación sin API completa:** GetYourGuide y Klook.
- **Integración directa futura con suppliers:** OCTO.

---

# 6. Cruceros

La industria de cruceros sí tiene inventario estructurado muy adecuado para Travel Paradise, pero casi toda la infraestructura programática relevante es B2B.

## Traveltek

Su Cruise API entrega:

- itinerarios;
- disponibilidad de cabinas;
- precios actuales;
- filtros;
- ordenamiento;
- paginación.

Está dirigida a agencias, OTAs, operadores y empresas tecnológicas. ([Traveltek][53])

**Cache:** no encontré una licencia pública de bulk storage; debe negociarse.

**Comercial:** enterprise, sin comisión/cookie pública.

## Widgety

Widgety agrega más de 60 líneas y expone:

- barcos y puertos;
- itinerarios;
- precios;
- disponibilidad;
- precios por interior, exterior, balcón y suite;
- fare sets;
- promociones;
- ocupación y cargos portuarios.

Es de los candidatos más cercanos a los datos necesarios para reproducir la experiencia de Vacations To Go. ([Widgety][11])

**Cache/index:** fuerte, sujeto a licencia.

**Comercial:** feed B2B; no afiliación pública confirmada.

## Odysseus Solutions

Ofrece booking engine, private label y un **Cruise Data Cache** estandarizado que se actualiza varias veces al día. ([Odysseus Solutions][12])

Este modelo permitiría:

1. descargar inventario;
2. indexarlo;
3. aplicar filtros propios;
4. ejecutar confirmación live al seleccionar la salida.

Es una de las mejores arquitecturas técnicas encontradas para cruceros.

## Revelex

Revelex ofrece API y white-label con inventario, pricing y cabinas en tiempo real, además de configuración de paquetes. Es claramente enterprise. ([Revelex][54])

## Juniper Cruise

Juniper dispone de una operación de pre-disponibilidad que trabaja sobre datos recuperados previamente y permite buscar conjuntos mucho mayores, incluso todos los cruceros de una naviera. ([Juniper API][55])

Es especialmente relevante porque valida el patrón que Travel Paradise necesita:

> cache local o preprocesado para discovery amplio, seguido de availability live.

## CruiseDirect

CruiseDirect es la mejor alternativa afiliada pública encontrada para un MVP sin integración profunda:

- 3% sobre la tarifa de crucero comisionable;
- cookie de 45 días;
- banners, links y cajas de búsqueda.

Su página menciona un data feed amplio como futuro, pero no encontré un feed/API público actualmente disponible que deba considerarse confirmado. ([CruiseDirect.com][56])

## Scenic Group

Scenic dispone de integración para información de tours/cruceros, precios, disponibilidad, reservas, promociones y assets. El acceso está orientado a advisors/partners y también puede hacerse mediante plataformas como Traveltek. ([Emerald Cruises][57])

## Cruisebound

Cruisebound tiene una experiencia de consumidor muy cercana a Travel Paradise:

- cualquier destino;
- cualquier puerto;
- cualquier fecha;
- duración;
- naviera.

La tomaría como benchmark de UX. Su sitio muestra una ruta para afiliados, pero no encontré términos oficiales detallados ni API pública confirmada. ([CRUISEBOUND][58])

### Decisión para cruceros

| Nivel                             | Estrategia                            |
| --------------------------------- | ------------------------------------- |
| MVP                               | CruiseDirect mediante affiliate links |
| Feed para índice local            | Contactar Widgety y Odysseus          |
| Booking y paquetes                | Traveltek                             |
| Plataforma enterprise alternativa | Revelex o Juniper                     |
| Benchmark de UX                   | Cruisebound                           |

---

# 7. Deals, last-minute y promociones

El hallazgo principal es que **“deal” no suele existir como una API independiente**. Normalmente es uno o varios campos dentro del inventario de cada vertical.

## Señales de deal encontradas

| Fuente         | Señales disponibles                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Travelpayouts  | Precio barato previamente encontrado, tendencia y destinos populares; no necesariamente “descuento” contractual ([Travelpayouts][3]) |
| Hotelbeds      | Promotions, package-only, opaque y condiciones de tarifa ([Hotelbeds Developer Portal][24])                                          |
| LiteAPI        | Tarifas estándar, package/net y control de markup ([liteAPI][23])                                                                    |
| lastminute.com | Last-minute label, expiración, precio tachado y ahorro del paquete ([lastminute.com][37])                                            |
| Widgety        | Fare sets, precios por categoría y promociones suministradas por la naviera ([Widgety][59])                                          |
| Scenic         | Promociones junto con precio y disponibilidad ([Emerald Cruises][57])                                                                |

En este barrido no apareció una API pública generalista de Travelzoo, Secret Escapes o un equivalente que entregue un inventario global de ofertas de todas las verticales.

Por eso Travel Paradise necesitará su propia definición de deal:

```text
deal_score =
    precio_actual_vs_histórico
  + descuento_publicado
  + rareza_del_precio
  + calidad_del_producto
  + ajuste_al_presupuesto
  + flexibilidad
  - costo_total_de_llegar
  - riesgo_de_precio_obsoleto
```

Un descuento publicado no siempre representa un buen precio. El motor debería distinguir:

- `provider_discount`: el proveedor afirma que existe descuento;
- `observed_discount`: Travel Paradise vio un precio anterior más alto;
- `market_value`: el precio es bajo frente a productos comparables;
- `package_saving`: el bundle cuesta menos que sus partes;
- `last_minute`: la salida está cercana y tiene inventario;
- `opaque_rate`: parte de la información se oculta hasta reservar.

---

# 8. Metadata de destinos y clasificación por vibe

## OpenTripMap

Es la opción abierta con mejor encaje para crear un índice propio:

- más de 10 millones de lugares;
- categorías jerárquicas;
- búsqueda geográfica;
- detalles;
- geocoding y autosuggest;
- permiso explícito para prefetchear, almacenar, indexar, cachear y modificar bajo ODbL. ([OpenTripMap API][13])

Serviría para asociar destinos con:

- playa;
- montaña;
- museos;
- vida nocturna;
- parques;
- arquitectura;
- naturaleza;
- atracciones.

## Wikidata y Wikimedia

Wikidata ofrece datos estructurados bajo CC0; Wikimedia permite reutilizar texto y medios conforme a las licencias y atribuciones correspondientes. ([Wikimedia Foundation][60])

Es una buena fuente para construir:

- jerarquía país–región–ciudad;
- aliases e idiomas;
- tipos de destino;
- historia y descripciones editoriales;
- relaciones con aeropuertos, playas y atracciones.

## Geoapify

Geoapify ofrece Places API sobre fuentes abiertas, con categorías y búsquedas por área, radio o bounding box. Tiene un nivel gratuito de aproximadamente 3,000 créditos diarios. ([Geoapify][61])

Antes de usarlo como base persistente, debe validarse el permiso de cache concreto del plan contratado.

## Google Places

Google Places tiene alta calidad live, pero prohíbe en términos generales prefetchear, cachear o almacenar contenido, salvo identificadores de lugar y excepciones específicas. ([Google for Developers][62])

No lo usaría como base de la taxonomía local. Lo reservaría para:

- autocomplete;
- validación live;
- mapas;
- enriquecimiento puntual.

## Foursquare

Foursquare ofrece acceso self-service, pero sus permisos de cache son restrictivos: planes enterprise pueden permitir cache local limitado en dispositivos, mientras que el server-side caching no está disponible de forma general. ([Foursquare Docs][63])

## Tripadvisor Content API

Tripadvisor es atractivo por volumen de reviews, pero sus términos son malos para un índice combinado:

- no cachear o almacenar contenido salvo identificadores;
- no indexarlo;
- no mezclarlo libremente con contenido de terceros;
- mantener atribución y link-back;
- no modificarlo.

Por tanto, puede enriquecer una ficha live, pero no debe ser la base de la búsqueda propia. ([Tripadvisor Content API][64])

### Decisión para destinos

- **Base local:** OpenTripMap + Wikidata.
- **Contenido editorial:** Wikimedia/Wikivoyage respetando licencias.
- **Enriquecimiento live:** Google Places.
- **Evitar como índice central:** Tripadvisor y Foursquare.

---

# 9. Comparación específica de afiliación

| Proveedor                             | Tipo                 |                                                                        Comisión pública |                         Cookie/atribución |        Deep links | Observación                                                                 |
| ------------------------------------- | -------------------- | --------------------------------------------------------------------------------------: | ----------------------------------------: | ----------------: | --------------------------------------------------------------------------- |
| Travelpayouts / Aviasales             | Afiliado             | 40% del ingreso de Aviasales; valor promedio publicado alrededor de 1.1–1.3% del boleto |                                   30 días |                Sí | Mejor combinación de acceso e inspiración para vuelos ([Travelpayouts][65]) |
| Viator                                | Afiliado/API         |                                                                                 8% base |                                   30 días |                Sí | Términos claros y API utilizable ([Viator Partner Resource Center][43])     |
| GetYourGuide                          | Afiliado             |                                                                   Hasta alrededor de 8% |                                   30 días |                Sí | API de catálogo gated ([GetYourGuide Partner Support][66])                  |
| Tiqets                                | Afiliado/API         |                                                       Referencia pública de red: 3.5–8% |                   30 días según esa ficha |                Sí | Confirmar valores en el contrato concreto ([Travelpayouts][45])             |
| TourRadar                             | Afiliado/white-label |                                              White-label hasta 6%; otros canales varían | Referencia pública de 90 días first-click |                Sí | Buen producto de alto ticket ([TourRadar][35])                              |
| CruiseDirect                          | Afiliado             |                                                               3% de tarifa comisionable |                                   45 días |                Sí | Buen puente hasta conseguir feed de cruceros ([CruiseDirect.com][56])       |
| Agoda                                 | Afiliado/API         |                                                          Escala pública aproximada 5–7% |                      Depende del programa |                Sí | Acceso API no totalmente self-service ([Agoda Partners][31])                |
| Wego                                  | CPC/exit click       |                                                                                Variable |                                   30 días |                Sí | No permite harvesting ni búsquedas de fondo ([Wego Developers Portal][19])  |
| Skyscanner                            | Afiliado             |                                                                      Flexible/negociada |               No publicada universalmente |                Sí | Requiere aprobación ([Skyscanner Partners][67])                             |
| Klook                                 | Afiliado             |                                                                                Variable |               Páginas regionales: 30 días |                Sí | Confirmar por mercado ([Klook Travel][47])                                  |
| Stay22                                | Revenue share        |                                                             No publicada universalmente |                   Depende del partner/OTA |                Sí | Útil como fallback de monetización ([Stay22][34])                           |
| Hotelbeds, LiteAPI, Duffel            | B2B/net              |                                                                         Margen o markup |                                 No aplica |      Checkout/API | No son afiliados clásicos                                                   |
| Sabre, Travelport, Traveltek, Juniper | GDS/enterprise       |                                                                             Contractual |                                 No aplica | Booking integrado | Necesitan relación comercial                                                |

---

# 10. Arquitectura recomendada para Travel Paradise

## Capa 1: Catálogo estático local

Guardar entidades relativamente estables:

```text
Destination
Hotel
Activity
CruiseShip
CruiseSailing
OrganizedTrip
Airport
PointOfInterest
SupplierProduct
```

Fuentes iniciales:

- OpenTripMap y Wikidata para destinos;
- Viator Full para experiencias;
- RateHawk o Hotelbeds para hoteles;
- Widgety u Odysseus para cruceros;
- TourRadar para viajes organizados.

## Capa 2: Política de almacenamiento por campo

Cada campo debería conocer su procedencia y permiso:

```typescript
type SourceFieldPolicy = {
  source: string;
  field: string;
  canStore: boolean;
  canIndex: boolean;
  canMixWithOtherSources: boolean;
  maxAgeSeconds?: number;
  attributionRequired: boolean;
  displayOnly?: boolean;
};
```

Esto es necesario porque proveedores como RateHawk permiten indexar determinados datos públicos, pero restringen fotos, descripciones o reviews; Expedia permite mantener contenido de propiedades, pero ciertas disponibilidades no pueden cachearse; Tripadvisor restringe almacenamiento e indexación casi por completo. ([Emerging Travel Group][7])

## Capa 3: Normalización de inventario

Un esquema común podría incluir:

```typescript
type TravelOffer = {
  source: string;
  sourceOfferId: string;
  vertical:
    | "flight"
    | "hotel"
    | "package"
    | "activity"
    | "cruise"
    | "organized_trip";

  origin?: GeoEntity;
  destinations: GeoEntity[];

  departureDate?: string;
  returnDate?: string;
  availabilityStart?: string;
  availabilityEnd?: string;
  durationNights?: number;

  priceTotal?: number;
  pricePerPerson?: number;
  originalPrice?: number;
  currency: string;
  taxesIncluded?: boolean;

  themes: string[];
  amenities: string[];
  dealTypes: string[];

  rating?: number;
  reviewCount?: number;

  bookingMode: "affiliate" | "redirect" | "api_booking" | "white_label";
  bookingUrl?: string;
  affiliateSubId?: string;

  fetchedAt: string;
  validUntil?: string;
  needsReprice: boolean;

  cachePolicyId: string;
};
```

## Capa 4: Taxonomía propia de vibes

No dependería de que cada proveedor use los mismos tags.

Travel Paradise debería normalizar a conceptos propios:

```text
beach
warm_weather
romantic
family
adults_only
all_inclusive
luxury
affordable_luxury
adventure
nature
wellness
nightlife
culture
food
weekend
last_minute
slow_travel
remote
accessible
```

Los tags pueden venir de:

- metadata del proveedor;
- amenidades;
- ubicación geográfica;
- POIs cercanos;
- descripción;
- clasificación automática;
- reglas editoriales.

## Capa 5: Consulta inversa

Una búsqueda como:

> “Playa para dos, máximo $20,000 MXN, saliendo de CDMX, cualquier fecha en los próximos tres meses”

debería transformarse en:

```json
{
  "origin": "MEX",
  "travelers": 2,
  "budgetTotalMxn": 20000,
  "dateWindow": {
    "start": "2026-06-22",
    "end": "2026-09-22"
  },
  "durationNights": {
    "min": 3,
    "max": 7
  },
  "themes": ["beach", "warm_weather"],
  "destinationOpen": true,
  "dateFlexible": true
}
```

Después:

1. generar candidatos de destino;
2. consultar vuelos indicativos;
3. estimar noches posibles;
4. consultar hoteles o paquetes;
5. añadir actividades opcionales;
6. convertir todo a MXN;
7. calcular costo total;
8. excluir resultados fuera de presupuesto;
9. reordenar por ajuste, valor y frescura;
10. ejecutar repricing live antes del click o reserva.

## Capa 6: Presupuesto total

El presupuesto no debe compararse solamente con el precio de la habitación o del boleto.

```text
costo_total =
  transporte_principal
  + alojamiento
  + impuestos
  + equipaje
  + transfers
  + actividades_incluidas
  + fees
  + margen_de_seguridad
```

Además, cada resultado debería tener un nivel de confianza:

- **Confirmado live**
- **Indicativo reciente**
- **Precio cacheado**
- **Estimado**
- **Desde**

---

# 11. Stack recomendado para el MVP

## Integraciones para empezar

### Vuelos

**Travelpayouts Flight Data API + Aviasales deep links**

Razones:

- accesibilidad;
- resultados de inspiración;
- destinos baratos;
- monetización clara;
- no requiere manejar emisión.

### Hoteles

**LiteAPI para búsqueda semántica y live rates**

Complementarlo con:

- OpenTripMap/Wikidata para destino y vibe;
- más adelante RateHawk o Hotelbeds para catálogo masivo.

### Actividades

**Viator Basic desde el inicio y solicitud de Full Access en paralelo.**

Añadir Tiqets como segunda fuente.

### Viajes organizados

**TourRadar affiliate o white-label.**

Esto permite mostrar productos completos mientras se investiga dynamic packaging.

### Cruceros

**CruiseDirect para monetización temprana**, mientras se solicitan propuestas a:

1. Widgety;
2. Odysseus;
3. Traveltek.

### Destinos

**OpenTripMap + Wikidata**, con enriquecimiento selectivo de Google Places.

---

# 12. Orden recomendado de acercamiento comercial

## Contactar de inmediato

1. **Viator Full Access**
2. **RateHawk Affiliate/API**
3. **Hotelbeds/HBX**
4. **TourRadar**
5. **Widgety**
6. **Odysseus Solutions**
7. **Skyscanner**
8. **LiteAPI**, aunque el sandbox ya permite validar
9. **Tiqets**
10. **Traveltek**

## Mantener como objetivo enterprise

1. Sabre
2. Expedia Rapid
3. Booking.com Demand API
4. Hopper Technology Solutions
5. Travel Compositor
6. Juniper
7. Nezasa
8. Revelex

## Usar como fallback de afiliación

1. Travelpayouts
2. CruiseDirect
3. Stay22
4. GetYourGuide
5. Klook
6. Wego

---

# 13. Riesgos principales

## No asumir que “API access” incluye bulk ingest

Viator distingue Basic de Full; Expedia distingue contenido cacheable de disponibilidad no cacheable; RateHawk impone restricciones por campo; Sabre y Skyscanner pueden responder desde sus propios caches sin autorizar una réplica local. ([Viator Partner Resource Center][68])

## No mezclar contenido sin revisar términos

Tripadvisor restringe expresamente almacenamiento, modificación, indexación y mezcla con fuentes de terceros. ([Tripadvisor Content API][64])

## No presentar precios indicativos como reservables

Travelpayouts, Skyscanner y Amadeus utilizan datos cacheados o precalculados para parte de sus productos de inspiración. Siempre debe existir un paso de confirmación live. ([Travelpayouts][3])

## Resolver deduplicación

El mismo hotel, actividad o crucero puede aparecer con identificadores distintos. Se necesitará entity resolution basado en:

- nombre normalizado;
- dirección;
- coordenadas;
- teléfono;
- cadena;
- IDs externos;
- barco + fecha + itinerario;
- operador + producto + duración.

## Distinguir precio por persona de precio total

Esto es especialmente crítico en:

- cruceros;
- circuitos;
- habitaciones;
- tarifas con ocupación doble;
- vuelos con equipaje;
- package rates.

---

# Recomendación final

Travel Paradise debería posicionarse como un **motor de composición y ranking**, no como un frontend dependiente de una supuesta API universal.

La combinación con mejor equilibrio para el MVP es:

```text
Travelpayouts
+ LiteAPI
+ Viator
+ Tiqets
+ TourRadar
+ CruiseDirect
+ OpenTripMap
+ Wikidata
```

Y la combinación objetivo para una plataforma madura sería:

```text
Sabre o Skyscanner
+ Hotelbeds o RateHawk
+ Expedia Rapid
+ Viator Full
+ TourRadar API
+ Widgety/Odysseus/Traveltek
+ índice propio de destinos
```

La pieza diferencial no será el inventario. Será el motor que traduzca **presupuesto + origen + flexibilidad + vibe** en destinos candidatos, estime el viaje completo, normalice múltiples verticales, compruebe disponibilidad y ordene por valor real.

[1]: https://developer.sabre.com/rest-api/flightsearch-api/v1 "https://developer.sabre.com/rest-api/flightsearch-api/v1"
[2]: https://developer.hotelbeds.com/documentation/hotels/cache-api/ "https://developer.hotelbeds.com/documentation/hotels/cache-api/"
[3]: https://travelpayouts.github.io/slate/ "https://travelpayouts.github.io/slate/"
[4]: https://docs.liteapi.travel/reference/post_hotels-rates "https://docs.liteapi.travel/reference/post_hotels-rates"
[5]: https://developers.skyscanner.net/docs/flights-indicative-prices/use-cases "https://developers.skyscanner.net/docs/flights-indicative-prices/use-cases"
[6]: https://developer.hotelbeds.com/ "https://developer.hotelbeds.com/"
[7]: https://docs.emergingtravel.com/docs/b2b-api/static-content/retrieve-hotel-dump/ "https://docs.emergingtravel.com/docs/b2b-api/static-content/retrieve-hotel-dump/"
[8]: https://developers.expediagroup.com/rapid/lodging/content/about-content-api "https://developers.expediagroup.com/rapid/lodging/content/about-content-api"
[9]: https://partnerresources.viator.com/travel-commerce/affiliate/ "https://partnerresources.viator.com/travel-commerce/affiliate/"
[10]: https://www.tourradar.com/distribution-api "https://www.tourradar.com/distribution-api"
[11]: https://widgety.org/product/cruise-api/ "https://widgety.org/product/cruise-api/"
[12]: https://www.odysseussolutions.com/cruise-solutions/ "https://www.odysseussolutions.com/cruise-solutions/"
[13]: https://dev.opentripmap.org/ "https://dev.opentripmap.org/"
[14]: https://www.partners.skyscanner.net/product/travel-api "https://www.partners.skyscanner.net/product/travel-api"
[15]: https://developer.sabre.com/product-collection/new-to-sabre/v1/setup-and-guides.html "https://developer.sabre.com/product-collection/new-to-sabre/v1/setup-and-guides.html"
[16]: https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/faq/ "https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/faq/"
[17]: https://developers.amadeus.com/ "https://developers.amadeus.com/"
[18]: https://support.travelport.com/webhelp/uAPI/Content/Air/Low_Fare_Shopping/Low_Fare_Shopping_with_Flexible_Shopping.htm "https://support.travelport.com/webhelp/uAPI/Content/Air/Low_Fare_Shopping/Low_Fare_Shopping_with_Flexible_Shopping.htm"
[19]: https://developers.wego.com/docs/affiliate/get-started/ "https://developers.wego.com/docs/affiliate/get-started/"
[20]: https://duffel.com/ "https://duffel.com/"
[21]: https://media.kiwi.com/articles-and-interviews/better-for-business-kiwi-com-takes-a-new-approach-to-partnerships/ "https://media.kiwi.com/articles-and-interviews/better-for-business-kiwi-com-takes-a-new-approach-to-partnerships/"
[22]: https://www.google.com/travel/flights "https://www.google.com/travel/flights"
[23]: https://docs.liteapi.travel/docs/revenue-management-and-commission "https://docs.liteapi.travel/docs/revenue-management-and-commission"
[24]: https://developer.hotelbeds.com/documentation/hotels/cache-api/file-specification/ "https://developer.hotelbeds.com/documentation/hotels/cache-api/file-specification/"
[25]: https://docs.emergingtravel.com/docs/b2b-api/static-content/ "https://docs.emergingtravel.com/docs/b2b-api/static-content/"
[26]: https://docs.emergingtravel.com/docs/ "https://docs.emergingtravel.com/docs/"
[27]: https://developers.expediagroup.com/docs/products/rapid/setup/getting-started "https://developers.expediagroup.com/docs/products/rapid/setup/getting-started"
[28]: https://developers.booking.com/demand/docs/open-api/3.2-beta/demand-api/accommodations/accommodations/search "https://developers.booking.com/demand/docs/open-api/3.2-beta/demand-api/accommodations/accommodations/search"
[29]: https://developers.booking.com/demand/docs/development-guide/application-flows "https://developers.booking.com/demand/docs/development-guide/application-flows"
[30]: https://partners.agoda.com/DeveloperPortal/APIDoc/SearchJsonAPIChanges "https://partners.agoda.com/DeveloperPortal/APIDoc/SearchJsonAPIChanges"
[31]: https://partners.agoda.com/ "https://partners.agoda.com/"
[32]: https://pricelinepartnersolutions.com/ "https://pricelinepartnersolutions.com/"
[33]: https://developers.skyscanner.net/docs/intro "https://developers.skyscanner.net/docs/intro"
[34]: https://www.stay22.com/allez "https://www.stay22.com/allez"
[35]: https://www.tourradar.com/white-label-solution "https://www.tourradar.com/white-label-solution"
[36]: https://corporate.lastminute.com/your-travel-revenue-powered-by-lastminute-com/ "https://corporate.lastminute.com/your-travel-revenue-powered-by-lastminute-com/"
[37]: https://www.lastminute.com/terms/useful-information "https://www.lastminute.com/terms/useful-information"
[38]: https://hts.hopper.com/ "https://hts.hopper.com/"
[39]: https://www.traveltek.com/products/dynamic-packaging/ "https://www.traveltek.com/products/dynamic-packaging/"
[40]: https://travelcompositor.com/en/solutions/dmc/ "https://travelcompositor.com/en/solutions/dmc/"
[41]: https://ejuniper.com/en/products/juniper-booking-engine/modules/vacation-packages/ "https://ejuniper.com/en/products/juniper-booking-engine/modules/vacation-packages/"
[42]: https://nezasa.com/dynamic-packaging/ "https://nezasa.com/dynamic-packaging/"
[43]: https://partnerresources.viator.com/ "https://partnerresources.viator.com/"
[44]: https://portals.tiqets.com/distributorapi/docs "https://portals.tiqets.com/distributorapi/docs"
[45]: https://www.travelpayouts.com/en/offers/tiqets-affiliate-program "https://www.travelpayouts.com/en/offers/tiqets-affiliate-program"
[46]: https://github.com/getyourguide/partner-api-spec "https://github.com/getyourguide/partner-api-spec"
[47]: https://www.klook.com/partner/ "https://www.klook.com/partner/"
[48]: https://partner-api.musement.com/api/getting-started "https://partner-api.musement.com/api/getting-started"
[49]: https://partner.headout.com/distribution/ "https://partner.headout.com/distribution/"
[50]: https://globaltix.com/api-ready/ "https://globaltix.com/api-ready/"
[51]: https://docs.octo.travel/capabilities-optional/content "https://docs.octo.travel/capabilities-optional/content"
[52]: https://docs.octo.travel/capabilities-optional/promotions-in-dev "https://docs.octo.travel/capabilities-optional/promotions-in-dev"
[53]: https://www.traveltek.com/travel-api-provider/cruise-api/ "https://www.traveltek.com/travel-api-provider/cruise-api/"
[54]: https://www.revelex.com/en/solutions/cruise "https://www.revelex.com/en/solutions/cruise"
[55]: https://api-edocs.ejuniper.com/en/api/jp/cruise-api "https://api-edocs.ejuniper.com/en/api/jp/cruise-api"
[56]: https://www.cruisedirect.com/affiliates "https://www.cruisedirect.com/affiliates"
[57]: https://emerald.cruises/US/en-US/travel-advisor-hub/scenic-group-api "https://emerald.cruises/US/en-US/travel-advisor-hub/scenic-group-api"
[58]: https://www.cruisebound.com/ "https://www.cruisebound.com/"
[59]: https://widgety.org/2017-8-8-introducing-the-version-2-of-the-cruises-api/ "https://widgety.org/2017-8-8-introducing-the-version-2-of-the-cruises-api/"
[60]: https://foundation.wikimedia.org/wiki/TOU "https://foundation.wikimedia.org/wiki/TOU"
[61]: https://www.geoapify.com/places-api/ "https://www.geoapify.com/places-api/"
[62]: https://developers.google.com/maps/documentation/places/web-service/policies "https://developers.google.com/maps/documentation/places/web-service/policies"
[63]: https://docs.foursquare.com/developer/reference/usage-guidelines-personalization-apis "https://docs.foursquare.com/developer/reference/usage-guidelines-personalization-apis"
[64]: https://tripadvisor-content-api.readme.io/reference/caching-policy "https://tripadvisor-content-api.readme.io/reference/caching-policy"
[65]: https://www.travelpayouts.com/en/offers/aviasales-affiliate-program "https://www.travelpayouts.com/en/offers/aviasales-affiliate-program"
[66]: https://partner.getyourguide.support/hc/en-us/articles/23082933149981-How-to-get-started-with-the-Affiliate-Program-as-a-Creator "https://partner.getyourguide.support/hc/en-us/articles/23082933149981-How-to-get-started-with-the-Affiliate-Program-as-a-Creator"
[67]: https://www.partners.skyscanner.net/product/affiliates "https://www.partners.skyscanner.net/product/affiliates"
[68]: https://partnerresources.viator.com/travel-commerce/levels-of-access/ "https://partnerresources.viator.com/travel-commerce/levels-of-access/"
