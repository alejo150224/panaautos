# Registro de continuidad (material de apoyo, sin secretos)

> Corte: 2026-11-11. El lote del Sprint 1 (#11, #12, #13) está integrado en `main`; los demás PR siguen en borrador.

## Estado Git (pila de ramas; cada una parte de la anterior)

| # | Rama | Commit | Base | Pruebas acumuladas |
|---|---|---|---|---:|
| 0 | `chore/soporte-arquitectura-tres-capas` | ab80d28 | `main` (a3a8add) | 61 |
| 1 | `feature/issue-1-consultar-inventario` | 54f2cbd | 0 | 82 |
| 2 | `feature/issue-5-registrar-venta` | 41d7d95 | 1 | 149 |
| 3 | `feature/issue-6-registrar-solicitud` | da07f77 | 2 | 184 |
| 4 | `feature/issue-7-consultar-solicitudes` | d0f4fe4 | 3 | 198 |
| 5 | `feature/issue-8-actualizar-estado-solicitud` | 7d2aa95 | 4 | 223 |
| 6 | `feature/issue-2-registrar-propuesta` | e2de143 | 5 | 262 |
| 7 | `feature/issue-3-aprobar-propuesta` | e0bba3a | 6 | 274 |
| 8 | `feature/issue-4-rechazar-propuesta` | 966a972 | 7 | 288 |
| 9 | `feature/issue-9-registro-automatico-acciones` | e7124c7 | 8 | 314 |
| 10 | `feature/issue-10-consultar-historial` | 6eddc45 | 9 | 346 |
| 11 | `docs/gestion-agil-informe-y-matriz` | ver `git log` | 10 | 346 |

Orden de integración propuesto: 0 → 1 → … → 11 (siguiendo la numeración). Al integrar cada uno, el PR siguiente debe re-apuntarse a `main`.

Identidad de los commits: configurada solo en el repo local (autorizada por el usuario); la identidad global de Git no se tocó.

## Archivos modificados (resumen)

Código en `src/` (50 archivos JS + HTML/CSS), 14 suites en `tests/`, `.github/workflows/ci.yml`, `package.json`, `.gitignore`, `DOCS/05–12`, `README.md`.

## Pruebas ejecutadas

`npm test` local, 2026-11-10 (ramas) y 2026-11-11 (`main`: 149/149), Node v22.14.0: 346/346 en la punta y verde en cada rama (detalle en `DOCS/evidencias/registro_pruebas.md`). **CI de GitHub: 3 ejecuciones en verde sobre `main`.**

## PR

3 PR integrados (#11, #12, #13; merge commit) y 9 siguen en **borrador** (#14–#22), apilados (base = rama anterior). Abiertos el 2026-11-10 en `alejo150224/panaautos`:

| PR | Rama | Base |
|---|---|---|
| #11 | `chore/soporte-arquitectura-tres-capas` | `main` · **integrado** (7ff90a2) |
| #12 | `feature/issue-1-consultar-inventario` | `main` (re-apuntado) · **integrado** (cbe9ba3) |
| #13 | `feature/issue-5-registrar-venta` | `main` (re-apuntado) · **integrado** (6f5cb6a) |
| #14 | `feature/issue-6-registrar-solicitud` | #13 |
| #15 | `feature/issue-7-consultar-solicitudes` | #14 |
| #16 | `feature/issue-8-actualizar-estado-solicitud` | #15 |
| #17 | `feature/issue-2-registrar-propuesta` | #16 |
| #18 | `feature/issue-3-aprobar-propuesta` | #17 |
| #19 | `feature/issue-4-rechazar-propuesta` | #18 |
| #20 | `feature/issue-9-registro-automatico-acciones` | #19 |
| #21 | `feature/issue-10-consultar-historial` | #20 |
| #22 | `docs/gestion-agil-informe-y-matriz` | #21 |

**CI de GitHub:** al integrar #11 el workflow quedó registrado en `main` y ejecutó `npm test` en 3 pushes (runs 43059538428, 43059578124 y 43059601019), **todos en verde**. Antes no había ejecuciones porque el workflow no estaba en la rama por defecto.

## Bloqueos

- Scope `project` autorizado por el usuario el 2026-11-10; el tablero #4 se leyó (`DOCS/evidencias/tablero_2026-11-10.md`) sin modificarlo.
- Insights/Burn-up solo se configuran en la interfaz web (la API no los expone).
- El tablero se configuró el 2026-11-11 con permiso del usuario (3 sprints, Story Points, iteraciones, tarjetas en In review); respaldo previo en `DOCS/evidencias/tablero_respaldo_2026-11-10.json`.
- La integración en `main` y el cambio de planificación requieren aprobación expresa.

## Próxima acción

1. Al llegar el Sprint 2, integrar #14–#16 y #17 (re-apuntando cada PR a `main`, en orden) con aprobación expresa; revisión humana real si el equipo la exige.
2. Decidir A/B de `DOCS/07`.
3. Configurar el Burn-up en Insights y tomar capturas auténticas (el lote del Sprint 1 ya está integrado).

## Cómo retomar

```bash
cd Claude-Workspace/panaautos-ingsoft
git switch docs/gestion-agil-informe-y-matriz
npm test
```
