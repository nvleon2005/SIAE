# Frontend SIAE

Aplicación web de SIAE VEN 911 construida con Next.js, React y TypeScript. El mismo frontend ofrece una experiencia web adaptable y una PWA instalable; la vista ciudadana cambia entre el portal de escritorio y el flujo orientado a móvil según el perfil, el ancho de pantalla y el modo de instalación.

Este es el único README del proyecto. Contiene las instrucciones de instalación y ejecución; la referencia técnica detallada está en la [guía técnica del frontend](./docs/frontend/GUIA-TECNICA.md).

## Qué es y qué no es este proyecto

- Este repositorio contiene el **frontend**. Next.js sirve la interfaz y algunas rutas BFF; la API de negocio completa pertenece al backend, que se mantiene por separado.
- El frontend requiere el backend para autenticación, datos y operaciones reales. Puede arrancar con el backend apagado para revisar la interfaz, pero las funciones operativas mostrarán errores de conexión; no hay modo de datos simulados en runtime.
- La PWA móvil y el portal web de escritorio son **dos experiencias del mismo frontend**, no dos aplicaciones independientes. La resolución y el modo standalone determinan qué experiencia ciudadana se presenta.
- El código fuente funcional no incluye los resultados de pruebas, los informes generados ni los datos del desarrollador. Los scripts de auditoría y pruebas manuales son herramientas de mantenimiento, no código cargado por la aplicación.

## Qué hay que instalar

| Software | Necesario para |
|---|---|
| Node.js **20.9 o superior** y npm **10 o superior** | Desarrollo, pruebas, lint y compilación del frontend. |
| Git | Obtener y actualizar el código. |
| Docker Desktop con Docker Compose v2 | Ejecutar la aplicación y sus dependencias en contenedores. |
| Navegador moderno | Usar la web o instalar la PWA. Chrome/Edge son opciones prácticas para probar instalación y Playwright. |
| Go, además de Docker | Solo si se ejecuta o prepara localmente el repositorio separado del backend. |

Las dependencias JavaScript están fijadas en `package-lock.json`; para una instalación reproducible se usa `npm ci`.

## Iniciar el frontend en local

Desde PowerShell, en la carpeta raíz de este repositorio:

```powershell
npm ci
```

Para ejecutar solo la interfaz sin una API:

