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
| `datos/cambios.js` | Presupuesto aprobado 2026 contra anteproyecto 2027. |
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
python 11_Tablero/generar_serie_real.py
python 11_Tablero/generar_cambios_2026_2027.py
```

El primero lee `01_Entregables_finales/` y se detiene si recursos y gastos no suman lo mismo. El segundo usa SIMCO e `ipc.xls`; los supuestos de inflación están al comienzo del archivo. Después, subir de nuevo la carpeta `datos/` y cambiar `?v=1` por `?v=2` en las líneas `<script>` y `<link>` de `index.html` para que los navegadores no muestren la versión vieja.

## Qué no se publica

No hay nombres ni sueldos individuales: el personal está agregado por área y programa.
