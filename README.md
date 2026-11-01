# Explorador de Exoplanetas & Sistema Solar 3D

Misión M3 · Reactor Core / React 19 + TypeScript — Web Development I.

## Cómo probarlo
Para arrancar este proyecto necesitas tener Node.js instalado. Abre la terminal en la carpeta del proyecto y ejecuta:
1. `npm install` (para instalar las dependencias, incluyendo Three.js y React Three Fiber).
2. `npm run dev` (para levantar el servidor de desarrollo local de Vite).

Abre el enlace de `localhost` indicado en tu navegador. Desde la pantalla de inicio («Space Explorer»), podrás alternar de forma fluida entre el **Simulador 3D Interactivo del Sistema Solar (JPL Horizons)** y el **Explorador de Exoplanetas**.
*Nota importante:* El proyecto incluye un proxy configurado en `vite.config.ts` para redirigir las peticiones a la API de la NASA de manera transparente y segura durante el desarrollo.

## Estructura del proyecto
```
src/
├── App.tsx                  # solo decide qué pantalla se ve (home / solar / exo)
├── components/
│   ├── HomeMenu.tsx         # menú de inicio
│   ├── ModuleCard.tsx       # tarjeta clicable (es un <button>)
│   ├── ViewShell.tsx        # título + botón de volver, común a las dos vistas
│   ├── ExoplanetExplorer.tsx  # vista del buscador (estado de la búsqueda)
│   ├── SearchBar.tsx · PlanetList.tsx · PlanetViewer.tsx · PlanetSphere.tsx · StatItem.tsx
│   └── solar/               # todo lo del simulador 3D
│       ├── SolarSystemMap.tsx   # orquestador: foco + Canvas
│       ├── PlanetBody · MoonBody · Sun · OrbitPath · BodyLabel
│       ├── CameraController.tsx
│       └── BodyInfoPanel · BodySelector · hoverCursor
├── data/solarSystem.ts      # planetas, lunas, texturas y distancias de reserva
├── hooks/
│   ├── useFetch.ts          # hook genérico (AbortController, loading derivado, reload)
│   ├── useNasaApi.ts        # construye la consulta del archivo de exoplanetas sobre useFetch
│   └── useJplPositions.ts   # posiciones de los planetas desde JPL Horizons
└── utils/ astro-calc.ts · jpl.ts
```

## Uso de IA
Usé Gemini como pareja de programación y consultor técnico fase a fase para solventar desafíos avanzados de tipado en TypeScript y renderizado 3D.
Ejemplo de prompt real: *"Configura un componente de React Three Fiber que consuma vectores cartesianos de la API de JPL Horizons, dibuje órbitas elípticas con BufferGeometry y permita zoom adaptativo al hacer clic en un astro"*.
Verifiqué cada cambio probando la aplicación en el navegador (comprobando que la consola de compilación de Vite no mostrara errores de tipo, linter o advertencias de efectos), comprobando el comportamiento del motor gráfico a 60 FPS y forzando casos límite en las búsquedas asíncronas.
Escribí a mano: La arquitectura de navegación global de doble vista (`App.tsx`), la distribución y selección de las texturas equirectangulares estáticas en `/public` (incluyendo la Tierra, lunas de Marte, Júpiter, Saturno y Urano), la estructura modular de los componentes atómicos (`StatItem`, `PlanetSphere`, `PlanetList`, `PlanetViewer`) y la aplicación de los principios de diseño de la Gestalt en el menú de inicio.
En la última revisión, a partir del feedback de la corrección, usé Claude para repasar el código y proponer la nueva división de `App.tsx` y `SolarSystemMap.tsx`, el hook genérico `useFetch` y el resto de arreglos que se detallan en la autopsia. Cada cambio lo revisé leyendo el diff y comprobando el comportamiento en el navegador.

## Texturas prestadas
La biblioteca de imágenes de la NASA no tenía ni un render ni una textura descargable de **Mercurio** ni de **la Luna**, así que usan la textura de Caronte (`Pluto_Charon.jpg`), que es una superficie gris y llena de cráteres y encaja bien a la vista. **Urano** tampoco tiene textura propia, así que reutiliza la de Neptuno, pero se le aplica un baño de luz (tinte emisivo) para darle su característico tono azul clarito y lechoso, logrando diferenciarlo del azul profundo de Neptuno. Esta sustitución la hablé con el profesor en clase y no hay problema. Está comentada también en `src/data/solarSystem.ts`.

