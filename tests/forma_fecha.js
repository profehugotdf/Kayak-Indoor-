// Prueba del día que Kayak anota en la Forma compartida (Node). Correr con: TZ=America/Argentina/Ushuaia node tests/forma_fecha.js
// Bug: antes se guardaba sesion.fecha.slice(0,10), que es el día en UTC: una sesión a las 22:30 en Ushuaia (UTC-3) quedaba al día siguiente.
const fs = require('fs'), assert = require('assert');
const s = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const corte = (desde, hasta) => { const a = s.indexOf(desde), b = s.indexOf(hasta, a + 1); assert(a >= 0 && b > a, 'no encontré ' + desde); return s.slice(a, b); };
let n = 0;
const t = (nombre, fn) => { try { fn(); n++; console.log('ok  - ' + nombre); } catch (e) { console.log('FALLA - ' + nombre + '\n   ' + e.message); process.exitCode = 1; } };

t('la zona horaria de la prueba es la de Ushuaia (UTC-3)', () => { assert.strictEqual(new Date().getTimezoneOffset(), 180); });

const hayHelper = s.indexOf('// ===== INICIO FECHA FORMA =====') >= 0;
const helper = hayHelper ? corte('// ===== INICIO FECHA FORMA =====', '// ===== FIN FECHA FORMA =====') : '';

function anotar(sesion, previo) {
  const guardado = { v: previo || [] };
  const codigo = helper + corte('function actualizarFormaCompartida', 'function calcularSerieFormaCombinada');
  new Function('lsGet', 'lsSet', 'K_FORMA_COMPARTIDA', codigo + '; actualizarFormaCompartida(arguments[3]);')(
    () => guardado.v, (k, v) => { guardado.v = v; }, 'entrenamiento_forma_registro', sesion);
  return guardado.v;
}
const base = { id: 'kay_1', tss: 60, duracionSeg: 3000 };
const ult = (r) => r[r.length - 1].fecha;

t('sesión a las 22:30 locales (01:30 UTC del día siguiente) se anota en el día LOCAL', () => {
  assert.strictEqual(ult(anotar(Object.assign({}, base, { fecha: '2026-11-02T01:30:00.000Z' }))), '2026-11-01');
});
t('una sesión de la tarde no cambia de día', () => {
  assert.strictEqual(ult(anotar(Object.assign({}, base, { fecha: '2026-11-01T18:00:00.000Z' }))), '2026-11-01');
});
t('sesión cargada a mano (mediodía local) queda en su día', () => {
  assert.strictEqual(ult(anotar(Object.assign({}, base, { fecha: new Date('2026-11-01T12:00:00').toISOString() }))), '2026-11-01');
});
t('no pisa entradas de otras apps', () => {
  const r = anotar(Object.assign({}, base, { fecha: '2026-11-02T01:30:00.000Z' }), [{ fecha: '2026-11-01', deporte: 'bici', tss: 50, id: 'b1' }]);
  assert.strictEqual(r.length, 2); assert.strictEqual(r[0].id, 'b1');
});

// --- Corrección única de lo que ya quedó mal anotado ---
const corregir = (reg, ses) => new Function(helper + '; return corregirFechasForma(arguments[0], arguments[1]);')(reg, ses);
t('corrige una entrada kayak vieja anotada en día UTC', () => {
  const r = corregir([{ fecha: '2026-11-02', deporte: 'kayak', tss: 60, id: 'k1' }], [{ id: 'k1', fecha: '2026-11-02T01:30:00.000Z' }]);
  assert.strictEqual(r.cambios, 1); assert.strictEqual(r.registro[0].fecha, '2026-11-01');
});
t('no toca entradas de otras apps ni kayak sin sesión', () => {
  const reg = [{ fecha: '2026-11-02', deporte: 'bici', tss: 5, id: 'k1' }, { fecha: '2026-11-02', deporte: 'kayak', tss: 5, id: 'zz' }];
  const r = corregir(reg, [{ id: 'k1', fecha: '2026-11-02T01:30:00.000Z' }]);
  assert.strictEqual(r.cambios, 0); assert.deepStrictEqual(r.registro, reg);
});
t('es idempotente', () => {
  const ses = [{ id: 'k1', fecha: '2026-11-02T01:30:00.000Z' }];
  const a = corregir([{ fecha: '2026-11-02', deporte: 'kayak', tss: 1, id: 'k1' }], ses);
  assert.strictEqual(corregir(a.registro, ses).cambios, 0);
});
console.log(n + ' pruebas ok');
