# Treo Wallet — Requisitos del sistema

**Estado:** En desarrollo  
**Versión:** 0.4  
**Fecha:** 11 de noviembre de 2026  
**Producto:** Billetera digital en pesos mexicanos (MXN)

---

## 1. Objetivo

Construir una billetera digital que permita a los usuarios consultar sus cuentas y saldos, administrar beneficiarios y realizar transferencias internas entre cuentas de la plataforma.

La solución contará con una API compartida por una aplicación web y una aplicación móvil, con una arquitectura que permita mantener la consistencia de las operaciones financieras y proteger la información de los usuarios.

Este alcance corresponde a una prueba técnica. No contempla conexión real con SPEI ni movimiento de dinero en instituciones bancarias externas.

El objetivo es entregar una solución funcional que demuestre conocimientos de desarrollo frontend, backend, bases de datos, seguridad, integridad financiera, pruebas y diseño de arquitectura.

## 2. Alcance funcional

### 2.1 Usuarios y autenticación

- Permitir el registro e inicio de sesión de usuarios.
- Almacenar contraseñas utilizando Argon2 o bcrypt.
- Utilizar tokens JWT de corta duración y refresh tokens rotatorios.
- Aplicar limitación de intentos al inicio de sesión.
- Proteger las rutas y recursos según el usuario autenticado.
- Impedir que un usuario consulte o modifique información perteneciente a otro usuario.
- Permitir cerrar sesión e invalidar los refresh tokens correspondientes.

### 2.2 Cuentas y saldos

- Mostrar las cuentas asociadas al usuario.
- Mostrar el saldo disponible de cada cuenta en MXN.
- Impedir que una operación deje el saldo negativo.
- Mantener consistencia entre los saldos y los movimientos contables.
- Registrar cada transferencia mediante un movimiento de débito en la cuenta de origen y uno de crédito en la cuenta de destino.
- Garantizar que ambos movimientos tengan el mismo importe y que la actualización de los saldos se realice dentro de la misma transacción de base de datos.
- Permitir consultar los movimientos asociados a cada cuenta.
- Actualizar los saldos únicamente mediante operaciones financieras válidas.

### 2.3 Beneficiarios

- Permitir registrar, consultar, editar y eliminar beneficiarios.
- Validar que la CLABE tenga 18 dígitos numéricos.
- Validar matemáticamente el dígito de control de la CLABE.
- Asociar los beneficiarios con el usuario que los registra.
- Impedir que un usuario administre beneficiarios de otro usuario.
- La validación de formato y dígito de control no demuestra que la cuenta exista ni que pertenezca al beneficiario.

### 2.4 Transferencias internas

- Permitir transferencias entre cuentas de la misma plataforma.
- Permitir seleccionar un beneficiario registrado o una cuenta propia, de acuerdo con las reglas de negocio definidas.
- Solicitar importe, concepto y referencia.
- Mostrar una confirmación antes de ejecutar la operación.
- Generar un comprobante después de una transferencia exitosa.
- Aplicar un límite diario configurable.
- Solicitar OTP simulado para transferencias que superen un umbral configurable.
- Validar que la cuenta de origen tenga fondos suficientes.
- Evitar transferencias duplicadas mediante claves de idempotencia.
- Informar claramente si la operación fue exitosa, rechazada o quedó en un estado pendiente de resolución.
- No permitir transferencias a cuentas externas ni afirmar que se ejecutó una operación SPEI.

### 2.5 Historial

- Mostrar el historial de movimientos.
- Permitir filtrar por fechas y tipo de movimiento.
- Implementar paginación mediante cursor.
- Mostrar importe, fecha, tipo, estado, concepto y referencia cuando corresponda.
- Ordenar los movimientos por fecha, del más reciente al más antiguo.
- Evitar que el historial exponga movimientos de cuentas ajenas al usuario.
- La aplicación móvil deberá mostrar los últimos 20 movimientos.

## 3. Requisitos de la aplicación web

La aplicación web deberá incluir:

- Inicio de sesión.
- Resumen de cuentas y saldos.
- Historial de movimientos con filtros y paginación.
- Administración de beneficiarios.
- Flujo de transferencia con confirmación y comprobante.
- Validaciones de formularios y manejo de errores.
- Formato monetario mediante `Intl.NumberFormat` con configuración `es-MX`.
- Accesibilidad básica.
- Estados de carga, éxito, error y ausencia de información.
- Navegación clara entre las secciones principales.
- Protección de las vistas que requieran autenticación.

La aplicación consumirá la misma API que la aplicación móvil.

**Tecnologías:** React, TypeScript, Vite y TanStack Query para la administración del estado remoto.

### 3.1 Avance actual de la aplicación web

La aplicación web cuenta con una interfaz inicial desarrollada con React, TypeScript y Vite.

Funcionalidades implementadas:

