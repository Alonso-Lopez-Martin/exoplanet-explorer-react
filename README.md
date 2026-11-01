# Explorador de Exoplanetas & Sistema Solar 3D

Misión M3 · Reactor Core / React 19 + TypeScript — Web Development I.

## Cómo probarlo
Para arrancar este proyecto necesitas tener Node.js instalado. Abre la terminal en la carpeta del proyecto y ejecuta:
1. `npm install` (para instalar las dependencias, incluyendo Three.js y React Three Fiber).
2. `npm run dev` (para levantar el servidor de desarrollo local de Vite).

Abre el enlace de `localhost` indicado en tu navegador. Desde la pantalla de inicio («Space Explorer»), podrás alternar de forma fluida entre el **Simulador 3D Interactivo del Sistema Solar (JPL Horizons)** y el **Explorador de Exoplanetas** (con historial de búsquedas recientes y comparador cara a cara entre exoplanetas).
*Nota importante:* El proyecto incluye un proxy configurado en `vite.config.ts` para redirigir las peticiones a la API de la NASA de manera transparente y segura durante el desarrollo.

## Estructura del proyecto
```
src/
├── App.tsx                  # solo decide qué pantalla se ve (home / solar / exo)
├── components/
│   ├── HomeMenu.tsx         # menú de inicio
│   ├── ModuleCard.tsx       # tarjeta clicable (es un )
│   ├── ViewShell.tsx        # título + botón de volver, común a las dos vistas
│   ├── ExoplanetExplorer.tsx  # vista del buscador (búsqueda, historial y comparador)
│   ├── RecentSearches.tsx   # barra de búsquedas recientes persistida
│   ├── PlanetComparison.tsx # comparador cara a cara entre dos exoplanetas
│   ├── SearchBar.tsx · PlanetList.tsx · PlanetViewer.tsx · PlanetSphere.tsx · StatItem.tsx
│   └── solar/               # todo lo del simulador 3D
│       ├── SolarSystemMap.tsx   # orquestador: foco unificado + Canvas
│       ├── SolarLoadingOverlay.tsx # overlay de carga del mapa 3D
│       ├── PlanetBody · MoonBody · Sun · OrbitPath · BodyLabel
│       ├── CameraController.tsx
│       └── BodyInfoPanel · BodySelector · hoverCursor
├── data/solarSystem.ts      # planetas, lunas, texturas y distancias de reserva
├── hooks/
│   ├── useFetch.ts          # hook genérico (AbortController, loading derivado, reload)
│   ├── useLocalStorage.ts   # hook genérico con sincronización entre pestañas (storage event)
│   ├── useNasaApi.ts        # construye la consulta del archivo de exoplanetas sobre useFetch
│   └── useJplPositions.ts   # posiciones en paralelo de los planetas desde JPL Horizons
└── utils/
├── astro-calc.ts        # funciones pequeñas de física, habitabilidad, texturas y formato
├── jpl.ts               # cliente de efemérides de JPL Horizons
└── cn.ts                # helper reutilizable para concatenar clases CSS condicionales
```

## Uso de IA
Usé Gemini como pareja de programación y consultor técnico fase a fase para solventar desafíos avanzados de tipado en TypeScript y renderizado 3D.
Ejemplo de prompt real: *"Configura un componente de React Three Fiber que consuma vectores cartesianos de la API de JPL Horizons, dibuje órbitas elípticas con BufferGeometry y permita zoom adaptativo al hacer clic en un astro"*.
Verifiqué cada cambio probando la aplicación en el navegador (comprobando que la consola de compilación de Vite no mostrara errores de tipo, linter o advertencias de efectos), comprobando el comportamiento del motor gráfico a 60 FPS y forzando casos límite en las búsquedas asíncronas.
Escribí a mano: La arquitectura de navegación global de doble vista (`App.tsx`), la distribución y selección de las texturas equirectangulares estáticas en `/public` (incluyendo la Tierra, lunas de Marte, Júpiter, Saturno y Urano), la estructura modular de los componentes atómicos (`StatItem`, `PlanetSphere`, `PlanetList`, `PlanetViewer`) y la aplicación de los principios de diseño de la Gestalt en el menú de inicio.
En las revisiones posteriores al feedback de la corrección, usé IA para pulir la división de componentes, extraer los estilos inline de los paneles 3D a CSS, partir `astro-calc.ts` en funciones pequeñas y añadir el historial de búsquedas y el comparador de exoplanetas. Cada cambio lo revisé leyendo el diff y comprobando el comportamiento en el navegador.

## Texturas prestadas
La biblioteca de imágenes de la NASA no tenía ni un render ni una textura descargable de **Mercurio** ni de **la Luna**, así que usan la textura de Caronte (`Pluto_Charon.jpg`), que es una superficie gris y llena de cráteres y encaja bien a la vista. **Urano** tampoco tiene textura propia, así que reutiliza la de Neptuno, pero se le aplica un baño de luz (tinte emisivo) para darle su característico tono azul clarito y lechoso, logrando diferenciarlo del azul profundo de Neptuno. Esta sustitución la hablé con el profesor en clase y no hay problema. Está comentada también en `src/data/solarSystem.ts`.

