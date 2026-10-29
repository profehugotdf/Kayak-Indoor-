# Kayak Indoor (repo Kayak-Indoor-)

> Archivo de instrucciones para Claude (y para cualquiera que trabaje en este repo). Se lee solo al arrancar una conversación con este repo. Si algo de acá deja de ser cierto, actualizalo en el mismo cambio.


Kayak ergómetro casero de Hugo:
- Sensores: pulso por BLE, cadencia por cámara, micrófono o sensor BLE, y un velocímetro Cyclami en el volante de aire, calibrado de RPM a velocidad.
- Animación del kayakista desde atrás, con un Editor de 8 instantes.
- Fantasma, Carrera virtual, Entrenos con metrónomo, TSS y TCX para TrainingPeaks.
- Recorridos de Rumbo con paisaje real.

## Lo propio de este repo

- Versión visible: `<span class="ver">vNNN</span>`. Va con historial largo en un comentario al principio del script, una entrada por versión. Seguir ese formato.
- Claves: prefijo `kayak_` (`LS_PREFIX`). `kayak_sesiones` es la que lee Mi plan. Las rutas de Rumbo van en IndexedDB `kayak_indoor_rutas`, no en localStorage.
- `dibujarEscenaLago()` está partida en cielo, montañas, agua, pinos y ondas: la usan la sesión, Carrera, el Editor y el fantasma. Con un recorrido de Rumbo, `dibujarEscenaRuta()` reemplaza montañas y pinos por el horizonte real (`hzSample`, igual que Bici v165) y por las orillas (`dibujarOrillas`). Las orillas son una franja de terreno con el perfil real a 0–700 m tierra adentro, con luz y bruma.
- v111: 🌬️ clima real del recorrido (Open-Meteo): se ve en la escena del recorrido (sesión y carrera virtual); opcional, `velConViento()` cambia la velocidad según el viento (no toca la calibración). Claves `kayak_wx` y `kayak_wx_ultimos`. El bloque `wxTraer`/`wxRelativo`/`wxCielo`/`wxAire`/`wxEspuma`/`wxFlecha` es **el mismo que en Bici y Correr**.
- v112: 🪵 muelles, ⛵ veleros (con velas o fondeados), 🚤 lanchas y 🔴 boyas del recorrido: se ponen a mano en la tarjeta Recorrido y se guardan **por nombre de recorrido** en localStorage `kayak_ruta_elementos` (aparte de la ruta, así sobreviven si Rumbo la vuelve a mandar). Se dibujan en `dibujarElementosRuta()`, llamada al final de `dibujarEscenaRuta()`, con la misma cámara que las orillas. Lado `+1` = izquierda de la marcha (igual que `dibujarOrillas`). Geometría pura: `elemMundo`, `elemLateral`, `elemLadoAuto`, `elemReAnclar`, `elemArmarBarco`. No viene ningún elemento de fábrica (nada personal en el código).
- v113: 🪵🌉📐 muelles, puentes y terraplenes **que manda Rumbo** con latitud/longitud reales (`elems` del paquete: `{k,n,a,m,p:[[lat,lon]…]}`, marcados a mano con Calcar o de OpenStreetMap). `decodificarRuta` los deja en `R.elemsRaw` (plano local); `elemsRumbo(R)` les suma la altura del suelo (`elemSueloZ`, con el perfil de orillas) y `dibujarElemsRumbo()` los dibuja. Talud estándar `ELEM_TALUD` = 2 (1 de alto por 2 de ancho). Túnel y desmonte llegan pero no se dibujan en Kayak. Cambios de formato de `elems`: mantenerlo igual en Rumbo, Bici y Correr.
- Lo que se dibuja con canvas se prueba con un canvas simulado o con Playwright + `toDataURL`. Lo que es lógica pura (`aplicarInercia`, `rpmVigente`, `filtrarOrillas`…) va con Node.
- **Nunca cambiar la pose ni las proporciones del Editor** salvo que Hugo lo pida explícitamente.

## Quién y cómo trabajamos

- Usuario: Hugo (profe de educación física y entrenador de triatlón en Ushuaia). Escribe en castellano rioplatense; la app, los textos y los comentarios del código también van en rioplatense.
- Prueba todo en el teléfono: Brave para Android (Samsung S26 Ultra). Manda capturas o videos de pantalla. En Android no hay herramientas de desarrollador: cualquier diagnóstico tiene que estar **adentro de la app** (una tarjeta o un botón de "copiar").
- Si Hugo pega código o un prompt que viene de otra conversación, **primero mirá cómo está el repo ahora** y después actuá. No lo apliques a ciegas.
- **GitHub es la única fuente de verdad.** Arrancá siempre desde lo que está en `main`, nunca desde una copia vieja de otra conversación. Ya pasó: dos versiones de Mi plan se separaron y hubo que unirlas a mano.

