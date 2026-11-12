# Treo Wallet — Registro de uso de IA

**Estado:** Inicial  
**Versión:** 0.4  
**Fecha de inicio:** 11 de noviembre de 2026

## 1. Objetivo

Registrar de forma transparente el uso de herramientas de inteligencia artificial durante el desarrollo de TreoWallet, incluyendo instrucciones relevantes, sugerencias aceptadas o rechazadas, verificaciones humanas y correcciones.

Este archivo se actualizará durante el proyecto. No registrar como ejecutado algo que solamente se haya propuesto.

## 2. Herramientas previstas

| Herramienta | Uso previsto | Estado |
|---|---|---|
| OpenCode | Asistencia para análisis, diseño, generación y revisión de código | Pendiente de confirmar uso y versión |
| ChatGPT | Análisis de requisitos, arquitectura, planificación y revisión técnica | Utilizado |
| Otras herramientas | Se registrarán si se incorporan | No definidas |

## 3. Registro de sesiones

### Sesión 001 — Análisis y planificación inicial

- **Fecha:** 10 de noviembre de 2026
- **Herramienta:** ChatGPT
- **Objetivo:** Analizar la prueba técnica, proponer arquitectura y organizar el trabajo.
- **Instrucción resumida:** Analizar requisitos de una billetera digital fintech y proponer una solución técnica viable.
- **Resultado:** Se propuso un monolito modular con API compartida por React web y React Native/Expo móvil; PostgreSQL como base de datos; ledger de doble partida; transacciones e idempotencia para transferencias.
- **Decisiones aceptadas:** Priorizar integridad financiera, pruebas con PostgreSQL real, control de concurrencia, trazabilidad de commits y documentación previa al código.
- **Sugerencias rechazadas:** Ninguna registrada hasta el momento.
- **Verificación humana:** El usuario revisará y aprobará las decisiones antes de implementarlas.
- **Correcciones:** Ninguna registrada.

### Sesión 002 — Estructura inicial del repositorio

- **Fecha:** 10 de noviembre de 2026
- **Herramienta:** ChatGPT
- **Objetivo:** Definir estructura inicial y orden de creación del proyecto.
- **Resultado:** Se propuso un monorepo con `api`, `web`, `mobile`, `packages/shared`, `specs` y `docs`; se indicó crear las especificaciones y hacer un commit antes de inicializar el código.
- **Decisiones aceptadas:** Crear primero los documentos de especificación y después configurar npm workspaces y la API.
- **Sugerencias rechazadas:** Ninguna registrada hasta el momento.
- **Verificación humana:** Se inicializó el proyecto web con Vite, React y TypeScript. También se instalaron Node.js y PostgreSQL.
- **Correcciones:** Se atendieron problemas iniciales relacionados con la estructura del proyecto y la configuración de ejecución.

### Sesión 003 — Implementación de Login y Dashboard web

- **Fecha:** 10-11 de noviembre de 2026
- **Herramienta y modelo/versión:** ChatGPT
- **Objetivo:** Construir la interfaz inicial de acceso y el Dashboard de TreoWallet.
- **Instrucción resumida:** Generar una pantalla de Login y, después de iniciar sesión, mostrar un Dashboard independiente en otro archivo TSX. Separar los estilos CSS de los componentes.
- **Resultado generado:**
    - Se propuso una pantalla de inicio de sesión con correo electrónico y contraseña.
    - Se implementó navegación condicional entre Login y Dashboard mediante el estado de autenticación de React.
    - Se separó el Dashboard en src/pages/Dashboard.tsx.
    - Se separaron los estilos en src/styles/Dashboard.css.
    - Se definió una estructura de tarjetas para balance, ingresos y gastos.
    - Se incorporó una sección de transacciones recientes y acciones rápidas.
    - Se añadieron estilos generales y ajustes para distintas dimensiones de pantalla.
- **Decisiones aceptadas:** Mantener los componentes TSX separados de sus archivos CSS; utilizar componentes independientes para las páginas; conservar una estructura modular que permita integrar posteriormente la API.
- **Sugerencias rechazadas y motivo:** No se registraron rechazos.
- **Verificación humana:** El usuario confirmó que el Dashboard estaba listo y solicitó preparar el commit correspondiente.
- **Errores detectados:** Se reportó inicialmente que el Dashboard no estaba tomando los estilos CSS.
- **Correcciones aplicadas:** Se reorganizó la importación de estilos, se creó una hoja de estilos independiente para el Dashboard y se propuso un CSS global para evitar interferencias con los estilos predeterminados de Vite.
- **Archivos afectados:**
    - web/src/App.tsx
    - web/src/pages/Login.tsx
    - web/src/pages/Dashboard.tsx
    - web/src/styles/Dashboard.css
    - web/src/index.css
- **Commit propuesto:** feat(web): implementar interfaz del dashboard de TreoWallet
- **Estado del commit:** Ejecutado.

