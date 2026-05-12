# backend-nest

API REST construida con [NestJS](https://nestjs.com/) que implementa autenticación con JWT y persistencia en PostgreSQL usando TypeORM.

## Stack

- **NestJS 11** + **TypeScript**
- **TypeORM** + **PostgreSQL** (`pg`)
- **JWT** (`@nestjs/jwt`) + **Passport** (`passport-jwt`)
- **bcrypt** para hashear contraseñas
- **class-validator** + **class-transformer** para validación de DTOs
- **Jest** para tests unitarios

## Requisitos previos

- Node.js 20+
- PostgreSQL corriendo localmente (o en la nube)

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo de ejemplo a `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus credenciales de Postgres y un secreto JWT propio:

   ```env
   PORT=3000

   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password
   DB_NAME=backend_nest
   DB_SYNCHRONIZE=true

   JWT_SECRET=usa_un_string_largo_y_aleatorio
   JWT_EXPIRES_IN=1h
   ```

3. Crea la base de datos en Postgres (TypeORM no la crea, solo las tablas):

   ```sql
   CREATE DATABASE backend_nest;
   ```

> Con `DB_SYNCHRONIZE=true` TypeORM creará/actualizará la tabla `users` automáticamente a partir de la entidad. **Solo usar en desarrollo** — en producción se debe pasar a `false` y usar migraciones.

## Scripts

```bash
# desarrollo con recarga automática
npm run start:dev

# producción
npm run build
npm run start:prod

# tests
npm test
npm run test:cov

# lint
npm run lint
```

## Endpoints

### Registro

```http
POST /auth/register
Content-Type: application/json

{
  "email": "tu@correo.com",
  "password": "secreto123"
}
```

Respuesta `201`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "tu@correo.com" }
}
```

Errores:
- `400` — email inválido o password con menos de 6 caracteres
- `409` — el email ya está registrado

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "tu@correo.com",
  "password": "secreto123"
}
```

Respuesta `200`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "tu@correo.com" }
}
```

Errores:
- `400` — formato inválido
- `401` — credenciales inválidas

### Perfil (protegido)

```http
GET /auth/me
Authorization: Bearer <accessToken>
```

Respuesta `200`:
```json
{ "id": "uuid", "email": "tu@correo.com" }
```

Errores:
- `401` — token ausente, inválido o expirado

## Estructura del proyecto

```
src/
├── main.ts                  Bootstrap + ValidationPipe global
├── app.module.ts            ConfigModule + TypeOrmModule (forRootAsync)
├── app.controller.ts
├── app.service.ts
├── auth/
│   ├── auth.module.ts       PassportModule + JwtModule
│   ├── auth.controller.ts   POST /auth/register, /auth/login, GET /auth/me
│   ├── auth.service.ts      Registro, login, hashing con bcrypt
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts  Validación del JWT + carga del usuario
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── decorators/
│       └── current-user.decorator.ts
└── users/
    ├── users.module.ts
    ├── users.service.ts     findByEmail, findById, create
    └── entities/
        └── user.entity.ts   id (uuid), email, password (hash), isActive, createdAt
```

## Notas de seguridad

- Las contraseñas se almacenan **hasheadas con bcrypt** (10 rondas).
- El `JwtStrategy` recarga el usuario desde la base de datos en cada request, así un usuario eliminado pierde el acceso aunque su token aún no haya expirado.
- El `ValidationPipe` global rechaza propiedades no declaradas en los DTOs (`forbidNonWhitelisted: true`).
- Nunca commitear `.env` — usa `.env.example` como plantilla.