## Filosofía de las apps (todas iguales)

- **Un solo `index.html`** con el CSS y el JS adentro. Sin dependencias externas ni build. Funciona sin conexión.
- Hosting: GitHub Pages en `profehugotdf.github.io/<repo>/`. Lo que se sube a `main` se publica solo, en un minuto.
- Pensada para el celular: botones grandes, tolerante a pantallas apagadas y a cortes de señal.
- **No perder datos nunca.** Si guardar falla, que se vea en pantalla, y la sesión no se descarta. Nada de `catch(e){}` mudos en lo que guarda.
- Cambios aditivos: no tocar lo que ya anda (poses, fórmulas calibradas, claves de almacenamiento) salvo que el pedido sea justo eso.

## Cómo entregar un cambio

1. Leer el código que se va a tocar (y lo que lo usa) antes de editar.
2. Si es un bug, primero reproducirlo con una prueba (Node con el pedazo de JS, o Playwright con la página). Después arreglarlo y ver que la prueba pase.
3. Chequear la sintaxis de cada `<script>` (por ejemplo con `node -e "new Function(código)"` o `node --check` sobre el JS extraído).
4. Si la app muestra un número de versión, subirlo y anotar en el comentario de historial **qué se cambió y por qué** (incluido lo que dijo o mostró Hugo).
5. Commit en castellano, directo a `main`, y avisarle a Hugo en pocas líneas qué cambió y cómo probarlo en el teléfono.

## Lo usan otras personas

Además de Hugo, usan las apps su primo, su hermano y compañeros, cada uno en su teléfono y con sus datos (que quedan solo en ese teléfono).

- **Nada personal en el código.** Nada de valores por defecto pensados para Hugo: peso, edad, umbrales, calibraciones de sus equipos, su ciudad, su nombre en los ejemplos. Lo personal se pregunta o se toma del perfil compartido (`entrenamiento_perfil`, `entrenamiento_umbrales`), y si no hay nada, se usa un valor neutro.
- **Los cambios en cómo se guardan los datos tienen que leer lo viejo** (migrar), nunca empezar de cero ni borrar. Una actualización les llega a todos al instante.
- Lo que depende de un equipo (rodillo, sensor, ergómetro) tiene que decir qué hace falta y cómo calibrarlo, para quien no lo tiene configurado.

## Ecosistema compartido (mismo origen profehugotdf.github.io)

Todas las apps comparten `localStorage` (unos 5 MB en total para todas) y pueden leer las claves de las otras.

- `entrenamiento_forma_registro`: `[{fecha:'AAAA-MM-DD', deporte, tss, id, calorias?}]`. Es la Forma combinada (CTL/ATL/TSB con EWMA). Cada app hace upsert **por id** y **nunca** pisa las entradas de otra. La fecha es **local**: no usar `toISOString().slice(0,10)`, porque corre el día (bug que ya pasó).
- `entrenamiento_umbrales`: `{ritmoUmbralCarreraSegKm, pulsoUmbralCarrera, ftpBici, pulsoUmbralBici, pulsoUmbralKayak, historial}`. Se leen como respaldo cuando la app no tiene uno propio. Al escribir, leer el objeto entero y tocar solo lo propio.
- `entrenamiento_perfil`: `{pesoKg, fechaNacimiento, sexo, historialPeso…}`. Mismo criterio que umbrales.
- Resúmenes que lee Mi plan: `correr_sesiones`, `bici_sesiones`, `kayak_sesiones`, `fuerza_sesiones`, `rumbo_sesiones`. Lo pesado (muestras, tracks) va a IndexedDB, y en localStorage queda un resumen sin muestras (`_resumen:true`) con la misma clave.
- TSS:
  - Correr y Kayak: `100 × horas × (valor/umbral)²`.
  - Bici: potencia normalizada/FTP.
  - Fuerza: sRPE de Foster (`RPE × min / 6`).
  - Rumbo: NGP con pendiente para correr, potencia estimada/FTP para bici.
  - Una salida grabada por Rumbo **y** por la app dedicada cuenta una sola vez, la de la dedicada.
- Rumbo abre las otras apps con `#rumbo=` en el link:
  - Bici, Correr y Kayak: `z` + base64url de JSON comprimido con deflate-raw. Bici y Correr reciben el mismo paquete (gpx con la altura, escenas, horizonte, cerros, suelo y `land`: qué hay a cada costado cada 25 m: uso del suelo, casa más cercana con pisos y distancia, tipo de camino); Kayak recibe `app:'kayak'`, puntos, orillas y perfil, horizonte y cerros.
  - Mi plan: base64 de `{v,s:[sesiones]}`, sin comprimir.
- Hay una app de Backup (`profehugotdf.github.io`) que exporta y restaura localStorage e IndexedDB de todas.
