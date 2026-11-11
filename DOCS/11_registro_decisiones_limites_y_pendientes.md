# Registro de decisiones, límites y pendientes (material de apoyo)

Clasificación: **[Guía]** requisito expreso de la guía · **[Issue]** regla del proyecto y sus Issues · **[Técnica]** decisión propuesta por el desarrollo asistido (a validar por el equipo) · **[Comprobado]** · **[Límite]** · **[Pendiente]**.

## 1. Decisiones técnicas (propuestas, a validar)

| ID | Decisión | Tipo | Motivo |
|---|---|---|---|
| D-01 | JavaScript/Node.js, CommonJS y JSDoc; sin dependencias de ejecución | [Guía] | La guía usa ese enfoque; menos riesgo y nada que instalar |
| D-02 | Estructura `src/{models,dao,controllers,views}` y `tests/` | [Guía] | Fase 3 de la guía |
| D-03 | Además de la memoria, un adaptador **JSON local** durable | [Técnica] | El *Definition of Done* exige "persistencia de datos" y HU09 pide conservar el historial al reiniciar/volver a iniciar sesión |
| D-04 | Transacción síncrona con borrador y confirmación atómica | [Técnica] | Venta + estado + historial sin estado parcial |
| D-05 | Sesión de demostración con usuarios ficticios, **sin contraseñas** | [Técnica] | No se manejan credenciales; el acceso por roles era un supuesto de `DOCS/03` |
| D-06 | Inventario consultable por **todo el personal interno** | [Técnica] | El Issue #1 dice "empleado/vendedor autorizado"; RF-09 dice "empleados" |
| D-07 | Registro de venta solo por **Vendedor**; el vendedor es el usuario con sesión | [Técnica] | El Issue exige "vendedor" como dato y la historia es del empleado/vendedor |
| D-08 | Propuestas: las registran Vendedor y Encargado de Inventario; el empleado ve solo las suyas; el Dueño ve todas | [Técnica] | Issue #2 dice "empleado/vendedor"; el dueño revisa |
| D-09 | Solicitudes: consultar y gestionar solo **Vendedor** | [Técnica] | `DOCS/01` asigna la gestión de solicitudes al vendedor |
| D-10 | Una decisión sobre una propuesta es **final**: repetir o contradecir da 409 | [Técnica] | Issue #3/#4: "se conserva la decisión" |
| D-11 | Cambiar una solicitud al mismo estado no es un cambio y no se audita | [Técnica] | El Issue pide auditar cambios efectivos |
| D-12 | Solo se aceptan solicitudes sobre vehículos Disponible o Próximo a ingresar | [Issue] | Issue #6 |
| D-13 | Catálogo público mínimo (sin sesión) para abrir el formulario de interés | [Técnica] | "Acceso desde la información pública del vehículo" es un supuesto de `DOCS/04` §3.2 |
| D-14 | Fechas de negocio en la zona horaria de Colombia (UTC-5) | [Técnica] | Evita que un día cambie por la diferencia UTC |
| D-15 | No hay venta con pagos, créditos ni reservas; el intercambio no crea inventario | [Issue] | Límite de alcance del Issue #5 |
| D-16 | No se implementaron ofertas públicas de particulares, Cloudinary ni mejoras del otro proyecto | [Issue] | Fuera de HU01–HU10 |
| D-17 | Cada historia en su rama; las ramas están **apiladas** (cada una parte de la anterior) y cada PR se prueba por separado | [Guía][Técnica] | La guía pide una rama por Issue; las dependencias hacen que HU03 requiera HU02, etc. |

## 2. Límites conocidos

- **[Límite]** La garantía contra la doble venta es **por proceso**; no cubre varios procesos sobre el mismo JSON.
- **[Límite]** El historial es inmutable para la aplicación, no criptográficamente (sin firma ni hashes).
- **[Límite]** La sesión no es autenticación real; el selector de usuario no debe exponerse fuera de una demostración local.
- **[Límite]** El servidor solo escucha en 127.0.0.1; no está publicado.
- **[Límite]** El JavaScript del navegador no tiene pruebas automáticas propias (solo una prueba estática y recorrido manual).
- **[Límite]** No hay medición de cobertura ni linter.
- **[Límite]** Las solicitudes públicas no tienen protección antispam ni deduplicación: se permiten repetidas.
- **[Límite]** Los habilitantes (roles, datos base, catálogo, almacenamiento) no tenían Story Points; su esfuerzo real no está estimado.

## 3. Pendientes

- **[Pendiente]** Aprobar la adaptación a tres sprints (`DOCS/07`).
- **[Pendiente]** Configurar el tablero existente #4: asignar Story Points e Iteration, ajustar a 3 sprints (con respaldo previo), verificar la automatización a Done y configurar el Burn-up (Insights solo se configura en la interfaz web).
- **[Pendiente]** Revisión por pares (humanos) de los PR en borrador #11–#22 e integración con aprobación expresa (ramas ya publicadas).
- **[Pendiente]** Verificar el resultado del CI en GitHub: al corte no había ejecuciones registradas en los PR.
- **[Pendiente]** Capturas auténticas (tablero, PR, interfaz, Burn-up).
- **[Pendiente]** Acordar roles reales (PO, Scrum Master, Developers) y la fecha de inicio del Sprint 1.
- **[Pendiente]** Etiquetas MoSCoW: existen; el Issue #1 tiene un título con formato distinto ("HU01-Consultar…").