- Login conectado con el endpoint `POST /api/auth/login`.
- Validación de credenciales mediante el backend.
- Gestión básica de sesión mediante JWT.
- Almacenamiento de sesión en `localStorage` o `sessionStorage`, según la opción "Recordarme".
- Cierre de sesión desde el Dashboard.
- Dashboard conectado con `GET /api/dashboard`.
- Consulta de información financiera real del usuario autenticado.
- Visualización de saldo actual, ingresos y gastos.
- Visualización de los últimos cinco movimientos.
- Formato monetario mediante `Intl.NumberFormat` con configuración `es-MX`.
- Manejo básico de errores y estados de carga.

Las pruebas manuales de integración confirmaron:

- Las credenciales incorrectas producen un mensaje de error.
- Las credenciales correctas permiten acceder al Dashboard.
- Se muestran correctamente el nombre y correo del usuario.
- Los saldos coinciden con los registros de PostgreSQL.
- Se muestran los últimos movimientos registrados.
- El cierre de sesión regresa al Login.

**Pendiente:** registro de usuarios, recuperación de contraseña, refresh tokens, historial completo con filtros y paginación, beneficiarios y transferencias.

### 3.2 Requisitos pendientes de la aplicación web

- Conectar el inicio de sesión con la API.
- Implementar registro de usuarios.
- Gestionar sesiones y expiración de tokens.
- Conectar el dashboard con los saldos reales de la API.
- Implementar historial de movimientos y filtros.
- Implementar administración de beneficiarios.
- Implementar el flujo completo de transferencias.
- Incorporar validaciones de negocio y manejo de errores del servidor.
- Implementar comprobantes de transferencia.
- Incorporar estados de carga, éxito, error y ausencia de datos reales.
- Integrar TanStack Query.
- Implementar pruebas de componentes y flujos principales.

## 4. Requisitos de la aplicación móvil

La aplicación móvil deberá incluir:

- Inicio de sesión.
- Consulta de saldo.
- Visualización de los últimos 20 movimientos.
- Transferencias a beneficiarios existentes.
- Confirmación antes de ejecutar transferencias.
- Consulta del resultado de cada operación.
- Almacenamiento seguro de credenciales mediante SecureStore/Keychain/Keystore; no utilizar AsyncStorage para tokens.
- Reintentos ante problemas de conectividad reutilizando la misma clave de idempotencia.
- Presentación clara del estado real de la operación.
- Ocultamiento de información sensible al pasar la aplicación a segundo plano.

Se permite utilizar React Native con Expo.

**Estado actual:** La aplicación móvil todavía no cuenta con una implementación funcional. Su desarrollo queda pendiente.

## 5. Requisitos técnicos

### 5.1 Backend

- Node.js 20 o superior.
- Express.
- TypeScript en modo estricto.
- PostgreSQL 15 o superior.
- TypeORM y migraciones.
- Zod para validación de datos.
- API REST versionada.
- OpenAPI/Swagger o Redoc para documentar la API.
- Logs estructurados.
- Manejo centralizado de errores.

### 5.2 Frontend

- React para la aplicación web.
- TypeScript.
- Vite.
- TanStack Query para el estado remoto.
- CSS para la presentación visual.
- React Native/Expo para la aplicación móvil.

### 5.3 Organización del proyecto

Se utilizará un monorepo con la siguiente estructura general:

```text
treowallet/
├── api/
├── web/
├── mobile/
├── packages/
│   └── shared/
├── specs/
└── docs/
```

La carpeta `packages/shared` podrá contener tipos, esquemas de validación y utilidades compartidas entre las aplicaciones.

### 5.4 Base de datos

- Utilizar PostgreSQL como sistema de gestión de base de datos.
- Gestionar los cambios de esquema mediante migraciones.
- Desactivar `synchronize` de TypeORM en los entornos de ejecución.
- Definir restricciones e índices para proteger la integridad de los datos.
- Utilizar transacciones para las operaciones financieras.

## 6. Seguridad e integridad financiera

- Las operaciones de transferencia deberán ejecutarse dentro de transacciones de base de datos.
- Bloquear las cuentas afectadas con `SELECT ... FOR UPDATE`, siguiendo un orden determinista para reducir interbloqueos, o utilizar aislamiento SERIALIZABLE con reintentos controlados.
- No permitir saldos negativos, también mediante restricciones de base de datos.
- Utilizar claves de idempotencia únicas para evitar transferencias duplicadas.
- Una clave de idempotencia reutilizada con parámetros diferentes deberá rechazarse.
- Registrar los movimientos contables de forma que cada transferencia tenga débitos y créditos equilibrados.
- Mantener registros de auditoría append-only y restringir las operaciones de actualización y eliminación sobre dichos registros.
- No utilizar números de punto flotante de JavaScript para cálculos monetarios.
- Representar los importes mediante centavos enteros o valores `NUMERIC` en PostgreSQL.
- Registrar logs estructurados con identificador de petición.
- No exponer contraseñas, tokens, credenciales ni información sensible en logs.
- Validar la autorización en el backend, independientemente de las restricciones visuales del frontend.
- Proteger los endpoints contra accesos no autorizados y manipulación de parámetros.

## 7. Requisitos de pruebas

### 7.1 Pruebas unitarias