```powershell
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Las pantallas que necesiten servicios del backend no tendrán datos reales.

### Conectar con un backend local

El servidor de Next.js reenvía `/v1/*` al backend usando `BACKEND_API_URL`. Si el backend publica su puerto HTTP como `8050` en la máquina anfitriona:

```powershell
$env:BACKEND_API_URL = "http://127.0.0.1:8050"
npm run dev
```

La variable solo dura en esa terminal. Para guardarla localmente, crear `.env.local` en la raíz con:

```dotenv
BACKEND_API_URL=http://127.0.0.1:8050
```

`.env.local` está excluido por Git. La dirección tiene que ser accesible **desde el proceso de Next.js**: si el backend usa otro puerto, ajustar el valor. Dentro de la red Docker del backend, se usa el nombre DNS del servicio y su puerto interno, por ejemplo `http://siae-app:8080`.

### Sin conexión al backend

La interfaz puede iniciar, pero las llamadas operativas requieren un backend disponible. Los errores de conexión o respuestas inválidas se muestran como errores; el frontend no sustituye la API por datos de demostración. MSW y las fixtures se usan únicamente en pruebas automatizadas.

No poner contraseñas, tokens privados ni claves secretas en variables `NEXT_PUBLIC_*`: Next.js puede incorporarlas al código enviado al navegador.

## Iniciar el sistema con Docker

La opción de Compose del frontend necesita que exista la red externa `grpc_default` y que el backend esté conectado a ella. El backend es un proyecto independiente, no incluido en este repositorio.

1. Obtener el repositorio del backend en `Grpc/` siguiendo las instrucciones de ese proyecto.
2. En una terminal, iniciar el backend y sus dependencias desde su propia carpeta. Para un clon nuevo, seguir sus instrucciones para generar las claves locales antes de levantar los servicios:

   ```powershell
   Set-Location .\Grpc
   if (-not (Test-Path .\keys\signing.pem)) { go run ./cmd/devkeys }
   docker compose up --build -d
   ```

   En un backend recién clonado, se genera la clave local solo si todavía no existe. Conservarla para las siguientes ejecuciones; no regenerarla cuando se reutiliza la base de datos.

3. En otra terminal, volver a la raíz del frontend. Crear `.env` si aún no existe; completar los valores requeridos sin poner secretos reales en Git. El archivo local se usa para interpolar los argumentos públicos de build y para las variables de runtime de Compose; no se copia al contexto de Docker:

   ```powershell
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   ```

4. Iniciar el frontend:

   ```powershell
   docker compose up --build -d
   docker compose ps
   ```

5. Abrir [http://localhost:3000](http://localhost:3000).

El Compose del frontend configura `BACKEND_API_URL=http://siae-app:8080` para la comunicación entre contenedores y requiere que el backend haya creado la red externa `grpc_default`. Las variables `NEXT_PUBLIC_*` utilizadas por el cliente se fijan al construir la imagen; cambiar sus valores requiere reconstruirla. Para detener, ejecutar `docker compose down` en cada proyecto. No usar `down -v` si se quieren conservar los datos persistidos del backend.

### Imagen Docker del frontend contra un backend del host

Si el backend está iniciado en el host y expuesto en el puerto `8050`, se puede construir la imagen con la dirección del host visible desde Docker:

```powershell
docker build --build-arg BACKEND_API_URL=http://host.docker.internal:8050 -t siae-frontend:local .
docker run --rm -p 3000:3000 siae-frontend:local
```

`BACKEND_API_URL` se utiliza al construir Next.js para generar las reglas de reescritura. Las variables públicas usadas por el cliente también quedan fijadas en el build; al cambiar cualquier destino/valor, reconstruir la imagen. `.dockerignore` impide enviar archivos de entorno, documentación, pruebas y datos locales innecesarios al contexto de build. Para más detalles de la arquitectura y la configuración, consultar [la guía técnica del frontend](./docs/frontend/GUIA-TECNICA.md).

## PWA: instalar y probar en teléfono

La PWA se sirve en la misma URL que la web. En un teléfono:

- **Android/Chrome o Edge:** abrir el sitio y aceptar la opción de instalar cuando el navegador la ofrezca.
- **iPhone/iPad:** abrirlo en Safari, pulsar **Compartir** y **Añadir a pantalla de inicio**. La guía de instalación también aparece en la aplicación cuando corresponde.

Para probar el service worker en local, usar `npm run build` y `npm run start`: el service worker propio se registra en producción, no durante `npm run dev`. `localhost` es un contexto seguro para las pruebas del navegador en el mismo dispositivo; el acceso desde otro teléfono por una dirección HTTP de red normalmente requiere HTTPS para disponer de las capacidades de PWA y permisos.

La instalación no significa que toda función trabaje sin conexión. El cache de la PWA y la cola local de emergencias tienen límites, descritos en [PWA y diferencias entre teléfono y web](./docs/frontend/GUIA-TECNICA.md#pwa-y-diferencias-entre-teléfono-y-web).

## Pruebas y comandos de desarrollo

| Comando | Propósito |
|---|---|
| `npm run dev` | Servidor de desarrollo Next.js. |
| `npm run build` | Compilación de producción. |
| `npm run start` | Sirve la compilación; primero ejecutar `npm run build`. |
| `npm run lint` | ESLint sobre el proyecto. |
| `npm run typecheck` | Comprobación TypeScript sin emitir archivos. |
| `npm test` | Pruebas unitarias y de componentes de `tests/` con Vitest. |
| `npm run test:e2e` | Pruebas Playwright de `e2e/`; la configuración inicia `npm run dev`. |
| `npm run db:reset` | Invoca el reset/seed del backend dentro de `Grpc/`; usar solo en una base de desarrollo que se pueda borrar. |

En una máquina nueva, instalar el navegador de Playwright:

```powershell
npx playwright install chromium
```

Los scripts de `tests/manual/` y `audits/` son herramientas optativas ejecutadas explícitamente con Node.js; no forman parte de `npm test` ni de `npm run test:e2e`. Pueden requerir una sesión ya autenticada, el frontend/backend en ejecución y datos de desarrollo. Revisar el propio script antes de ejecutarlo.

## Qué es fuente funcional y qué es material de apoyo

| Ruta | Categoría | ¿La ejecuta/carga la aplicación? |
|---|---|---|
| `app/`, `src/`, `lib/`, `types/` | Aplicación, módulos, BFF y tipos. | Sí; forman parte del código y la compilación. |
| `public/` | Recursos estáticos servidos por URL, incluidos manifest y service worker. | Sí; los archivos referenciados son parte del producto publicado. |
| `tests/`, `e2e/` | Pruebas automatizadas. | No en el runtime; se ejecutan con Vitest o Playwright. |
| `tests/manual/`, `audits/` | Pruebas manuales y herramientas de auditoría. | Solo al ejecutarlas explícitamente. |
| `.local/`, `.env.local` | Notas, datos y configuración privados de cada desarrollador. | No; se mantienen fuera de Git. |

`AGENTS.md` y `CLAUDE.md` se mantienen en la raíz para que las herramientas puedan descubrirlos. La organización completa y el mapa de rutas están en la [guía técnica](./docs/frontend/GUIA-TECNICA.md).

## Ayuda

- La configuración real de puertos, rutas, modo PWA y dependencias de backend está descrita en la [guía técnica del frontend](./docs/frontend/GUIA-TECNICA.md).
- Los informes HTML accesibles como recursos web permanecen en `public/`; moverlos alteraría sus URLs.
- Si una pantalla carga pero no muestra datos, revisar que el backend esté activo y que `BACKEND_API_URL` sea alcanzable desde Next.js.
- Si Playwright indica que falta el navegador, ejecutar `npx playwright install chromium`.
