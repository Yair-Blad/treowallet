# Treo Wallet — Plan de trabajo

**Estado:** En desarrollo  
**Versión:** 0.4  
**Fecha:** 11 de noviembre de 2026

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

- [~] Elaborar y actualizar `requirements.md`.
- [~] Elaborar y actualizar `design.md`.
- [ ] Revisar y aprobar los documentos de especificación.
- [ ] Completar decisiones técnicas pendientes en `design.md`.
- [ ] Registrar herramientas y decisiones de IA en `ai-log.md`.
- [x] Crear repositorio Git.
- [x] Crear estructura inicial del proyecto.
- [ ] Verificar que todos los documentos de especificación estén guardados en `specs/`.
- [ ] Crear commit exclusivo de especificaciones antes del código.

**Commit esperado:** `docs: define project specifications`

## Fase 1 — Base del repositorio y backend

- [ ] Configurar npm workspaces en la raíz.
- [x] Inicializar API con Node.js, Express y TypeScript estricto.
- [ ] Configurar ESLint, formatter y scripts.
- [x] Configurar variables de entorno y validación de configuración.
- [ ] Configurar conexión PostgreSQL.
- [ ] Configurar TypeORM con `synchronize: false`.
- [ ] Configurar migraciones y seeds.
- [ ] Implementar manejo de errores RFC 7807.
- [ ] Configurar logs estructurados y request ID.
- [ ] Verificar scripts de instalación, desarrollo y compilación.
- [ ] Verificar que la estructura del monorepo funcione correctamente.

**Avance previo:** Node.js y PostgreSQL están instalados localmente. La estructura general del repositorio ya existe. La configuración funcional del backend todavía está pendiente.

## Fase 2 — Persistencia y autenticación

- [ ] Diseñar entidades y relaciones.
- [ ] Crear migraciones iniciales.
- [ ] Implementar registro.
- [x] Implementar login y hash de contraseñas.
- [x] Implementar JWT de corta duración.
- [ ] Implementar refresh tokens rotatorios y logout.
- [ ] Implementar rate limiting para login.
- [x] Implementar autorización por usuario.
- [ ] Crear pruebas unitarias e integración de autenticación.
- [ ] Verificar expiración e invalidación de sesiones.

## Fase 3 — Cuentas, beneficiarios y ledger

- [ ] Implementar consulta de cuentas y saldos.
- [ ] Implementar validación de CLABE de 18 dígitos.
- [ ] Implementar validación matemática del dígito de control.
- [ ] Implementar alta, consulta y administración de beneficiarios.
- [ ] Diseñar asientos contables de débito y crédito.
- [ ] Implementar restricciones para impedir saldos negativos.
- [ ] Probar consistencia entre ledger y saldos.
- [ ] Verificar aislamiento de datos entre usuarios.

## Fase 4 — Transferencias

- [ ] Implementar transferencia interna.
- [ ] Implementar transferencias mediante transacciones PostgreSQL y bloqueo de las cuentas involucradas para evitar inconsistencias por operaciones simultáneas.
- [ ] Implementar clave de idempotencia y huella de solicitud.
- [ ] Implementar límite diario con control de concurrencia.
- [ ] Implementar OTP simulado con expiración y límite de intentos.
- [ ] Implementar comprobante de transferencia.
- [ ] Probar fondos insuficientes.
- [ ] Probar repetición de solicitudes y claves reutilizadas con payload diferente.
- [ ] Probar 100 transferencias simultáneas y validar saldo final.
- [ ] Verificar que los débitos y créditos de cada operación estén equilibrados.
- [ ] Verificar que los errores produzcan rollback de la transacción.

## Fase 5 — Historial y rendimiento

- [ ] Implementar historial de movimientos.
- [ ] Implementar filtros por fecha y tipo.
- [ ] Implementar paginación por cursor.
- [ ] Crear índices necesarios.
- [ ] (opcional)Generar al menos 100,000 movimientos de prueba.
- [ ] Ejecutar y documentar `EXPLAIN ANALYZE`.
- [ ] Verificar rendimiento de las consultas.
- [ ] Verificar que un usuario no pueda consultar movimientos ajenos.

## Fase 6 — Aplicación web

### 6.1 Inicialización y estructura

- [x] Inicializar React.
- [x] Configurar TypeScript y Vite.
- [x] Crear estructura inicial de páginas y estilos.
- [x] Separar estilos generales y estilos del Dashboard.
- [ ] Configurar cliente API.
- [ ] Crear un servicio sencillo para consumir la API desde React.

### 6.2 Interfaz visual

- [x] Crear primera versión visual de Login.
- [x] Crear primera versión visual de Dashboard.
- [x] Implementar navegación local entre Login y Dashboard.
- [x] Incorporar estructura visual del resumen financiero.
- [x] Incorporar sección visual de movimientos recientes.
- [x] Incorporar acciones rápidas y navegación lateral.
- [ ] Ajustar la interfaz conforme se conecten los datos reales.

