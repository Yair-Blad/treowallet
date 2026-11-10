# Treo Wallet — Requisitos del sistema

**Estado:** Borrador inicial  
**Versión:** 0.1  
**Fecha:** 10 de noviembre de 2026  
**Producto:** Billetera digital en pesos mexicanos (MXN)

## 1. Objetivo

Construir una billetera digital que permita a los usuarios consultar sus cuentas y saldos, administrar beneficiarios y realizar transferencias internas entre cuentas de la plataforma. La solución contará con una API compartida por una aplicación web y una aplicación móvil.

Este alcance corresponde a una prueba técnica. No contempla conexión real con SPEI ni movimiento de dinero en instituciones bancarias externas.

## 2. Alcance funcional

### 2.1 Usuarios y autenticación
- Permitir el registro e inicio de sesión de usuarios.
- Almacenar contraseñas utilizando Argon2 o bcrypt.
- Utilizar tokens JWT de corta duración y refresh tokens rotatorios.
- Aplicar limitación de intentos al inicio de sesión.
- Proteger las rutas y recursos según el usuario autenticado.

### 2.2 Cuentas y saldos
- Mostrar las cuentas asociadas al usuario.
- Mostrar el saldo disponible de cada cuenta en MXN.
- Impedir que una operación deje el saldo negativo.
- Mantener consistencia entre los saldos y los movimientos contables.

### 2.3 Beneficiarios
- Permitir registrar, consultar y administrar beneficiarios.
- Validar que la CLABE tenga 18 dígitos numéricos.
- Validar matemáticamente el dígito de control de la CLABE.
- La validación de formato y dígito de control no demuestra que la cuenta exista ni que pertenezca al beneficiario.

### 2.4 Transferencias internas
- Permitir transferencias entre cuentas de la misma plataforma.
- Permitir seleccionar un beneficiario registrado o una cuenta propia.
- Solicitar importe, concepto y referencia.
- Mostrar una confirmación antes de ejecutar la operación.
- Generar un comprobante después de una transferencia exitosa.
- Aplicar un límite diario configurable.
- Solicitar OTP simulado para transferencias que superen un umbral configurable.
- No permitir transferencias a cuentas externas ni afirmar que se ejecutó una operación SPEI.

### 2.5 Historial
- Mostrar el historial de movimientos.
- Permitir filtrar por fechas y tipo de movimiento.
- Implementar paginación mediante cursor.
- Mostrar importe, fecha, tipo, estado, concepto y referencia cuando corresponda.

## 3. Requisitos de la aplicación web

La aplicación web deberá incluir:
- Inicio de sesión.
- Resumen de cuentas y saldos.
- Historial de movimientos con filtros y paginación.
- Administración de beneficiarios.
- Flujo de transferencia con confirmación y comprobante.
- Validaciones de formularios y manejo de errores.
- Formato monetario mediante `Intl.NumberFormat` con configuración `es-MX`.
- Accesibilidad básica y estados de carga, éxito y error.

La aplicación consumirá la misma API que la aplicación móvil. Se utilizará React y TanStack Query.

## 4. Requisitos de la aplicación móvil

La aplicación móvil deberá incluir:
- Inicio de sesión.
- Consulta de saldo.
- Visualización de los últimos 20 movimientos.
- Transferencias a beneficiarios existentes.
- Almacenamiento seguro de credenciales mediante SecureStore/Keychain/Keystore; no utilizar AsyncStorage para tokens.
- Reintentos ante problemas de conectividad reutilizando la misma clave de idempotencia.
- Presentación clara del estado real de la operación.
- Ocultamiento de información sensible al pasar la aplicación a segundo plano.

Se permite utilizar React Native con Expo.

## 5. Requisitos técnicos

- Node.js 20 o superior.
- Express.
- TypeScript en modo estricto.
- PostgreSQL 15 o superior.
- TypeORM y migraciones.
- React para web.
- React Native/Expo para móvil.
- Zod para validación de datos.
- OpenAPI/Swagger o Redoc para documentar la API.
- Monorepo recomendado con carpetas `api`, `web`, `mobile` y `packages/shared`.
- Desactivar `synchronize` de TypeORM; los cambios de esquema deberán gestionarse mediante migraciones.

## 6. Seguridad e integridad financiera

- Las operaciones de transferencia deberán ejecutarse dentro de transacciones de base de datos.
- Bloquear las cuentas afectadas con `SELECT ... FOR UPDATE`, siguiendo un orden determinista para reducir interbloqueos, o utilizar aislamiento SERIALIZABLE con reintentos controlados.
- No permitir saldos negativos, también mediante restricciones de base de datos.
- Utilizar claves de idempotencia únicas para evitar transferencias duplicadas.
- Una clave de idempotencia reutilizada con parámetros diferentes deberá rechazarse.
- Registrar los movimientos contables de forma que cada transferencia tenga débitos y créditos equilibrados.
- Mantener registros de auditoría append-only y restringir las operaciones de actualización y eliminación sobre dichos registros.
- No utilizar números de punto flotante de JavaScript para cálculos monetarios.
- Registrar logs estructurados con identificador de petición y sin exponer credenciales, tokens ni datos sensibles.

## 7. Requisitos de pruebas

- Pruebas unitarias de lógica de negocio, incluida la validación de CLABE.
- Pruebas de integración contra PostgreSQL real.
- Verificar idempotencia, límite diario y prevención de saldo negativo.
- Prueba de concurrencia con 100 transferencias simultáneas desde una misma cuenta y verificación del saldo final exacto.
- Pruebas del flujo de transferencia web, incluido el caso de fondos insuficientes.
- Ejecutar análisis de consulta con `EXPLAIN ANALYZE` sobre un conjunto de al menos 100,000 movimientos de prueba.

## 8. Requisitos de documentación y entrega

- Documentos iniciales en `specs/requirements.md`, `specs/design.md`, `specs/tasks.md` y `specs/ai-log.md`.
- Documentación de arquitectura y despliegue propuesto en AWS en `docs/aws-deploy.md`; no es necesario desplegar la solución.
- Diagrama de arquitectura mediante Mermaid.
- Documentación OpenAPI consultable localmente.
- README con instrucciones de instalación y ejecución.
- Instrucciones para ejecutar la aplicación móvil mediante Expo Go o simulador.
- CI para lint y pruebas de los proyectos.
- Repositorio Git con historial que permita relacionar tareas y commits.
- Video demostrativo de aproximadamente cinco minutos que muestre web, móvil y un caso de fondos insuficientes.

## 9. Fuera de alcance inicial

- Integración bancaria real o SPEI.
- Transferencias hacia instituciones externas.
- Despliegue real en AWS.
- Funcionalidades opcionales como estados de cuenta CSV/PDF o transferencias programadas, hasta completar los requisitos obligatorios.

## 10. Decisiones pendientes

Las siguientes decisiones deberán confirmarse en `design.md` antes de implementar:
- Umbral de OTP y límite diario de transferencias.
- Moneda y escala de precisión; se propone MXN con importes en centavos enteros o `NUMERIC`.
- Política de expiración de OTP y refresh tokens.
- Reglas exactas para cuentas propias y beneficiarios.
- Estrategia final de aislamiento y reintentos para transferencias.
