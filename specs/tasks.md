# Treo Wallet — Plan de trabajo

**Estado:** Borrador inicial  
**Versión:** 0.1  
**Fecha:** 10 de noviembre de 2026

## Convenciones

- [ ] Pendiente
- [x] Completado
- Cada tarea terminada deberá relacionarse con uno o más commits.
- No marcar una tarea como completada sin evidencia verificable.
- Mantener primero la integridad financiera y las pruebas; después pulir la presentación.

## Fase 0 — Especificación y preparación

- [ ] Revisar y aprobar `requirements.md`.
- [ ] Completar decisiones técnicas en `design.md`.
- [ ] Desglosar y priorizar tareas en `tasks.md`.
- [ ] Registrar herramientas y decisiones de IA en `ai-log.md`.
- [ ] Crear repositorio Git y estructura del monorepo.
- [ ] Crear commit exclusivo de especificaciones antes del código.

**Commit esperado:** `docs: define project specifications`

## Fase 1 — Base del repositorio y backend

- [ ] Configurar npm workspaces en la raíz.
- [ ] Inicializar API con Node.js, Express y TypeScript estricto.
- [ ] Configurar ESLint, formatter y scripts.
- [ ] Configurar variables de entorno y validación de configuración.
- [ ] Configurar conexión PostgreSQL.
- [ ] Configurar TypeORM con `synchronize: false`.
- [ ] Configurar migraciones y seeds.
- [ ] Implementar manejo de errores RFC 7807.
- [ ] Configurar logs estructurados y request ID.

## Fase 2 — Persistencia y autenticación

- [ ] Diseñar entidades y relaciones.
- [ ] Crear migraciones iniciales.
- [ ] Implementar registro.
- [ ] Implementar login y hash de contraseñas.
- [ ] Implementar JWT de corta duración.
- [ ] Implementar refresh tokens rotatorios y logout.
- [ ] Implementar rate limiting para login.
- [ ] Implementar autorización por usuario.
- [ ] Crear pruebas unitarias e integración de autenticación.

## Fase 3 — Cuentas, beneficiarios y ledger

- [ ] Implementar consulta de cuentas y saldos.
- [ ] Implementar validación de CLABE de 18 dígitos.
- [ ] Implementar validación matemática del dígito de control.
- [ ] Implementar alta, consulta y administración de beneficiarios.
- [ ] Diseñar asientos contables de débito y crédito.
- [ ] Implementar restricciones para impedir saldos negativos.
- [ ] Implementar auditoría append-only.
- [ ] Probar consistencia entre ledger y saldos.

## Fase 4 — Transferencias

- [ ] Implementar transferencia interna.
- [ ] Implementar transacción PostgreSQL y bloqueo de cuentas.
- [ ] Definir orden determinista de bloqueo.
- [ ] Implementar clave de idempotencia y huella de solicitud.
- [ ] Implementar límite diario con control de concurrencia.
- [ ] Implementar OTP simulado con expiración y límite de intentos.
- [ ] Implementar comprobante de transferencia.
- [ ] Probar fondos insuficientes.
- [ ] Probar repetición de solicitudes y claves reutilizadas con payload diferente.
- [ ] Probar 100 transferencias simultáneas y validar saldo final.

## Fase 5 — Historial y rendimiento

- [ ] Implementar historial de movimientos.
- [ ] Implementar filtros por fecha y tipo.
- [ ] Implementar paginación por cursor.
- [ ] Crear índices necesarios.
- [ ] Generar al menos 100,000 movimientos de prueba.
- [ ] Ejecutar y documentar `EXPLAIN ANALYZE`.

## Fase 6 — Aplicación web

- [ ] Inicializar React.
- [ ] Configurar cliente API y TanStack Query.
- [ ] Implementar login.
- [ ] Implementar resumen de cuentas.
- [ ] Implementar historial, filtros y paginación.
- [ ] Implementar administración de beneficiarios.
- [ ] Implementar flujo de transferencia y confirmación.
- [ ] Implementar comprobante.
- [ ] Implementar formato monetario `es-MX`.
- [ ] Implementar manejo de carga, error y accesibilidad básica.
- [ ] Probar flujo de transferencia y fondos insuficientes.

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
- [ ] Probar en Expo Go o simulador y documentar instrucciones.

## Fase 8 — Documentación, CI y entrega

- [ ] Completar OpenAPI y habilitar documentación local.
- [ ] Completar `docs/aws-deploy.md` y diagrama Mermaid.
- [ ] Completar README de instalación y ejecución.
- [ ] Configurar CI para lint y pruebas.
- [ ] Revisar historial de commits y relación con tareas.
- [ ] Actualizar `ai-log.md`.
- [ ] Grabar video demostrativo de aproximadamente cinco minutos.
- [ ] Realizar revisión final de seguridad, integridad y funcionamiento.
- [ ] Preparar entrega del repositorio.

## Registro de commits

| Tarea/fase | Commit | Evidencia / notas |
|---|---|---|
| Especificaciones iniciales | Pendiente | |
| Base del monorepo | Pendiente | |
| Backend y persistencia | Pendiente | |
| Autenticación | Pendiente | |
| Ledger y transferencias | Pendiente | |
| Web | Pendiente | |
| Móvil | Pendiente | |
| Documentación y entrega | Pendiente | |

## Riesgos y prioridades

1. **Riesgo crítico:** errores de concurrencia, idempotencia o cálculo monetario. Resolver y probar antes de dedicar tiempo a detalles visuales.
2. **Riesgo alto:** alcance combinado de web y móvil. Mantener ambas aplicaciones funcionales y limitar el diseño visual.
3. **Riesgo alto:** pruebas reales con PostgreSQL. No sustituirlas por mocks para los casos de integridad.
4. **Riesgo medio:** rendimiento del historial. Medir con datos de prueba e índices.
5. **Riesgo medio:** documentación y video. Reservar tiempo antes del cierre.
