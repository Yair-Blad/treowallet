# Treo Wallet

**Billetera digital — Prueba técnica**

Treo Wallet es un proyecto de billetera digital desarrollado como parte de una prueba técnica. Permite a los usuarios consultar sus cuentas y saldos, administrar beneficiarios, registrar ingresos y gastos, gestionar presupuestos y realizar transferencias simuladas.

El proyecto utiliza una API REST conectada a PostgreSQL, una aplicación web desarrollada con React y una aplicación móvil desarrollada con React Native y Expo.

> **Estado:** En desarrollo  
> **Versión:** 0.5  
> **Última actualización:** 16 de noviembre de 2026

---

## 1. Objetivo

Desarrollar una solución financiera demostrativa que permita implementar y demostrar:

- Autenticación y autorización de usuarios.
- Administración de cuentas y beneficiarios.
- Consulta de saldos y movimientos.
- Registro de ingresos y gastos.
- Administración de presupuestos.
- Transferencias simuladas a beneficiarios.
- Validación de saldo e integridad de las operaciones.
- Control de concurrencia e idempotencia.
- Aplicaciones web y móvil que consuman una misma API.

**Importante:** Treo Wallet es una prueba técnica. No realiza transferencias bancarias reales, no tiene conexión con SPEI y no mueve dinero entre instituciones financieras externas.

## 2. Tecnologías

| Componente | Tecnología |
|---|---|
| Backend | Node.js, Express y TypeScript |
| Base de datos | PostgreSQL |
| ORM | TypeORM |
| Autenticación | JWT |
| Hash de contraseñas | bcryptjs |
| Aplicación web | React, TypeScript y Vite |
| Aplicación móvil | React Native, Expo y TypeScript |
| Navegación móvil | Expo Router |
| Comunicación HTTP | Fetch API |
| Control de versiones | Git y GitHub |
| Despliegue | Pendiente |

## 3. Arquitectura

La solución mantiene una separación entre frontend, backend y base de datos.

- **Web:** interfaz para administrar cuentas, beneficiarios, presupuestos y movimientos.
- **Mobile:** aplicación móvil que consume la API REST.
- **API:** gestiona autenticación, validaciones y operaciones de negocio.
- **PostgreSQL:** almacena usuarios, cuentas, categorías, movimientos, presupuestos, beneficiarios y transferencias.

```mermaid
flowchart TD
    U[Usuario] --> W[Aplicación Web]
    U --> M[Aplicación Móvil]

    W --> API[API REST<br/>Express + TypeScript]
    M --> API

    API --> AUTH[Autenticación JWT]
    API --> USERS[Usuarios]
    API --> ACC[Cuentas]
    API --> TRANS[Transacciones]
    API --> TRANSF[Transferencias]
    API --> BUD[Presupuestos]
    API --> BEN[Beneficiarios]
    API --> DASH[Dashboard]

    AUTH --> DB[(PostgreSQL)]
    USERS --> DB
    ACC --> DB
    TRANS --> DB
    TRANSF --> DB
    BUD --> DB
    BEN --> DB
    DASH --> DB
```

La API es responsable de validar las operaciones y controlar el acceso a los datos. Las aplicaciones cliente no acceden directamente a PostgreSQL.

## 4. Estructura del proyecto

```text
treowallet/
│
├── api/                            # Backend y API REST
│   ├── src/
│   │   ├── config/                 # Configuración de TypeORM
│   │   ├── controllers/            # Lógica de los endpoints
│   │   ├── entities/               # Entidades de PostgreSQL
│   │   ├── middleware/             # Autenticación JWT
│   │   ├── migrations/             # Migraciones
│   │   ├── routes/                 # Rutas de la API
│   │   ├── scripts/                # Scripts auxiliares
│   │   ├── types/                  # Tipos personalizados
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
├── web/                            # Aplicación web React
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   └── package.json
│
├── mobile/                         # Aplicación móvil React Native
│   ├── src/
│   │   ├── app/                    # Rutas mediante Expo Router
│   │   ├── components/             # Componentes reutilizables
│   │   └── ...
│   └── package.json
│
├── specs/                          # Especificaciones del proyecto
│   ├── requirements.md
│   ├── design.md
│   ├── tasks.md
│   └── ai-log.md
│
├── docs/                           # Documentación técnica
│
└── README.md
```

