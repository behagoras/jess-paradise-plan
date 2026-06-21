# Decisiones de entrevista (2026-06-21)

> **Tipo:** registro de decisiones · **Parte de:** [[index]] · **Estado:** working notes a reconciliar con el trabajo local sin commitear de la sesión previa.

Este documento captura las decisiones tomadas en la sesión de entrevista de arquitectura del 21 de junio de 2026. Reencuadra varias piezas del modelo de "proyecto" respecto al handoff previo. Idioma español, sin em dashes, por preferencia del fundador.

---

## Reencuadre central: el proyecto es una vibra, no un viaje con fecha

La pieza que cambia todo: un **proyecto no es un viaje con fecha**, es una **vibra persistente** ("playas", "montaña", "explorar en general"). No expira. Lo que sí caduca son los deals concretos que coleccionas dentro, no la vibra.

En vista de proyecto solo ves los deals de esa vibra; en vista general ves todo. Los proyectos se pueblan estilo Tinder (swipe), con tres alcances de swipeo: un proyecto solo, general (todo), o la unión de todos tus proyectos.

---

## Modelo de proyecto

1. **Multiplicidad:** muchos proyectos, uno activo a la vez como lente del feed. Cambiar de proyecto cambia el feed. Mantiene una sola intención activa (un solo reverse index), lo que hace legible el ranking.

2. **Proyecto = lente, no carpeta.** Hay un solo pool de likes. Un proyecto es una vibra-filtro con nombre sobre ese pool y sobre el feed entrante. Un deal de playa-y-gastronomía aparece en ambas lentes sin duplicarse. No hay `savedDealIds[]` por proyecto ni relación muchos-a-muchos. Consecuencia gratis: al crear una lente nueva ("playas"), jala automáticamente todos los likes pasados que matchean.

3. **Cajón único permanente.** Sin proyecto creado por el usuario, todo save cae a "explorando" (vista general sin filtro). El sistema nunca inventa proyectos solo; promover a proyecto real es una acción confirmada por el usuario.

4. **Naming auto, editable.** El nombre se genera de la señal (vibras), editable. En Corte 2 el LLM puede dar títulos más ricos.

5. **No expiran.** Como son vibras y no viajes con fecha, los proyectos no caducan.

---

## Vibe check: tres momentos

- **Cold-start:** seed ligero al arrancar para saber dónde empezar a swipear.
- **Nudge adaptativo:** aparece cuando el sistema duda de la señal (poca o dispersa).
- **Nudge de promoción:** cuando detecta un cluster ("ya llevas muchos likes de playa"), ofrece crear esa vibra como proyecto. Lo inicia el sistema, lo confirma el usuario.

---

## El swipe como interacción primaria

6. **Semántica suave / acumulativa.** Like sube el peso de la vibra, pass lo baja, pero nada se oculta para siempre. El feed se inclina, no se amputa. Un pass es "ahorita no", no "nunca". Protege la serendipia, que es el alma de la tesis (lujo por flexibilidad).

7. **Doble loop de aprendizaje.** No solo el sistema aprende del usuario; el usuario aprende sus propios gustos al swipear (modelo Tinder). Esto se materializa en un **perfil de viajero vivo y accesible** donde la persona ve sus likes acumulados.

8. **Tarjetas tipadas.** El feed intercala tipos de tarjeta, cada uno con su señal:
   - **Destino / vibra:** deseo de lugar.
   - **¿Buen precio?:** calibra el umbral de precio personal de ESTE usuario (ej. "vuelo a Cozumel por 10 mil, ¿buen precio?"). Esto hace el `deal_score` personal sin ML todavía.
   - **Experiencia:** deseo de actividad (Viator), a veces sin precio.

9. **Vocabulario de respuesta según el tipo de tarjeta:** puede ser sí/no, binario, o escala graduada. No se fuerza un solo gesto para todo. La respuesta condicional ("depende del precio") es señal valiosa: marca deseo alto con gatillo de precio, candidato natural a alerta.

---

## Señal vs viajes reales: dos pistas separadas

10. **Dos pistas separadas.**
    - **Tarjetas de señal** (vibra / precio / experiencia): solo afinan el perfil y el ranking. No crean viajes.
    - **Tarjetas de deal completo y real:** su acto es "agregar el viaje a la lista". Solo estas crean viajes reales guardados.
    - Existe una **vista de todos los viajes reales juntos**.
    - Así nadie confunde "me latía bucear" (deseo) con "tengo este viaje guardado" (candidato accionable).

---

## Experiencias (Viator): la monetización real

11. **Attach + feed propio.** Las experiencias aparecen como attach dentro del detalle de un viaje (por destino) Y como su propio feed reservable independiente del vuelo. Cubre al que ya tiene vuelo o ya vive cerca y solo quiere la experiencia. Maximiza el 8% de comisión, que vale más que el ~1.5% del vuelo.

---

## Impacto en el modelo de datos (Convex)

Respecto al esquema emergente del handoff, esta sesión implica:

- `projects`: deja de tener `savedDealIds[]`, `durationNights`, `flexibility`, ventana de fechas como identidad. El proyecto es ` { name, vibes[], status }`, una lente persistente.
- Pool único de likes/señal separado de la lista de viajes reales.
- `events` / señal de swipe se enriquece: nuevo evento `pass` (descarte), y eventos tipados por tarjeta (vibra, precio, experiencia) con respuesta posiblemente graduada o condicional ("depende del precio").
- Nueva entidad o vista: **viajes reales** (deals completos agregados a la lista), distinta del pool de señal.
- **Perfil de viajero**: agregación derivada de la señal, accesible al usuario.

---

## Ramas que siguen abiertas

- Alertas (rama 4): el "depende del precio" es el gatillo natural. Canal, umbral, frecuencia, anti-spam. Nota: elegimos "dos pistas separadas" (sin puente auto deseo→viaje), así que la alerta notifica sin auto-agregar.
- `deal_score` proxy (rama 5): fórmula exacta, ahora con componente personal (umbral aprendido por tarjetas de precio).
- Schema de `events` y pesos de la señal de aprendizaje (rama 6).
- Honestidad de frescura en UI (rama 7).
- Orden de build del Corte 1 (rama 8).