## Autopsia
1. **Migración a React 19 y Tipado Estricto (Verbatim ModuleSyntax):** Reconstruir toda la lógica anterior exigió adaptar componentes funcionales puros con interfaces estrictas en TypeScript, evitando por completo el uso de tipos `any`. Descarté usar tipados genéricos o laxos que pudieran ocultar fallos de compilación, asegurando la alineación total con la regla de importación de tipos (`import type`) requerida por la configuración del linter.
2. **Sincronización de Coordenadas 3D y Prevención de Bucles en la Cámara:** Al integrar Three.js con la API REST de JPL Horizons, nos enfrentamos a problemas donde la cámara anulaba los comandos de paneo y zoom del usuario debido a bucles de actualización en el ciclo de renderizado (`useFrame`). Descarté controlar la posición de la cámara de forma rígida y diseñé un controlador inteligente que realiza una transición suave (*lerp*) hacia el objetivo seleccionado pero libera el control orbital de inmediato para permitir la navegación libre del usuario.

### Revisión tras el feedback de la corrección
Cambios hechos tras las dos rondas de feedback, agrupados por apartado de la rúbrica.

#### Componentización
3. **`App.tsx` como enrutador puro y vistas separadas.** `HomeMenu`, `ModuleCard`, `ViewShell` y `ExoplanetExplorer` reparten la estructura general; `SolarSystemMap` delega en `PlanetBody`, `MoonBody`, `Sun`, `OrbitPath`, `CameraController`, `BodyInfoPanel`, `BodySelector` y `SolarLoadingOverlay`.
4. **Cero estilos inline en `BodyInfoPanel`, `BodySelector` y `SolarSystemMap`.** Todos los estilos en línea de los paneles del mapa 3D se movieron a clases semánticas en `src/index.css` (`.body-info-panel`, `.moon-chip`, `.body-selector`, `.selector-chip`).
5. **`astro-calc.ts` dividido en funciones pequeñas con responsabilidad única.** En lugar de una función `calculateMetrics` monolítica que mezclaba física, clasificación y formato, ahora se divide en cuatro helpers puros: `computePhysicalProps`, `evaluateHabitability`, `classifyPlanetAndTexture` y `buildFormattedStats`.

#### Gestión de estado
6. **Foco unificado `{ planet, moon }` y prioridad extraída a `selectDisplayPlanet`.** En `SolarSystemMap` el foco es un único objeto atómico. En `ExoplanetExplorer`, la lógica de prioridad del planeta mostrado se extrajo a la función con nombre `selectDisplayPlanet` en `astro-calc.ts`.
7. **Resincronización limpia de `SearchBar` cuando `searchQuery` cambia desde fuera.** Al pulsar un planeta del historial de búsquedas recientes, `searchQuery` cambia externamente; pasamos `key={searchQuery}` a `<SearchBar />` para que React reinicie el borrador local con el nuevo `initialQuery` sin efectos adicionales.

#### Efectos
8. **Sin dependencia redundante `url/key` en `useFetch`.** Como `key` ya codifica `${reloads}:${url}`, el `useEffect` de `useFetch` depende únicamente de `[key, parse]`, eliminando la redundancia de incluir `url` y `key` a la vez.
9. **`useLocalStorage` sin escrituras redundantes y sincronizado entre pestañas.** El efecto de escritura comprueba primero si el valor serializado ya coincide con `localStorage.getItem(key)` para no escribir en balde al montar, y un segundo efecto escucha el evento `storage` de `window` para sincronizar pestañas abiertas.
10. **`catch` explícito en `useJplPositions` y dependencias escalares en `CameraController`.** En `useJplPositions` el `catch` comprueba `controller.signal.aborted` y, si ocurre un fallo real no provocado por abort, guarda el mensaje en `error` y activa las órbitas de emergencia para informar al usuario.

#### Listas y condicionales
11. **Utilidad `cn` (`src/utils/cn.ts`) para clases condicionales.** Sustituido el `.filter(Boolean).join(' ')` de `PlanetList`, `RecentSearches`, `BodyInfoPanel` y `BodySelector` por el helper `cn('match-btn', isActive && 'active')`.

#### Originalidad y hooks reutilizables (bonus)
12. **Historial de búsquedas recientes (`RecentSearches`) y comparador de dos exoplanetas (`PlanetComparison`).** Además de los dos hooks genéricos (`useFetch<T>` y `useLocalStorage<T>`), el explorador guarda las últimas búsquedas en `localStorage` para relanzarlas con un clic y permite fijar cualquier exoplaneta para compararlo cara a cara con otro en una tabla con sus esferas a escala.