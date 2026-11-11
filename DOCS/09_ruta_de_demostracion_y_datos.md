# Ruta de demostración y datos ficticios (material de apoyo)

> **Alcance de este documento:** describe la rama `feature/issue-10-consultar-historial`, que reúne las diez historias. En `main` hoy solo están HU01, HU05 y el soporte técnico; el resto llega al integrar los PR #14–#21 (ver `DOCS/12`). Los archivos que mencione y no existan en `main` están en esas ramas.

## 1. Instalar, ejecutar y probar

Requisito: Node.js 22 o superior. **No hay dependencias que instalar** (`npm install` no es necesario).

```bash
git clone https://github.com/alejo150224/panaautos.git && cd panaautos
git switch feature/issue-10-consultar-historial   # rama con las diez historias (mientras no se integren en main)
npm test                  # pruebas automáticas
npm start                 # http://127.0.0.1:3000 con archivo data/panaautos.json
npm run start:memoria     # igual, pero todo en memoria
npm run start:vacio       # en memoria y sin vehículos (caso vacío de HU01)
npm run demo:reiniciar    # borra solo data/panaautos.json (datos ficticios)
```

Windows (PowerShell) usa los mismos comandos `npm`. Para otro puerto: `node src/index.js --puerto=3100`.

## 2. Usuarios y datos ficticios

Se elige el usuario en la parte superior ("Ingresar como…"). No hay contraseñas (sesión de demostración).

| Usuario | Rol | Puede |
|---|---|---|
| Laura Gómez, Carlos Ruiz | Vendedor | inventario, registrar venta, solicitudes (ver y cambiar estado), propuestas propias |
| Marta Ortiz | Encargado de Inventario | inventario, registrar propuestas propias |
| Andrés Pérez | Dueño | inventario, propuestas (ver todas, aprobar, rechazar), historial |
| Sofía Rojas | Administrador | inventario, historial |
| *(sin sesión)* | Cliente | catálogo público y formulario de interés |

Vehículos: 1 Chevrolet Spark GT, 2 Renault Duster, 3 Mazda CX-30 y 6 Nissan Versa (**Disponible**); 5 Toyota Hilux y 7 Hyundai Tucson (**Próximo a ingresar**); 4 Kia Picanto (**Vendido**, dato previo al sistema: sin venta ni historial retroactivo). Clientes: 5 personas inventadas con correos `@example.com`.

## 3. Recorrido sugerido (≈ 10 minutos)

| Paso | Acción | Resultado esperado | Historia |
|---|---|---|---|
| 1 | Sin sesión: catálogo → **Me interesa** en un vehículo → enviar solo el nombre | Error: "Debe completar al menos un medio de contacto: teléfono o correo" | HU06 |
| 2 | Agregar un correo y enviar | Confirmación "Solicitud registrada…"; el vehículo sigue **Disponible** | HU06 |
| 3 | Ingresar como Laura → **Solicitudes** → **Ver detalle** | Contacto y vehículo visibles | HU07 |
| 4 | Cambiar el estado a "En negociación" → guardar | Aviso "Nueva → En negociación"; la lista lo refleja | HU08 |
| 5 | **Inventario** | Siete vehículos con id, marca, modelo, año, precio y estado | HU01 |
| 6 | **Registrar venta** del vehículo 2, cliente y "Contado" | Confirmación; el vehículo 2 pasa a **Vendido** y ya no se ofrece | HU05 |
| 7 | Intentar vender otra vez el 2 (recargando el formulario viejo) o vender el 4 por API | Rechazo: "ya figura como vendido" | HU05 |
| 8 | Ingresar como Marta → **Propuestas** → registrar una (marca, modelo, año, origen, precio) | "Registrada como Pendiente"; el inventario no cambia | HU02 |
| 9 | Ingresar como Andrés → **Propuestas** → **Revisar** → **Aprobar** (o **Rechazar** + confirmar) | Estado "Aprobada"/"Rechazada"; no se agrega vehículo al inventario; una segunda decisión se rechaza | HU03/HU04 |
| 10 | Andrés → **Historial** | Entradas de propuesta, decisión, venta y cambio de estado con responsable y hora | HU09 |
| 11 | Filtrar por tipo "Propuesta" y por usuario; probar "desde" posterior a "hasta" | Filtros combinados; error de rango; mensaje si no hay coincidencias | HU10 |
| 12 | Laura intenta abrir **Historial** (no aparece) o `GET /api/historial` | Denegado (403) | HU10 |
| 13 | Con `npm start`, cerrar el servidor y volverlo a abrir | Ventas, decisiones e historial se conservan | HU09 |

Para el caso vacío de HU01 y HU07 use `npm run start:vacio` (inventario) o una instalación nueva (solicitudes: "No hay solicitudes registradas").

## 4. Capturas

Las capturas de pantalla **auténticas** de esta versión están pendientes (ver `DOCS/12`). No se incluyen imágenes generadas para simular resultados.
