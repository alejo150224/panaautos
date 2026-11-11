# Métodos que debemos defender y preguntas de estudio (material de apoyo)

> **Alcance de este documento:** describe la rama `feature/issue-10-consultar-historial`, que reúne las diez historias. En `main` hoy solo están HU01, HU05 y el soporte técnico; el resto llega al integrar los PR #14–#21 (ver `DOCS/12`). Los archivos que mencione y no existan en `main` están en esas ramas.

> Para sustentar hay que **entender** el código, no recitarlo. Cada punto indica archivo y qué decir. Las respuestas describen lo que el código hace hoy; las limitaciones se dicen tal cual.

## 1. Métodos clave

| Método (archivo) | Qué hace | Por qué está así |
|---|---|---|
| `AlmacenamientoMemoria.transaccion(fn)` (`src/dao/almacenamiento/`) | Copia los datos a un borrador, ejecuta `fn` y confirma de una vez; si algo falla no queda nada | Da atomicidad sin una base de datos: venta + estado + historial se guardan juntos |
| `DAOBase` (`src/dao/DAOBase.js`) | `todos`, `porId`, `insertar`, `actualizar`; devuelve **copias** | Quien consume datos no puede alterar el almacenamiento por accidente; el DAO no sabe de negocio |
| `exigirPermiso(actor, permiso)` (`controllers/permisos.js`) | Lanza `ErrorNoAutenticado` o `ErrorPermiso` | Una sola tabla de roles; **denegar por defecto** |
| `VentaController.registrarVenta` | Valida todo, comprueba existencia y estado, guarda venta, cambia a "Vendido", audita | HU05: sin operación parcial y sin doble venta |
| `VentaController._validar` | Acumula todos los errores en una sola excepción | El Issue pide "informa el error y no registra" |
| `SolicitudController.registrarSolicitud` | Formulario público: nombre + un contacto; estado "Nueva" | HU06: no reserva ni vende |
| `SolicitudController.actualizarEstado` | Cambia solo `estado`; sin cambio real no audita | HU08: conserva contacto y vehículo |
| `PropuestaController._decidir` | Una decisión única y final dentro de una transacción | HU03/HU04: rechaza una segunda decisión incluso simultánea |
| `Auditor.registrar` | Crea la entrada de historial **dentro de la misma transacción** | HU09: no puede quedar una operación sin su evidencia ni al revés |
| `HistorialDAO` | Solo `agregar`, `todos`, `porId`; entradas congeladas | "No permiten editarlas ni eliminarlas" |
| `HistorialController.consultarHistorial` | Filtros por usuario, fechas (hora de Colombia) y tipo, con "Y" | HU10; las fechas incluyen ambos extremos |
| `crearSistema` (`composicion.js`) | Conecta DAO y controladores (inyección manual) | La vista solo recibe controladores |
| `crearServidor` (`views/servidor.js`) | Traduce HTTP ⇄ controladores y errores → 400/401/403/404/409 | La vista no tiene reglas de negocio |

## 2. Preguntas y respuestas

**¿Por qué tres capas y dónde está cada una?** Presentación (`views`), lógica (`controllers`) y datos (`dao`). Cambiar la base de datos solo exige otro adaptador; cambiar la pantalla no toca las reglas. Una prueba lee los `require` para comprobarlo.

**¿Los modelos son una cuarta capa?** No. Son las entidades que usan las tres capas.

**¿Qué patrón es el Facade aquí?** Cada controlador ofrece operaciones simples (`registrarVenta`) que ocultan varios pasos (validar, consultar DAO, transacción, auditar). La vista llama a una sola función.

**¿Qué es un DAO y por qué devuelve copias?** Un objeto que encapsula el acceso a datos. Al devolver copias, cambiar un objeto no cambia lo guardado hasta llamar a `actualizar`.

**¿Cómo evitan vender dos veces el mismo carro?** Dentro de una transacción síncrona se lee el estado; si no es "Disponible" se rechaza. Como Node ejecuta un solo hilo, dos peticiones se ejecutan una tras otra y la segunda ve "Vendido". Probado con 25 intentos simultáneos y 20 peticiones HTTP en paralelo: queda **una** venta.

**¿Eso vale con varios servidores?** **No.** La garantía es dentro de un proceso. Con dos procesos sobre el mismo archivo JSON podrían pisarse; en producción haría falta una base de datos con bloqueos o restricciones únicas.

**¿Qué pasa si falla el guardado a mitad de la venta?** La transacción se revierte: no queda venta ni estado cambiado. Hay pruebas con un fallo inyectado en el cambio de estado y con un disco que falla.

**¿Por qué el historial se guarda dentro de la misma transacción?** Para que no existan ventas sin entrada de historial ni entradas de operaciones que no ocurrieron. Si el historial falla, la operación se revierte (prueba incluida).

**¿Realmente nadie puede editar el historial?** Ninguna función de la aplicación lo permite: el DAO no tiene `actualizar/eliminar`, las entradas están congeladas y la API no ofrece rutas de escritura. **Límite:** quien edite directamente el archivo JSON puede alterarlo; no hay firma ni cadena de hashes.

**¿Por qué una aprobación no crea el vehículo?** Porque los Issues #2–#4 lo prohíben explícitamente: la propuesta solo registra la decisión del dueño.

**¿Qué ocurre si dos pestañas deciden la misma propuesta a la vez?** Una gana y la otra recibe 409 ("ya fue aprobada/rechazada"). Está probado.

**¿Cómo se manejan los roles?** `permisos.js` lista, por permiso, los roles autorizados; cada operación llama a `exigirPermiso`. La interfaz solo oculta menús según lo que informa el controlador: la API vuelve a validar. Es una **sesión de demostración**, no autenticación real.

**¿Por qué el vendedor de la venta sale de la sesión y no del formulario?** Para que nadie registre una venta a nombre de otro; la prueba envía un `vendedorId` falso y se ignora.

**¿Cómo se trata la hora?** Se guarda en UTC y las fechas de negocio se interpretan en Colombia (UTC-5). Hay una prueba con una venta a las 21:00 locales (02:00 UTC del día siguiente).

**¿Cuántas pruebas hay y qué cubren?** 346 en la rama final: criterios de aceptación, casos negativos, permisos, validaciones, vacíos, persistencia, fallos, concurrencia, historial, arquitectura y servidor. **No miden cobertura de código** y son locales (la CI aún no se ejecutó en GitHub).

**¿Por qué "Done" es 0 SP si hay código y pruebas?** Porque la definición de terminado del plan exige revisión e integración, y no hay PR revisados ni integrados. Contar código sin integrar como terminado falsearía la velocidad.

**¿Cuál es la diferencia entre el plan de 4 sprints y la guía de 3?** `DOCS/07`: 33 SP en 3 sprints son 11 SP promedio; el plan asumía 10. Hay dos alternativas y la decisión es del equipo.

**¿Qué se usó de asistencia de IA?** Claude Code generó el código, las pruebas y los documentos a solicitud del equipo; falta la revisión humana, y cada integrante debe poder explicar lo que defiende.