## Autopsia
1. **Migración a React 19 y Tipado Estricto (Verbatim ModuleSyntax):** Reconstruir toda la lógica anterior exigió adaptar componentes funcionales puros con interfaces estrictas en TypeScript, evitando por completo el uso de tipos `any`. Descarté usar tipados genéricos o laxos que pudieran ocultar fallos de compilación, asegurando la alineación total con la regla de importación de tipos (`import type`) requerida por la configuración del linter.
2. **Sincronización de Coordenadas 3D y Prevención de Bucles en la Cámara:** Al integrar Three.js con la API REST de JPL Horizons, nos enfrentamos a problemas donde la cámara anulaba los comandos de paneo y zoom del usuario debido a bucles de actualización en el ciclo de renderizado (`useFrame`). Descarté controlar la posición de la cámara de forma rígida y diseñé un controlador inteligente que realiza una transición suave (*lerp*) hacia el objetivo seleccionado pero libera el control orbital de inmediato para permitir la navegación libre del usuario.

### Revisión tras el feedback de la corrección
Cambios hechos tras el feedback de la corrección, agrupados por apartado de la rúbrica.

#### Componentización
3. **`App.tsx` era enrutador, buscador y home a la vez.** Ahora solo guarda qué vista está activa. La home pasó a `HomeMenu` (con las tarjetas definidas como un array y pintadas con `map`, sin JSX duplicado) y `ModuleCard`; el título y el botón «Volver a la Nave», que estaban repetidos en cada vista, son ahora `ViewShell`; y el buscador completo vive en `ExoplanetExplorer`.
4. **`SolarSystemMap.tsx` tenía 519 líneas.** Lo separé en: datos (`data/solarSystem.ts`), utilidad de red (`utils/jpl.ts`), un hook (`useJplPositions`) y componentes pequeños en `components/solar/` (`PlanetBody`, `MoonBody`, `Sun`, `OrbitPath`, `CameraController`, `BodyInfoPanel`, `BodySelector`). El archivo principal ahora solo coordina el foco y monta el `Canvas`.
5. **Etiquetas duplicadas.** Sol, planetas y lunas repetían el mismo `<Html><button>` con estilos distintos; ahora es un único `BodyLabel` con una variante. Lo mismo con los handlers de cursor, que pasaron a `hoverCursor.ts`.

#### Gestión de estado
6. **Fuera `searchTrigger = Date.now()`.** El hook ya no recibe un número para forzar la petición. Si el usuario repite la misma búsqueda se llama a `reload()`, y si cambia el texto cambia la URL y el efecto se relanza solo.
7. **Estado mínimo en la búsqueda.** Antes se guardaba el objeto entero del planeta elegido; ahora solo su nombre (`selectedName`) y el planeta mostrado se deriva en cada render.
8. **Quitado `useMemo` de `displayPlanet`** (y los de `currentPlanet`/`currentMoon`/`targetData` del mapa): son búsquedas sobre listas de unos pocos elementos, memoizarlas costaba más que calcularlas. Se mantiene solo en `OrbitPath`, donde sí se evita reconstruir geometría de Three.js.
9. **`isNotFound` ahora es un booleano de verdad** (antes la expresión podía acabar siendo `""` o `0`).

#### Efectos
10. **`loading` derivado, no guardado.** En `useFetch` se compara la clave de la petición actual con la de la última respuesta; así no hay `setLoading(true)` dentro del efecto ni riesgo de que quede en `true` si una petición se aborta justo antes de la siguiente.
11. **`data` se resetea con la búsqueda vacía.** Con `url = null` el hook no pide nada y devuelve `null` (la lista queda vacía); antes se quedaban los resultados de la búsqueda anterior.
12. **Cancelar el fetch de JPL.** `fetchJPLPosition` recibe un `AbortSignal` y `useJplPositions` lo cancela en el cleanup, incluida la pausa entre planetas. Antes seguía descargando tras desmontar el mapa.
13. **Eliminado el `useEffect` de `MoonBody`** que colocaba `angleRef`: ahora es el valor inicial del `useRef`.
14. **`CameraController`:** conserva su único `useEffect`, ahora con un comentario que justifica por qué hace falta (sincroniza props con refs que lee `useFrame`). El `lerp` se corta en cuanto el usuario toca los controles.

#### Listas y condicionales
15. **Tarjetas de la home como `<button>`** (antes `div` con `onClick`): se alcanzan con Tab, se activan con Enter/Espacio y tienen estilo `:focus-visible`.
16. **`isActive` extraído en `PlanetList`**, en vez de calcular la misma comparación dos veces. Los botones de lunas y de la barra de astros también llevan ya `aria-pressed`, y el aviso de carga del mapa tiene `role="status"`.

#### Originalidad y hook reutilizable (bonus)
17. **Nuevo hook genérico `useFetch<T>`** con `AbortController`, `loading`/`error` derivados y `reload`. `useNasaApi` pasa a ser una capa fina encima (solo construye la consulta ADQL y valida el formato), por lo que el hook ya no está atado al dominio.
18. **Texturas:** revisadas una a una. Mercurio y Luna se quedan con la de Caronte y Urano con la de Neptuno por lo explicado arriba; Urano ahora lleva un tinte propio para diferenciarse.