### Sesión 004 — Conexión a PostgreSQL y pruebas iniciales de API

- **Fecha:** 11 de noviembre de 2026
- **Herramienta y modelo/versión:** ChatGPT (GPT-6) y PowerShell.
- **Objetivo:** Configurar y verificar la comunicación entre el backend de Treo Wallet y PostgreSQL, así como realizar las primeras pruebas de autenticación.
- **Instrucción o prompt clave:** Configurar la conexión a PostgreSQL, verificar el estado del servidor mediante endpoints de salud y probar el inicio de sesión desde la API.

- **Resultado generado:**
    - Se verificó la comunicación del backend con PostgreSQL.
    - El endpoint `GET /api/health` respondió correctamente.
    - Se confirmó el estado de conexión a la base de datos mediante la respuesta `database: "Conectada"`.
    - Se realizaron pruebas de autenticación mediante `POST /api/auth/login`.
    - El inicio de sesión respondió exitosamente y generó un JWT.
    - Se probaron los endpoints `GET /api/users/me`, `GET /api/dashboard` y `GET /api/budgets`.

- **Sugerencias aceptadas y motivo:**
    - Utilizar PostgreSQL como almacenamiento persistente.
    - Verificar primero la conexión a la base de datos antes de continuar con las funcionalidades.
    - Realizar pruebas HTTP desde PowerShell para comprobar las respuestas de la API.

- **Sugerencias rechazadas y motivo:** Guardar contraseñas sin cifrar, Se utilizará bcrypt para almacenar hashes de contraseñas.

- **Verificación humana realizada:**
    - Se ejecutaron solicitudes HTTP desde PowerShell.
    - Se confirmó la conexión con PostgreSQL.
    - Se verificó que el login devuelve una respuesta exitosa y un JWT.

- **Errores detectados:**
    - Los endpoints `/api/users/me`, `/api/dashboard` y `/api/budgets` devolvieron el mensaje `Token inválido`, a pesar de que el inicio de sesión generó un JWT correctamente.

- **Correcciones aplicadas:**
    - Se identificó la necesidad de revisar la generación, configuración y validación de JWT.
    - La corrección definitiva de autenticación queda pendiente de verificar.

- **Archivos o commits afectados:** Pendiente de identificar y registrar los archivos exactos modificados durante la implementación de la API.

### Sesión 005 - Integración del frontend con el backend

**Objetivo:** Conectar la aplicación web con la API de Treo Wallet y consultar información almacenada en PostgreSQL.

**Instrucción o prompt clave:** Conectar el Login y Dashboard con el backend, gestionar la autenticación mediante JWT y mostrar los datos reales del usuario.

**Resultado generado:** Integración inicial entre frontend, backend y PostgreSQL completada satisfactoriamente.

**Sugerencias aceptadas y motivo:**

- Creación de un servicio centralizado para consumir la API mediante `fetch`.
- Integración del Login con `POST /api/auth/login`.
- Integración del Dashboard con `GET /api/dashboard`.
- Implementación de almacenamiento de JWT en `localStorage` o `sessionStorage`.
- Implementación de cierre de sesión en el frontend.
- Visualización de información financiera real.
- Manejo básico de errores y estados de carga.

**Sugerencias rechazadas y motivo:** Axios y TanStack Query; se prefirió utilizar fetch nativo para evitar dependencias adicionales.

**Verificación humana realizada:** Se probaron credenciales válidas e inválidas, visualización de usuario y saldos, movimientos recientes y cierre de sesión. Todas las pruebas fueron satisfactorias.

**Errores detectados:** No se detectaron errores bloqueantes. El logout y la gestión de sesión todavía son básicos.

**Archivos o commits afectados:**

- `web/src/services/api.ts`
- `web/src/pages/Login.tsx`
- `web/src/pages/Dashboard.tsx`
- `web/src/App.tsx`
- `api/src/controllers/auth.controller.ts`
- `api/src/controllers/dashboard.controller.ts`

## 4. Plantilla para nuevas sesiones

Duplicar esta sección por cada sesión relevante:

### Sesión XXX — Título

- **Fecha:**
- **Herramienta y modelo/versión:**
- **Objetivo:**
- **Instrucción o prompt clave:**
- **Resultado generado:**
- **Sugerencias aceptadas y motivo:**
- **Sugerencias rechazadas y motivo:**
- **Verificación humana realizada:**
- **Errores detectados:**
- **Correcciones aplicadas:**
- **Archivos o commits afectados:**

## 5. Criterios de registro

- Registrar prompts relevantes, no necesariamente cada interacción trivial.
- Identificar qué contenido fue generado o modificado con IA.
- No aceptar código generado sin revisión.
- Ejecutar pruebas y verificaciones antes de marcar una tarea como completada.
- Registrar sugerencias rechazadas y explicar brevemente el motivo.
- No inventar resultados, pruebas, commits ni verificaciones.
