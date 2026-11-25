# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--{repo}--{owner}.aem.page/
- Live: https://main--{repo}--{owner}.aem.live/

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on [www.aem.live](https://www.aem.live/docs/), more specifically:
1. [AEM Authoring](https://www.aem.live/docs/aem-authoring)
2. [Universal Editor Tutorial](https://www.aem.live/developer/ue-tutorial)
3. [Component Model Definitions](https://www.aem.live/developer/component-model-definitions)
4. [Authoring Path Mapping](https://www.aem.live/developer/authoring-path-mapping)

## Prerequisites

- nodejs 20 or newer
- AEM Cloud Service release 2026.4 or newer

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Importar Good New Energy

El importador de `tools/importer/importer.js` transforma artículos, páginas con
contenido y listados del sitio de WordPress. `tools/importer/import.js` es el
punto de entrada que carga automáticamente el importador de AEM. Reutiliza los
bloques Hero, Cards y Slider; los vídeos incrustados se importan como enlaces.

1. Ejecuta `aem import --no-open` y abre
   `http://localhost:3001/tools/importer/helix-importer-ui/index.html`.
2. Selecciona AEM Authoring y prueba una URL de artículo y una de categoría en
   el Workbench. Configura los destinos de contenido y recursos de tu entorno.
   Para que el Workbench detecte los cambios mientras editas las reglas,
   indica `http://localhost:3001/tools/importer/importer.js` como archivo de
   transformación.
3. En Crawl, obtén las URLs de `https://goodnewenergy.enagas.es/sitemap_index.xml`
   y selecciona las páginas que necesites. Ejecuta después Import - Bulk en
   lotes y revisa el informe de errores.
4. Importa el paquete JCR y sus imágenes en AEM. Los paquetes no incluyen los
   binarios: usa el `asset-mapping.json` generado y
   [AEM Import Helper](https://github.com/adobe/aem-import-helper#uploading-content-to-aem)
   para subirlos. Después revisa, previsualiza y publica el contenido.

El importador conserva las rutas de los artículos y convierte los enlaces
internos a rutas del nuevo sitio; importa también sus destinos o prepara
redirecciones. Los listados son instantáneas de la página importada: no
implementan paginación ni actualización automática. Las búsquedas, formularios,
comentarios y funcionalidades de WordPress necesitan una implementación aparte.
Revisa los metadatos disponibles en AEM, los idiomas, los enlaces y los formatos
especiales antes de publicar; las estructuras no reconocidas generan un error.

## Slider

En Universal Editor, añade un bloque Slider y tantos elementos Slide como
necesites. Configura en el bloque el tiempo entre slides y la duración de la
transición en segundos (por defecto, 5 y 0,8). Cada slide admite imagen y texto
alternativo, título enriquecido, subtítulo y color hexadecimal para el subrayado.
Puedes añadir un enlace al título desde el editor de texto enriquecido. El carrusel
se pausa al recibir el foco o al pasar el
ratón; también dispone de un control para pausar o reanudar la reproducción.
Con movimiento reducido, no se reproduce automáticamente.

Las portadas importadas después de este cambio utilizan el bloque Slider; las
ya importadas deben volver a importarse o actualizarse manualmente en AEM.

## Redes sociales del footer

En Universal Editor, añade el bloque **Redes sociales** a la misma sección del
fragmento del footer que el bloque Columns. Añade un **Enlace de red social** por
cada red y selecciona su icono, URL y nombre accesible. Para X, selecciona
**Imagen personalizada** y elige su imagen en AEM: IcoMoon Free no incluye el
logotipo actual de X. En escritorio el bloque aparece junto a las columnas.

Los enlaces anteriores siguen funcionando. Para evitar duplicados, elimina la
columna antigua de redes después de configurar y comprobar el nuevo bloque.

La fuente `fonts/icomoon-social.woff2` contiene 169 iconos
de [IcoMoon Free, de Keyamoon](https://github.com/Keyamoon/IcoMoon-Free)
(todas las marcas y redes sociales más una selección de iconos de uso común),
bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Es una versión
modificada de la fuente original: se ha creado un subconjunto de glifos y
convertido a WOFF2 (unos 20 KB). La implementación anterior conserva también los SVG originales en
`icons/icomoon-*.svg`.

Para incorporar más iconos a la lista, importa `selection.json` de IcoMoon Free
en la aplicación de IcoMoon, añade los iconos necesarios y exporta una fuente
WOFF2. Mantén los códigos existentes y añade las opciones con sus códigos Unicode
en `blocks/social-links/_social-links.json`; después ejecuta `npm run build:json`.
Actualiza también la atribución y comprueba la licencia de cada icono añadido.
