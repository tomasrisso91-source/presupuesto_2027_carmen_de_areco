# Sitio del Presupuesto 2027 · Carmen de Areco

Página web estática (HTML, CSS y JavaScript sin dependencias). Funciona en GitHub Pages y también abriendo `index.html` directamente.

## Contenido de la carpeta

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Estructura y textos de la página. |
| `estilos.css` | Diseño. Los colores salen del logo municipal. |
| `app.js` | Cálculos, gráficos, calculadora y filtros. |
| `datos/datos.js` | Presupuesto 2027 (recursos, gastos por programa y cargos). |
| `datos/serie.js` | Serie 2019–2027 en pesos de 2027. |
| `datos/cambios.js` | Proyección de cierre 2026 (en equilibrio) contra anteproyecto 2027, en pesos corrientes. |
| `datos/*.csv` | Los mismos datos para descargar desde la página. |
| `img/` | Logo e ícono. |

## Publicar en GitHub Pages

1. Crear un repositorio nuevo en GitHub (por ejemplo `presupuesto-2027`).
2. Subir **el contenido de esta carpeta** (no la carpeta del proyecto completo) a la raíz del repositorio. No subir `generar_datos.py`, las planillas ni nada fuera de `web/`.
3. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. La dirección queda como `https://<usuario>.github.io/presupuesto-2027/`.

## Actualizar los números

Desde la carpeta del proyecto:

```
python 11_Tablero/generar_datos.py
python 11_Tablero/generar_cambios_2026_2027.py
python 11_Tablero/generar_serie_real.py
python 11_Tablero/generar_comparacion_municipios.py
python 11_Tablero/generar_era_milei.py
python 11_Tablero/generar_ejecucion_2027.py
python 11_Tablero/generar_pdfs.py
```

`generar_pdfs.py` arma, con el sitio local abierto en http://localhost:8027, la versión para imprimir (`descargas/presupuesto-2027-carmen-de-areco.pdf`) y la invitación con el código QR (`descargas/invitacion-presupuesto-2027.pdf` y `.png`, a partir de `invitacion.html`). Necesita Google Chrome.

`generar_ejecucion_2027.py` se corre cada trimestre después de descargar la ejecución 2027 de SIMCO en `07_Fuentes_SIMCO/Exportaciones/2027/`. Mientras no exista, la sección "Cómo va 2027" muestra cuándo sale el primer informe.

El primero lee `01_Entregables_finales/` y se detiene si recursos y gastos no suman lo mismo. El segundo usa SIMCO e `ipc.xls`; los supuestos de inflación están al comienzo del archivo. Después, subir de nuevo la carpeta `datos/` y cambiar `?v=1` por `?v=2` en las líneas `<script>` y `<link>` de `index.html` para que los navegadores no muestren la versión vieja.

## Qué no se publica

No hay nombres ni sueldos individuales: el personal está agregado por área y programa.

## Contador de visitas

Está preparado al final de `index.html`, comentado. Crear una cuenta gratuita en https://www.goatcounter.com (no usa cookies ni rastrea personas), reemplazar `CODIGO` por el código elegido y quitar las marcas `<!--` y `-->`.

## Dominio propio (por ejemplo presupuesto.carmendeareco.gob.ar)

1. Quien administre el dominio del municipio crea un registro DNS **CNAME**: nombre `presupuesto`, destino `tomasrisso91-source.github.io`.
2. En GitHub: Settings → Pages → Custom domain → escribir `presupuesto.carmendeareco.gob.ar` → Save, y tildar **Enforce HTTPS** cuando aparezca disponible.
3. Actualizar en `index.html` las etiquetas `og:url`, `og:image`, `twitter:image` y `canonical` con la dirección nueva, y regenerar el QR.