### 6.3 Funcionalidad e integración

- [x] Configurar cliente API centralizado.
- [x] Conectar login con la API.
- [ ] Implementar registro de usuarios.
- [~] Implementar gestión de sesión y almacenamiento de tokens.
- [~] Implementar protección de vistas mediante estado de autenticación.
- [x] Implementar consulta del Dashboard con datos reales.
- [x] Mostrar saldos e ingresos desde PostgreSQL.
- [x] Mostrar los últimos cinco movimientos.
- [ ] Implementar historial completo, filtros y paginación.
- [ ] Implementar administración de beneficiarios.
- [ ] Implementar flujo de transferencia y confirmación.
- [ ] Implementar comprobante.
- [x] Implementar formato monetario `es-MX`.
- [x] Implementar manejo básico de carga y errores.
- [x] Probar autenticación con credenciales válidas e inválidas.
- [x] Verificar que los datos del Dashboard coincidan con PostgreSQL.
- [x] Verificar el cierre de sesión y regreso al Login.

**Estado:** La aplicación web cuenta con Login y Dashboard conectados al backend. La autenticación, consulta de información financiera y cierre de sesión fueron probados satisfactoriamente. Las funcionalidades adicionales continúan pendientes.

## Fase 7 — Aplicación móvil

- [ ] Inicializar React Native con Expo.
- [ ] Configurar navegación y cliente API.
- [ ] Implementar login.
- [ ] Implementar almacenamiento seguro de tokens.
- [ ] Implementar consulta de saldo.
- [ ] Implementar últimos 20 movimientos.
- [ ] Implementar transferencia a beneficiario existente.
- [ ] Reutilizar clave de idempotencia en reintentos de red.
- [ ] Mostrar estado real de la operación.
- [ ] Ocultar datos sensibles al pasar a segundo plano.
- [ ] Probar en Expo Go o simulador.
- [ ] Documentar instrucciones de ejecución.

## Fase 8 — Documentación, CI y entrega

- [ ] Completar OpenAPI y habilitar documentación local.
- [ ] Completar README de instalación y ejecución.
- [ ] Completar diagrama Mermaid de arquitectura.
- [ ] Configurar CI para lint y pruebas.
- [ ] Revisar historial de commits y relación con tareas.
- [ ] Actualizar `ai-log.md`.
- [ ] Grabar video demostrativo de aproximadamente cinco minutos.
- [ ] Realizar revisión final de seguridad, integridad y funcionamiento.
- [ ] Preparar entrega del repositorio.

## Registro de commits

| Tarea/fase | Commit | Evidencia / notas |
|---|---|---|
| Especificaciones iniciales | Pendiente | Documentos en proceso de actualización |
| Base del monorepo | Pendiente | Estructura inicial creada |
| Backend y conexión PostgreSQL | Por registrar | API conectada a PostgreSQL |
| Inicialización de aplicación web | Pendiente | React, TypeScript y Vite |
| Interfaz visual de Login | Pendiente | Primera implementación |
| Interfaz visual de Dashboard | Pendiente | Primera implementación |
| Backend y persistencia | Pendiente | Por implementar |
| Autenticación | Por registrar | Login con JWT y bcrypt |
| Ledger y transferencias | Pendiente | Por implementar |
| Historial y rendimiento | Pendiente | Por implementar |
| Integración web | Por registrar | Login y Dashboard consumen API |
Dashboard con datos reales	Por registrar	Saldos y movimientos verificados
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

1. Verificar y corregir el `package.json` raíz y configurar npm workspaces.
2. Inicializar la API con Express y TypeScript.
3. Configurar PostgreSQL y TypeORM.
4. Crear las primeras migraciones.
5. Implementar autenticación y pruebas.
6. Implementar cuentas, beneficiarios y ledger.
7. Implementar transferencias y pruebas de concurrencia.
8. Conectar el Dashboard web con la API.
9. Desarrollar la aplicación móvil.
10. Completar documentación, CI y demostración.

## Historial de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 0.1 | 10/11/2026 | Plan de trabajo inicial. |
| 0.2 | 11/11/2026 | Actualización de tareas según el avance real: repositorio, estructura, entorno local e interfaz visual web. Separación de tareas visuales e integración funcional. |
| 0.3 | 11/11/2026 | Creación de la base de datos en PostgreSQL, integración y conexión con el backend de Treo Wallet, e implementación del hash de contraseñas para su almacenamiento seguro. |
| 0.4 | 11/11/2026 | Integración y conexión entre el backend, la base de datos PostgreSQL y el frontend de Treo Wallet. |