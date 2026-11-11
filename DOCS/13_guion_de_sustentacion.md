# Guion de sustentación (material de apoyo)

> Propuesta de **~12 minutos**; ajusta los tiempos a lo que indique el profesor. Los roles son los de sustentación del README (Product Owner, Líder Técnico, Desarrolladores 1 y 2); los nombres se completan en equipo. **Diga cada persona solo lo que realmente entiende** (`DOCS/10`).

## 0. Una hora antes: lista de verificación
- [ ] `node -v` ≥ 22 en la máquina que se usará.
- [ ] Clon limpio y pruebas: `git clone https://github.com/alejo150224/panaautos.git && cd panaautos && npm test` → **346/346**.
- [ ] Datos limpios: `npm run demo:reiniciar`, luego `npm start` y abrir http://127.0.0.1:3000 (plan B sin archivos: `npm run start:memoria`).
- [ ] Pestañas abiertas en este orden: tablero (https://github.com/users/alejo150224/projects/4; es **privado**: iniciar sesión con la cuenta correcta) → PR #13 → Issue #5 → Actions → Insights (Burn-up) → la aplicación.
- [ ] Carpeta `DOCS/evidencias/capturas/` abierta, por si falla internet o el inicio de sesión (**plan B**).
- [ ] Cargador, internet y proyector probados.

## 1. Orden de la presentación
| Min | Rol | Qué decir | Qué mostrar |
|---|---|---|---|
| 0–1 | Product Owner | PANA AUTOS, los problemas P-01…P-05 y el MVP (HU01, HU05, HU06, HU07, HU08 = 18 SP) | `README` o `DOCS/01` |
| 1–3 | Líder Técnico | Story Points con Fibonacci, historia pivote HU01 = 2 SP, 33 SP en total, 8 h/SP; del plan de 4 sprints a los 3 de la guía (`DOCS/07`) | Tabla del tablero (Story Points y Sprint) |
| 3–5 | Desarrollador 1 | Trazabilidad: Issue → rama → PR con `Closes #N` → Done automático | PR #13 integrado, Issue #5 con criterios marcados, Actions en verde |
| 5–7 | Líder Técnico | Tres capas, DAO, Facade, JSDoc, responsabilidad única; la transacción de `registrarVenta` | Carpeta `src/` y `VentaController.registrarVenta` |
| 7–10 | Desarrollador 2 | Demostración en vivo (sección 2) | La aplicación |
| 10–11 | Product Owner / Líder | Métricas: Vreal = 10 SP, 100 % del Sprint 1; Burn-up; 23 SP adelantados | Burn-up de Insights |
| 11–12 | Todos | Limitaciones y qué sigue; preguntas | `DOCS/11` |

## 2. Demostración en vivo (≈3 minutos)
1. **Sin sesión → Catálogo público:** «Me interesa» en un vehículo, enviar solo el nombre → error «Debe completar al menos un medio de contacto»; añadir un correo → confirmación (**HU06**).
2. **Laura (Vendedor) → Solicitudes:** ver el detalle y cambiar el estado a «En negociación» (**HU07 y HU08**).
3. **Laura → Inventario → Registrar venta** del vehículo 2 con un cliente y «Contado»: el vehículo pasa a **Vendido** y deja de ofrecerse (**HU01 y HU05**).
4. **Andrés (Dueño) → Historial:** aparece «Registro de venta» con responsable y hora; filtrar por tipo (**HU09 y HU10**).
- Si queda tiempo: **Marta (Encargado) → Propuestas** registra una; **Andrés** la rechaza con confirmación; la propuesta no entra al inventario (**HU02 y HU04**).

## 3. Preguntas difíciles: respuestas honestas
- **¿Usaron IA?** Sí. Claude Code generó el código, las pruebas y la documentación a solicitud del equipo; está declarado en el `README` y en `DOCS/05`. Cada integrante explica la parte que entiende. *(Responde solo lo que sea cierto: si no has leído algo, dilo y explica lo que sí comprendes.)*
- **¿Hubo revisión de pares?** No humana: fue **autorrevisión asistida** (los PR muestran «No reviews»). Si antes de la sustentación alguien del equipo revisa los PR, actualiza esta respuesta y `DOCS/05`.
- **¿Por qué todo sale a nombre de `alejo150224`?** El trabajo se publicó desde esa cuenta, con autorización; los aportes de cada integrante se explican por rol. Pónganse de acuerdo antes sobre cómo presentarlo.
- **¿Cómo lograron 33 SP en un día?** El código se generó con IA; por eso el informe **no** lo usa como velocidad del equipo (`DOCS/05` §1 y §5).
- **¿Por qué los Sprints 2 y 3 están vacíos?** Esas historias se integraron por adelantado el 2026-11-11; esos sprints quedan para revisión de pares, endurecimiento y ensayo.
- **¿Qué pasa si dos vendedores venden el mismo carro a la vez?** La venta usa una transacción síncrona: la segunda recibe un conflicto. **Límite:** vale dentro de un proceso, no entre varios sobre el mismo archivo (`DOCS/10`).
- **¿Se puede editar el historial?** No desde la aplicación (el DAO solo agrega; entradas congeladas). **Límite:** editar el archivo JSON a mano lo altera.
- **¿Qué mejorarían?** Autenticación real, base de datos con bloqueos, revisión de pares, medición de cobertura y linter.
- **¿Por qué la vista «Current iteration» estaba vacía?** Su filtro usaba el nombre `iteration` y el campo se llama «Sprints»; se corrigió a `sprints:@current` (`DOCS/05` §2).

## 4. Datos para tener a mano
10 historias · 33 SP (Sprint 1 = 10 SP: HU01 2 + HU05 8) · 346 pruebas · CI en verde (17 ejecuciones en la captura `07`) · tres capas · 5 perfiles de usuario · 14 capturas de evidencia · PR #11–#21 integrados · Issues #1–#10 cerrados · tablero «Pana Autos - Gestión Ágil» con 3 sprints de 14 días.

## 5. Plan B
- **Sin internet o sin acceso al tablero:** mostrar las capturas `01`–`07` de `DOCS/evidencias/capturas/`.
- **La aplicación no arranca:** mostrar las capturas `08` y `09`, y ejecutar `npm test` para enseñar los 346 en verde.
- **Un integrante no está:** el rol de ese integrante lo cubre otro con el material de `DOCS/10`.