- Pruebas de lógica de negocio.
- Validación de CLABE.
- Validación de importes y límites.
- Validación de permisos y reglas de transferencia.
- Validación de claves de idempotencia.

### 7.2 Pruebas de integración

- Pruebas contra una instancia real de PostgreSQL.
- Verificar la creación y consulta de usuarios.
- Verificar la administración de cuentas y beneficiarios.
- Verificar transferencias exitosas.
- Verificar transferencias rechazadas por fondos insuficientes.
- Verificar idempotencia.
- Verificar límite diario.
- Verificar prevención de saldo negativo.
- Verificar el registro contable y los movimientos de auditoría.

### 7.3 Pruebas de concurrencia y rendimiento

- Prueba de concurrencia con 100 transferencias simultáneas desde una misma cuenta y verificación del saldo final exacto.
- Comprobar que no existan transferencias duplicadas ni saldos inconsistentes.
- Ejecutar análisis de consulta con `EXPLAIN ANALYZE` sobre un conjunto de al menos 100,000 movimientos de prueba.
- Evaluar índices y rendimiento de las consultas del historial.

### 7.4 Pruebas de frontend

- Pruebas del flujo de inicio de sesión.
- Pruebas de navegación entre las vistas principales.
- Pruebas del flujo de transferencia web.
- Verificar el caso de fondos insuficientes.
- Verificar estados de carga, éxito y error.
- Verificar que los datos mostrados correspondan a las respuestas de la API.

## 8. Requisitos de documentación y entrega

- Documentos iniciales en:
  - `specs/requirements.md`
  - `specs/design.md`
  - `specs/tasks.md`
  - `specs/ai-log.md`
- Documentación de arquitectura y despliegue propuesto en AWS mediante `docs/aws-deploy.md`; no es necesario desplegar la solución.
- Diagrama de arquitectura mediante Mermaid.
- Documentación OpenAPI consultable localmente.
- README con instrucciones de instalación y ejecución.
- Instrucciones para ejecutar la aplicación móvil mediante Expo Go o simulador.
- CI para lint y pruebas de los proyectos.
- Repositorio Git con historial que permita relacionar tareas y commits.
- Video demostrativo de aproximadamente cinco minutos que muestre:
  - Aplicación web.
  - Aplicación móvil.
  - Inicio de sesión.
  - Consulta de saldo y movimientos.
  - Administración de beneficiarios.
  - Transferencia exitosa.
  - Caso de fondos insuficientes.

## 9. Fuera de alcance inicial

- Integración bancaria real o SPEI.
- Transferencias hacia instituciones externas.
- Despliegue real en AWS.
- Conexión con servicios bancarios o financieros externos.
- Verificación real de titularidad de CLABE.
- Envío de OTP mediante SMS o correo real; se utilizará un mecanismo simulado.
- Funcionalidades opcionales como estados de cuenta CSV/PDF o transferencias programadas, hasta completar los requisitos obligatorios.

## 10. Decisiones pendientes

Las siguientes decisiones deberán confirmarse en `design.md` antes de implementar los módulos correspondientes:

- Umbral de OTP y límite diario de transferencias.
- Moneda y escala de precisión; se propone MXN con importes en centavos enteros o `NUMERIC`.
- Política de expiración de OTP y refresh tokens.
- Reglas exactas para cuentas propias y beneficiarios.
- Estrategia final de aislamiento y reintentos para transferencias.
- Estados posibles de una transferencia y sus transiciones.
- Política de bloqueo de cuentas y control de intentos de autenticación.
- Estrategia de almacenamiento de tokens en la aplicación web.
- Política de paginación y límites de consulta del historial.

## 11. Estado general del proyecto

| Componente | Estado |
|---|---|
| Repositorio y estructura inicial | Inicializado |
| Node.js y PostgreSQL | Instalados localmente |
| Backend y conexión PostgreSQL | Implementado |
| Aplicación web con Vite y React | Inicializada |
| Pantalla de Login | Implementación visual inicial |
| Dashboard | Implementación visual inicial |
| Autenticación básica | Implementado |
| API REST | Implementado |
| Integración con PostgreSQL | Implementado |
| Cuentas y saldos reales | Implementado |
| Beneficiarios | Pendiente |
| Transferencias | Pendiente |
| Historial de movimientos | Implementación inicial |
| Aplicación móvil | Pendiente |
| Pruebas automatizadas | Pendiente |
| CI | Pendiente |
| Documentación de despliegue AWS | Pendiente |

## 12. Historial de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 0.1 | 10/11/2026 | Definición inicial de requisitos funcionales, técnicos y de seguridad. |
| 0.2 | 11/11/2026 | Actualización del estado del proyecto, incorporación del avance visual de Login y Dashboard, separación entre funcionalidades implementadas y pendientes, y ampliación de criterios de seguridad y pruebas. |
| 0.3 | 11/11/2026 | Creación de la base de datos en PostgreSQL, integración y conexión con el backend de Treo Wallet, e implementación del hash de contraseñas para su almacenamiento seguro. |
| 0.4 | 11/11/2026 | Integración y conexión entre el backend, la base de datos PostgreSQL y el frontend de Treo Wallet. |
