# Adaptación del plan a tres iteraciones (propuesta pendiente de aprobación)

> **Estado: alternativa A APLICADA al tablero el 2026-11-11** por instrucción del usuario («desarrollar completo lo que pide la guía»); **pendiente de validación del equipo**. La línea base de `DOCS/04_plan_de_proyecto_y_modelos.md` **no se modifica**. Las cargas son hipótesis de capacidad (12 SP), no una velocidad medida. La alternativa B sigue descrita como opción.

## 1. Qué exige la guía, qué decía el plan y qué cambia

| Aspecto | Guía docente (p. 2) | Plan vigente (`DOCS/04`) | Qué cambia |
|---|---|---|---|
| Número de iteraciones | **3** (Sprint 1, 2 y 3; se eliminan Sprint 4–6) | **4** sprints | Un sprint menos |
| Duración | 2 semanas por sprint | 2 semanas por sprint | Nada |
| Velocidad planeada | Ejemplo: 12 SP (es **solo un ejemplo del boletería**, no el nuestro) | Hipótesis de **10 SP** por sprint | Hay que decidir si se mantiene 10 SP o se sube |
| Cargas | Ejemplo 12 / 8 / 8 SP | 10 / 8 / 7 / 8 SP | Se reparten 33 SP en 3 sprints o se deja alcance fuera |
| Puntos de cada historia | — | HU01 2, HU02 3, HU03 2, HU04 2, HU05 8, HU06 3, HU07 2, HU08 3, HU09 5, HU10 3 = **33 SP** | **No se alteran** para que encaje el cronograma |

Aritmética: 33 SP en 3 sprints exige un promedio de **11 SP por sprint**; con la hipótesis de 10 SP caben **30 SP**.

## 2. Alternativa A — las diez historias en tres sprints (capacidad 12 SP)

| Sprint | Historias | SP | Esfuerzo (8 h/SP) | Costo (45.000 COP/h) |
|---|---|---:|---:|---:|
| 1 | HU01 (2) + HU05 (8) | 10 | 80 h | 3.600.000 |
| 2 | HU06 (3) + HU07 (2) + HU08 (3) + HU02 (3) | 11 | 88 h | 3.960.000 |
| 3 | HU03 (2) + HU04 (2) + HU09 (5) + HU10 (3) | 12 | 96 h | 4.320.000 |
| **Total** | **10 historias** | **33** | **264 h** | **11.880.000** |

- El total coincide con la línea base (33 SP · 264 h · 11.880.000 COP).
- **MVP** (HU01, HU05–HU08 = 18 SP) queda completo al final del Sprint 2, igual que en el plan de cuatro sprints.
- **Dependencias respetadas:** HU02 (S2) antes de HU03/HU04 (S3); HU09 antes de HU10 dentro del S3.
- **Riesgos:** el Sprint 2 supera en 1 SP y el Sprint 3 en 2 SP la hipótesis de 10 SP; no hay velocidad medida que lo respalde. El Sprint 3 concentra una cadena de dependencias (HU03/HU04 → HU09 → HU10) sin holgura; si HU09 se retrasa, HU10 también.

## 3. Alternativa B — mantener 10 SP y dejar parte fuera de las tres iteraciones

| Sprint | Historias | SP | Esfuerzo | Costo |
|---|---|---:|---:|---:|
| 1 | HU01 (2) + HU05 (8) | 10 | 80 h | 3.600.000 |
| 2 | HU06 (3) + HU07 (2) + HU08 (3) | 8 | 64 h | 2.880.000 |
| 3 | HU02 (3) + HU03 (2) + HU04 (2) | 7 | 56 h | 2.520.000 |
| **Dentro de 3 sprints** | 8 historias | **25** | **200 h** | **9.000.000** |
| **Fuera (backlog posterior)** | HU09 (5) + HU10 (3) | 8 | 64 h | 2.880.000 |

- Ningún sprint supera 10 SP; el MVP se cierra en el Sprint 2.
- Consecuencia: las historias de **auditoría (HU09 y HU10) quedarían fuera** de la entrega de tres iteraciones. `DOCS/02` §2.2 ya advierte que, si la auditoría desde el primer día es obligatoria, HU09/HU10 deben reclasificarse a Must Have.

## 4. Decisiones que el equipo debe tomar

1. ¿A (todas las historias, capacidad hipotética de 12 SP) o B (V = 10 SP y alcance fuera)? Otra distribución también es posible.
2. Fecha de inicio real del Sprint 1 y fechas de cada iteración (no se inventan aquí).
3. Aprobación de la hipótesis de velocidad y asignación real de roles (Product Owner, Scrum Master, Developers).
4. Después de aprobar: actualizar `DOCS/04`, el tablero (iteraciones y Story Points) y los Issues de forma coherente.

## 5. Qué NO se hizo

- No se cambiaron los Story Points de las historias, las etiquetas ni los Issues. El tablero sí se configuró con la alternativa A (respaldo previo en `DOCS/evidencias/tablero_respaldo_2026-11-10.json`).
- No se simularon votaciones de Planning Poker, reuniones Scrum ni seis semanas de trabajo.
- El trabajo de código ya existente en ramas es **reversible** y no depende de esta decisión: ninguna historia cambia de puntos ni de contenido bajo A o B.