La estructura representa los módulos principales y podrá ampliarse conforme avance el desarrollo.

## 5. Funcionalidades

### Implementadas y verificadas

**Autenticación**

- Inicio de sesión.
- Validación de credenciales.
- Contraseñas protegidas mediante hash.
- Autenticación mediante JWT.
- Protección de rutas privadas.

**Dashboard**

- Consulta de información del usuario.
- Consulta de saldo inicial, ingresos, gastos y saldo actual.
- Visualización de los últimos movimientos.

**Cuentas**

- Consulta de cuentas del usuario.
- Consulta de saldos y movimientos por cuenta.
- Cálculo del saldo actual a partir del saldo inicial y los movimientos registrados.

**Presupuestos**

- Consulta de presupuestos.
- Registro y actualización.
- Eliminación.
- Cálculo de gastos y saldo disponible.

**Beneficiarios**

- Registro y consulta.
- Validación de CLABE de 18 dígitos.
- Validación matemática del dígito de control.
- Eliminación de beneficiarios.

**Transacciones**

- Registro de ingresos y gastos.
- Categorías dinámicas según el tipo de movimiento.
- Consulta del historial.
- Filtros por tipo de movimiento.
- Eliminación de movimientos.

**Transferencias**

- Transferencias simuladas a beneficiarios.
- Validación de pertenencia de la cuenta y del beneficiario al usuario autenticado.
- Validación de importes positivos.
- Validación de saldo suficiente.
- Registro de la transferencia y su movimiento asociado dentro de una transacción de PostgreSQL.
- Control de concurrencia mediante bloqueo de la cuenta.
- Protección contra operaciones duplicadas mediante claves de idempotencia.
- Rechazo de reutilización de una clave con datos diferentes.

### Pendientes

- Registro de usuarios desde la interfaz.
- Comprobantes de transferencias.
- Finalizar y verificar las funcionalidades de la aplicación móvil.
- Pruebas automatizadas.
- Despliegue.

## 6. Estado del desarrollo

| Componente | Estado |
|---|---|
| Repositorio GitHub | Completado |
| Backend Express | Completado |
| Conexión PostgreSQL mediante TypeORM | Completada |
| Entidades principales | Implementadas |
| Migraciones de base de datos | Implementadas |
| Autenticación JWT | Implementada y verificada |
| Dashboard web | Implementado y verificado |
| Cuentas | Implementadas y verificadas |
| Presupuestos | Implementados y verificados |
| Beneficiarios | Implementados y verificados |
| Transacciones | Implementadas y verificadas |
| Transferencias internas simuladas a beneficiarios | Implementadas y verificadas |
| Validación de saldo en transferencias | Verificada |
| Idempotencia de transferencias | Verificada |
| Concurrencia entre transferencias | Verificada |
| Integración web, API y PostgreSQL | Verificada |
| Aplicación móvil | En desarrollo |
| Pruebas automatizadas | Pendientes |
| Despliegue | Pendiente |

Para consultar el seguimiento detallado, revisar `specs/tasks.md`.

## 7. Requisitos previos

- Node.js.
- npm.
- PostgreSQL.
- Git.
- Visual Studio Code o un editor compatible.

Para ejecutar la aplicación móvil también se requiere un entorno compatible con Expo.

## 8. Instalación y ejecución

### 8.1 Clonar el repositorio

```bash
git clone https://github.com/Yair-Blad/treowallet
cd treowallet
```

### 8.2 Configurar el backend

Entrar en la carpeta `api/`:

```bash
cd api
npm install
```

Configurar las variables de entorno necesarias para PostgreSQL, JWT y la conexión con el frontend.

Ejecutar las migraciones de la base de datos:

```bash
npm run migration:run
```

Iniciar el servidor:

```bash
npm run dev
```

La API estará disponible localmente en:

```text
http://localhost:3000
```

### 8.3 Configurar el frontend

Desde la carpeta `web/`:

```bash
cd web
npm install
```

Configurar `VITE_API_URL` con la dirección de la API, por ejemplo:

```text
http://localhost:3000/api
```

Iniciar Vite:

```bash
npm run dev
```

La dirección local de la aplicación se mostrará en la terminal.

### 8.4 Configurar la aplicación móvil

