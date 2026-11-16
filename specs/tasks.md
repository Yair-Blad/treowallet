# Treo Wallet — Plan de trabajo

**Estado:** En desarrollo  
**Versión:** 0.6 
**Fecha:** 16 de noviembre de 2026

---

## Convenciones

- [ ] Pendiente.
- [x] Completado.
- [~] En progreso o implementación parcial.
- Cada tarea terminada deberá relacionarse con uno o más commits.
- No marcar una tarea como completada sin evidencia verificable.
- Mantener primero la integridad financiera y las pruebas; después pulir la presentación.
- Las implementaciones visuales no se considerarán funcionalidades terminadas hasta contar con su lógica y conexión correspondientes.

## Fase 0 — Especificación y preparación

- [x] Elaborar y actualizar `requirements.md`.
- [~] Elaborar y actualizar `design.md`.
- [ ] Revisar y aprobar los documentos de especificación.
- [ ] Completar decisiones técnicas pendientes en `design.md`.
- [x] Registrar herramientas y decisiones de IA en `ai-log.md`.
- [x] Crear repositorio Git.
- [x] Crear estructura inicial del proyecto.
- [x] Verificar que los documentos de especificación estén guardados en `specs/`.
- [x] Crear commit exclusivo de especificaciones antes del código.

**Commit esperado:** `docs: define project specifications`

## Fase 1 — Base del repositorio y backend

- [ ] Configurar npm workspaces en la raíz.
- [x] Inicializar API con Node.js, Express y TypeScript estricto.
- [ ] Configurar ESLint, formatter y scripts.
- [x] Configurar variables de entorno.
- [x] Configurar conexión PostgreSQL.
- [x] Configurar TypeORM con `synchronize: false`.
- [~] Configurar migraciones y seeds.
- [ ] Implementar manejo de errores RFC 7807.
- [ ] Configurar logs estructurados y request ID.
- [x] Verificar scripts de instalación, desarrollo y compilación.
- [ ] Verificar que la estructura del monorepo funcione correctamente.

**Avance:** API funcional con Express y TypeScript, conexión a PostgreSQL mediante TypeORM y compilación verificada. Existe un mecanismo para ejecutar migraciones; la configuración de seeds sigue pendiente.

## Fase 2 — Persistencia y autenticación

- [x] Diseñar entidades y relaciones.
- [~] Crear migraciones iniciales.
- [ ] Implementar registro.
- [x] Implementar login y hash de contraseñas.
- [x] Implementar JWT de corta duración.
- [ ] Implementar refresh tokens rotatorios y logout con invalidación de tokens.
- [ ] Implementar rate limiting para login.
- [x] Implementar autorización por usuario.
- [ ] Crear pruebas unitarias e integración de autenticación.
- [ ] Verificar expiración e invalidación de sesiones.

**Avance:** Entidades y relaciones implementadas con TypeORM. Login mediante bcrypt y JWT funcional. La separación de información entre usuarios fue verificada manualmente. La migración de beneficiarios está implementada; otras tablas ya existían en PostgreSQL.

## Fase 3 — Cuentas, beneficiarios y ledger

- [x] Implementar consulta de cuentas y saldos.
- [x] Implementar validación de CLABE de 18 dígitos.
- [x] Implementar validación matemática del dígito de control.
- [x] Implementar alta, consulta y administración de beneficiarios.
- [ ] Diseñar asientos contables de débito y crédito.
- [ ] Implementar restricciones para impedir saldos negativos.
- [ ] Probar consistencia entre ledger y saldos.
- [x] Verificar aislamiento de datos entre usuarios.

**Avance:** Consulta de cuentas y saldos conectada con PostgreSQL. Beneficiarios permiten registro, consulta y eliminación, con validación de CLABE. La edición de beneficiarios y el ledger siguen pendientes.

## Fase 4 — Transferencias

