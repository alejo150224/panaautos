# Registro de continuidad (material de apoyo, sin secretos)

> Corte: 2026-11-10. Ramas publicadas y PR en borrador abiertos.

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

`npm test` local, 2026-11-10, Node v22.14.0: 346/346 en la punta y verde en cada rama (detalle en `DOCS/evidencias/registro_pruebas.md`). **CI de GitHub: sin ejecuciones registradas al corte (por verificar en la pestaña Actions).**

## PR

12 PR en **borrador**, apilados (base = rama anterior), abiertos el 2026-11-10 en `alejo150224/panaautos`:

| PR | Rama | Base |
|---|---|---|
| #11 | `chore/soporte-arquitectura-tres-capas` | `main` |
| #12 | `feature/issue-1-consultar-inventario` | #11 |
| #13 | `feature/issue-5-registrar-venta` | #12 |
| #14 | `feature/issue-6-registrar-solicitud` | #13 |
| #15 | `feature/issue-7-consultar-solicitudes` | #14 |
| #16 | `feature/issue-8-actualizar-estado-solicitud` | #15 |
| #17 | `feature/issue-2-registrar-propuesta` | #16 |
| #18 | `feature/issue-3-aprobar-propuesta` | #17 |
| #19 | `feature/issue-4-rechazar-propuesta` | #18 |
| #20 | `feature/issue-9-registro-automatico-acciones` | #19 |
| #21 | `feature/issue-10-consultar-historial` | #20 |
| #22 | `docs/gestion-agil-informe-y-matriz` | #21 |

**CI de GitHub:** Actions está habilitado y el workflow está en las ramas, pero al corte GitHub no registraba ejecuciones en estos PR. Resultado **por verificar** en la pestaña *Checks*/*Actions*. Si no aparece, revisar que el workflow se haya registrado (puede requerir que exista en `main`).

## Bloqueos

- Token `gh` sin scope `project` → sin acceso a GitHub Projects (requiere `gh auth refresh -s project`, acción del usuario).
- La plantilla "Iterative development" solo se selecciona en la interfaz web.
- La integración en `main` y el cambio de planificación requieren aprobación expresa.

## Próxima acción

1. Revisar los PR en borrador (revisión humana real) y decidir el orden de integración; la integración en `main` requiere aprobación expresa.
2. Decidir A/B de `DOCS/07`.
3. Configurar el tablero y tomar capturas auténticas.

## Cómo retomar

```bash
cd Claude-Workspace/panaautos-ingsoft
git switch docs/gestion-agil-informe-y-matriz
npm test
```
