# Explorador de Exoplanetas & Sistema Solar 3D

Misión M3 · Reactor Core / React 19 + TypeScript — Web Development I.

## Cómo probarlo
Para arrancar este proyecto necesitas tener Node.js instalado. Abre la terminal en la carpeta del proyecto y ejecuta:
1. `npm install` (para instalar las dependencias, incluyendo Three.js y React Three Fiber).
2. `npm run dev` (para levantar el servidor de desarrollo local de Vite).

Abre el enlace de `localhost` indicado en tu navegador. Desde la pantalla de inicio («Space Explorer»), podrás alternar de forma fluida entre el **Simulador 3D Interactivo del Sistema Solar (JPL Horizons)** y el **Explorador de Exoplanetas**.
*Nota importante:* El proyecto incluye un proxy configurado en `vite.config.ts` para redirigir las peticiones a la API de la NASA de manera transparente y segura durante el desarrollo.

## Uso de IA
Usé Gemini como pareja de programación y consultor técnico fase a fase para solventar desafíos avanzados de tipado en TypeScript y renderizado 3D.
Ejemplo de prompt real: *"Configura un componente de React Three Fiber que consuma vectores cartesianos de la API de JPL Horizons, dibuje órbitas elípticas con BufferGeometry y permita zoom adaptativo al hacer clic en un astro"*.
Verifiqué cada cambio probando la aplicación en el navegador (comprobando que la consola de compilación de Vite no mostrara errores de tipo, linter o advertencias de efectos), comprobando el comportamiento del motor gráfico a 60 FPS y forzando casos límite en las búsquedas asíncronas.
Escribí a mano: La arquitectura de navegación global de doble vista (`App.tsx`), la distribución y selección de las texturas equirectangulares estáticas en `/public` (incluyendo la Tierra, lunas de Marte, Júpiter, Saturno y Urano), la estructura modular de los componentes atómicos (`StatItem`, `PlanetSphere`, `PlanetList`, `PlanetViewer`) y la aplicación de los principios de diseño de la Gestalt en el menú de inicio.

## Autopsia
1. **Migración a React 19 y Tipado Estricto (Verbatim ModuleSyntax):** Reconstruir toda la lógica anterior exigió adaptar componentes funcionales puros con interfaces estrictas en TypeScript, evitando por completo el uso de tipos `any`. Descarté usar tipados genéricos o laxos que pudieran ocultar fallos de compilación, asegurando la alineación total con la regla de importación de tipos (`import type`) requerida por la configuración del linter.
2. **Sincronización de Coordenadas 3D y Prevención de Bucles en la Cámara:** Al integrar Three.js con la API REST de JPL Horizons, nos enfrentamos a problemas donde la cámara anulaba los comandos de paneo y zoom del usuario debido a bucles de actualización en el ciclo de renderizado (`useFrame`). Descarté controlar la posición de la cámara de forma rígida y diseñé un controlador inteligente que realiza una transición suave (*lerp*) hacia el objetivo seleccionado pero libera el control orbital de inmediato para permitir la navegación libre del usuario.