- [x] Implementar endpoint de transferencias simuladas a beneficiarios.
- [x] Crear registro de transferencias en PostgreSQL mediante migración.
- [x] Registrar el movimiento de gasto asociado a cada transferencia.
- [x] Ejecutar la transferencia y su registro asociado dentro de una transacción PostgreSQL.
- [x] Bloquear la cuenta de origen con FOR UPDATE para evitar que transferencias concurrentes utilicen el mismo saldo.
- [x] Implementar clave de idempotencia.
- [x] Validar reintentos con la misma clave sin duplicar la operación.
- [x] Rechazar la reutilización de una clave con datos diferentes (409).
- [x] Validar saldo insuficiente.
- [x] Validar concurrencia con dos solicitudes de transferencia simultáneas.
- [ ] Implementar límite diario con control de concurrencia.
- [ ] Implementar OTP simulado con expiración y límite de intentos.
- [ ] Implementar comprobante de transferencia.
- [ ] Probar un volumen de 100 transferencias simultáneas y validar el saldo final.
- [ ] Diseñar e implementar un ledger contable de doble partida, si se mantiene dentro del alcance.
- [ ] Verificar que los errores produzcan rollback de la transacción.
- [x] Implementar transferencia simulada desde una cuenta propia hacia un beneficiario registrado.
- [x] Implementar la transferencia mediante transacción PostgreSQL y bloqueo de la cuenta de origen para evitar que transferencias concurrentes utilicen el mismo saldo.
- [~] Completar validación de idempotencia; se compara la cuenta, el beneficiario y el importe para detectar reutilización de claves con datos diferentes.
- [ ] Implementar límite diario con control de concurrencia.
- [ ] Implementar OTP simulado con expiración y límite de intentos.
- [ ] Implementar comprobante de transferencia.
- [x] Probar fondos insuficientes.
- [x] Probar repetición de solicitudes y claves reutilizadas con payload diferente.
- [ ] Probar un volumen de 100 transferencias simultáneas y validar el saldo final.
- [ ] Verificar que los débitos y créditos de cada operación estén equilibrados.
- [ ] Verificar que los errores produzcan rollback de la transacción.

## Fase 5 — Historial y rendimiento

- [~] Implementar historial de movimientos.
- [~] Implementar filtros por fecha y tipo.
- [ ] Implementar paginación por cursor.
- [ ] Crear índices necesarios.
- [ ] (Opcional) Generar al menos 100,000 movimientos de prueba.
- [ ] Ejecutar y documentar `EXPLAIN ANALYZE`.
- [ ] Verificar rendimiento de las consultas.
- [x] Verificar que un usuario no pueda consultar movimientos ajenos.

**Avance:** Consulta de movimientos implementada y conectada con el frontend. Se pueden registrar ingresos y gastos, filtrar por tipo y eliminar movimientos. La paginación y las pruebas de rendimiento siguen pendientes.

## Fase 6 — Aplicación web

### 6.1 Inicialización y estructura

- [x] Inicializar React.
- [x] Configurar TypeScript y Vite.
- [x] Crear estructura inicial de páginas y estilos.
- [x] Separar estilos generales y estilos del Dashboard.
- [x] Configurar cliente API.
- [x] Crear un servicio para consumir la API desde React.

### 6.2 Interfaz visual

- [x] Crear primera versión visual de Login.
- [x] Crear primera versión visual de Dashboard.
- [x] Implementar navegación local entre Login y Dashboard.
- [x] Incorporar estructura visual del resumen financiero.
- [x] Incorporar sección visual de movimientos recientes.
- [x] Incorporar acciones rápidas y navegación lateral.
- [~] Ajustar la interfaz conforme se conecten los datos reales.

### 6.3 Funcionalidad e integración

- [x] Configurar cliente API centralizado.
- [x] Conectar login con la API.
- [ ] Implementar registro de usuarios.
- [~] Implementar gestión de sesión y almacenamiento de tokens.
- [x] Implementar protección de vistas mediante estado de autenticación.
- [x] Implementar consulta del Dashboard con datos reales.
- [x] Mostrar saldos e ingresos desde PostgreSQL.
- [x] Mostrar los últimos cinco movimientos.
- [ ] Implementar historial completo, filtros y paginación.
- [~] Implementar administración de beneficiarios.
- [ ] Implementar flujo de transferencia y confirmación.
- [ ] Implementar comprobante.
- [x] Implementar formato monetario `es-MX`.
- [x] Implementar manejo básico de carga y errores.
- [x] Probar autenticación con credenciales válidas e inválidas.
- [x] Verificar que los datos del Dashboard coincidan con PostgreSQL.
- [x] Verificar el cierre de sesión y regreso al Login.
- [x] Implementar consulta y administración de cuentas.
- [x] Implementar consulta y administración de presupuestos.
- [x] Implementar registro de ingresos y gastos.
- [x] Implementar cambio de categorías según el tipo de movimiento.
- [x] Implementar filtros por tipo y eliminación de movimientos.
- [x] Verificar persistencia de beneficiarios después de cerrar sesión.

**Estado:** La aplicación web cuenta con Login, Dashboard, cuentas, presupuestos, beneficiarios y movimientos conectados con el backend y PostgreSQL. Se realizaron pruebas manuales satisfactorias de las funcionalidades implementadas. El flujo de transferencias y el historial completo siguen pendientes.

## Fase 7 — Aplicación móvil