Desde la carpeta `mobile/`:

```bash
cd mobile
npm install
```

Iniciar Expo:

```bash
npx expo start
```

Para realizar pruebas desde un dispositivo físico, configurar la dirección de la API utilizando la IP local de la computadora en la misma red, en lugar de `localhost`.

### 8.5 Base de datos

La aplicación utiliza PostgreSQL y TypeORM.

La sincronización automática del esquema está deshabilitada (`synchronize: false`). Los cambios estructurales deben gestionarse mediante migraciones.

No subir archivos `.env` ni credenciales al repositorio.

## 9. Seguridad y decisiones técnicas

- Las contraseñas se almacenan mediante hash con bcryptjs.
- La autenticación utiliza JWT.
- Las rutas protegidas verifican el token y el usuario autenticado.
- Las consultas de datos consideran la identidad del usuario.
- Se utiliza TypeORM para el acceso a PostgreSQL.
- La sincronización automática del esquema permanece deshabilitada.
- Los identificadores `BIGINT` y los importes `NUMERIC` se manejan como cadenas en las entidades cuando corresponde, para preservar su precisión.
- Las operaciones de transferencia se ejecutan dentro de transacciones de PostgreSQL.
- Se utiliza bloqueo de filas (`FOR UPDATE`) para proteger el saldo de la cuenta durante las transferencias.
- Las claves de idempotencia permiten reconocer reintentos y evitar duplicar transferencias.
- La reutilización de una clave de idempotencia con datos diferentes se rechaza.

Las transferencias son simuladas y no representan movimientos bancarios reales. Los controles implementados corresponden al alcance de esta prueba técnica.

## 10. Pruebas y calidad

Hasta el momento se han realizado verificaciones manuales de:

- Inicio de sesión con credenciales correctas e incorrectas.
- Separación de información entre usuarios.
- Consulta de saldos y movimientos.
- Registro y eliminación de beneficiarios.
- Validación de CLABE.
- Registro de ingresos y gastos.
- Cambio dinámico de categorías.
- Filtros y eliminación de transacciones.
- Integración entre frontend, backend y PostgreSQL.
- Compilación de backend y frontend.
- Transferencia exitosa a un beneficiario.
- Reintento de transferencia con la misma clave de idempotencia, sin duplicar la operación.
- Rechazo de una clave de idempotencia reutilizada con datos diferentes.
- Rechazo de transferencias con saldo insuficiente.
- Prueba de concurrencia: dos solicitudes de transferencia de $30,000 sobre una cuenta con saldo de $50,750. Una operación fue exitosa y la segunda fue rechazada por saldo insuficiente.
- Verificación del saldo final de $20,750 después de la prueba de concurrencia.

Las pruebas automatizadas y la cobertura integral de los distintos tipos de operaciones concurrentes siguen pendientes.

## 11. Documentación

| Archivo | Descripción |
|---|---|
| `specs/requirements.md` | Requisitos funcionales y técnicos |
| `specs/design.md` | Diseño y arquitectura |
| `specs/tasks.md` | Plan de trabajo y seguimiento |
| `specs/ai-log.md` | Registro breve de asistencia y decisiones de IA |
| `docs/` | Documentación técnica complementaria |

## 12. Alcance y limitaciones

Treo Wallet es una demostración técnica.

No incluye actualmente:

- Conexión con SPEI.
- Transferencias bancarias externas.
- Integración con instituciones financieras.
- Movimiento de dinero real.
- Despliegue productivo.
- Validación externa de titularidad de CLABE.

Las transferencias implementadas son operaciones simuladas dentro del sistema.

## 13. Control de versiones

Se utiliza Git para registrar los cambios y relacionar las implementaciones con las tareas correspondientes.

Ejemplos de convenciones de commits:

```text
docs: update project documentation
feat(api): implement transaction endpoints
feat(api): implement simulated transfers
feat(web): integrate transactions module
fix(web): correct dashboard navigation
test: validate transaction operations
```

## 14. Autoría

**Proyecto:** Treo Wallet  
**Tipo:** Prueba técnica  
**Moneda:** Peso mexicano (MXN)  
**Repositorio:** [GitHub](https://github.com/Yair-Blad/treowallet)

---

*Este documento se actualizará conforme avance el desarrollo del proyecto.*