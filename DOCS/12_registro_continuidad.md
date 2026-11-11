# Registro de continuidad (material de apoyo, sin secretos)

> Corte: 2026-11-11. Las diez historias están integradas en `main`; quedan el cierre del Sprint 1 (2026-11-17) y la sustentación.

## Estado de `main`
- `main` = `2b66154`; `npm test` local: **346/346**; el código es idéntico al de `feature/issue-10-consultar-historial`.
- CI de GitHub: **en verde** en los 9 pushes a `main` (uno por cada merge).
- Issues: **10/10 cerrados**. Tablero #4: **10/10 en Done** (la automatización funcionó sin intervención).

## PR (todos con *merge commit* y base `main`)
| PR | Contenido | Merge commit |
|---|---|---|
| #11 | Soporte habilitante (capas, roles, almacenamiento, servidor, CI) | 7ff90a2 |
| #12 | HU01 | cbe9ba3 |
| #13 | HU05 | 6f5cb6a |
| #23 | Documentación del Sprint 1 y material de apoyo | 8958ba8 |
| #14 | HU06 | 7a976cc |
| #15 | HU07 | dc6491f |
| #16 | HU08 | 237f034 |
| #17 | HU02 | 1c646f7 |
| #18 | HU03 | 86578f9 |
| #19 | HU04 | 6eaeb47 |
| #20 | HU09 | 2f6bb5e |
| #21 | HU10 | 2b66154 |
| #22 | Documentación (rama antigua) | **abierto, redundante con #23** |

Todas las integraciones fueron con **autorrevisión asistida, sin revisión de pares humana**. Las ramas `chore/…`, `feature/issue-*` y `docs/*` siguen publicadas (no se borraron). Identidad de los commits: la de `alejo150224`, autorizada por el usuario; la identidad global de Git no se tocó.

## Bloqueos y pendientes
- **Burn-up y capturas:** Insights solo se configura en la web; no hay capturas en el repositorio.
- **Revisión de pares humana:** el repositorio tiene un único colaborador; habría que invitar a los compañeros.
- **Cierre del Sprint 1 (2026-11-17):** recalcular la velocidad, quitar «provisional» de `DOCS/05` y pegar el Burn-up.
- **Validación del equipo:** plan de tres sprints (alternativa A), roles y Planning Poker real (`DOCS/03`).
- **Issues #1–#10:** cerrados, pero las casillas de los criterios de aceptación siguen sin marcar (editar los Issues requiere permiso).
- **Cerrar el PR #22.**

## Cómo retomar
```bash
cd Claude-Workspace/panaautos-ingsoft
git switch main && git pull
npm test
npm start     # http://127.0.0.1:3000
```