- [x] Inicializar React Native con Expo.
- [x] Configurar navegación y cliente API.
- [x] Implementar login.
- [x] Implementar almacenamiento seguro de tokens.
- [x] Implementar consulta de saldo.
- [~] Ajustar la consulta móvil para mostrar los últimos 20 movimientos; actualmente el endpoint compartido devuelve los últimos 5.
- [x] Implementar transferencia a beneficiario existente.
- [x] Reutilizar la clave de idempotencia en reintentos de red y evitar el envío de otra transferencia mientras exista una operación pendiente.
- [x] Consultar el estado de la operación mediante la clave de idempotencia para identificar si se completó o continúa pendiente tras un fallo de red.
- [x] Ocultar datos sensibles al pasar a segundo plano.
- [x] Probar en Expo Go o simulador.
- [ ] Documentar instrucciones de ejecución.

## Fase 8 — Documentación, CI y entrega

- [ ] Completar OpenAPI y habilitar documentación local.
- [x] Completar README de instalación y ejecución.
- [~] Completar diagrama Mermaid de arquitectura.
- [ ] Configurar CI para lint y pruebas.
- [ ] Revisar historial de commits y relación con tareas.
- [x] Actualizar `ai-log.md`.
- [ ] Grabar video demostrativo de aproximadamente cinco minutos.
- [ ] Realizar revisión final de seguridad, integridad y funcionamiento.
- [ ] Preparar entrega del repositorio.

## Registro de commits

| Tarea/fase | Commit | Evidencia / notas |
|---|---|---|
| Especificaciones iniciales | Por registrar | Documentos en actualización |
| Base del monorepo | Por registrar | Estructura inicial creada |
| Backend y conexión PostgreSQL | Por registrar | API conectada a PostgreSQL |
| Inicialización de aplicación web | Por registrar | React, TypeScript y Vite |
| Interfaz visual de Login y Dashboard | Por registrar | Interfaces implementadas |
| Autenticación | Por registrar | Login con JWT y bcrypt |
| Cuentas y presupuestos | Por registrar | Consulta y administración verificadas |
| Beneficiarios | Por registrar | Registro, consulta, eliminación y validación de CLABE |
| Movimientos | Por registrar | Registro de ingresos y gastos, filtros y eliminación |
| Integración web | Por registrar | Módulos web conectados con la API |
| Transferencias y ledger | Por registrar | Endpoint, migración, validación de saldo, idempotencia y concurrencia verificados mediante Postman |
| Historial y rendimiento | Pendiente | Implementación parcial |
| Móvil | Pendiente | Por implementar |
| Documentación y entrega | Pendiente | Por completar |

## Riesgos y prioridades

1. **Riesgo crítico: integridad financiera.** Errores de concurrencia, idempotencia o cálculo monetario. Resolver y probar antes de dedicar tiempo a detalles visuales.

2. **Riesgo alto: alcance combinado de web y móvil.** Mantener ambas aplicaciones funcionales y limitar el diseño visual a lo necesario para la prueba técnica.

3. **Riesgo alto: pruebas reales con PostgreSQL.** No sustituir las pruebas de integridad financiera por mocks.

4. **Riesgo medio: configuración del monorepo.** Verificar npm workspaces, scripts y dependencias antes de avanzar con la integración de los proyectos.

5. **Riesgo medio: rendimiento del historial.** Medir con datos de prueba e índices.

6. **Riesgo medio: documentación y video.** Reservar tiempo antes del cierre.

## Próximo orden de trabajo recomendado

1. Revisar y completar `design.md` para definir las reglas de transferencias y el ledger.
2. Diseñar la estructura de movimientos contables y sus restricciones.
3. Implementar transferencias internas en el backend.
4. Incorporar transacciones PostgreSQL, bloqueo de cuentas e idempotencia.
5. Implementar validaciones de fondos, límites y OTP simulado.
6. Probar transferencias exitosas, rechazadas y operaciones simultáneas.
7. Conectar el flujo de transferencias con la aplicación web.
8. Completar el historial con filtros por fecha y paginación.
9. Desarrollar la aplicación móvil.
10. Completar documentación, CI y demostración.

## Historial de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 0.1 | 10/11/2026 | Plan de trabajo inicial. |
| 0.2 | 11/11/2026 | Actualización de tareas según el avance real: repositorio, estructura, entorno local e interfaz visual web. Separación de tareas visuales e integración funcional. |
| 0.3 | 11/11/2026 | Creación de la base de datos en PostgreSQL, integración y conexión con el backend de Treo Wallet, e implementación del hash de contraseñas para su almacenamiento seguro. |
| 0.4 | 11/11/2026 | Integración y conexión entre el backend, la base de datos PostgreSQL y el frontend de Treo Wallet. |
| 0.5 | 15/11/2026 | Actualización del avance de cuentas, presupuestos, beneficiarios y movimientos en la parte web. Registro de pruebas manuales y reorganización de las siguientes tareas. |
| 0.6 | 15/11/2026 | Implementación y pruebas manuales de transferencias simuladas en el backend: validación de saldo, idempotencia y concurrencia. |
| 0.6.1 | 16/11/2026 | Actualización del plan de trabajo según las pruebas realizadas de transferencias y el avance de la aplicación móvil. |