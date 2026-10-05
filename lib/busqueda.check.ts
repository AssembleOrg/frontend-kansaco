// Chequeo rápido del buscador: npx tsx lib/busqueda.check.ts
import assert from 'node:assert';
import { Product } from '@/types';
import { puntaje, tokens } from './busqueda';

const prod = (name: string, cat: string, aplication = '', sku = '') =>
  ({ name, sku, aplication, presentation: 'Bidón 1 Litro', category: [cat] }) as unknown as Product;

const sierra = prod('LUBRICANTE PARA MOTOSIERRA', 'Derivados Y Aditivos', 'LUBRICANTE PARA CADENA DE MOTOSIERRA', '5300');
const kanbike = prod('KANBIKE 10w 40 4T SINTÉTICO JASO MA2', 'Motos', 'MOTORES 4 TIEMPOS', '4230');
const dhl3 = prod('DHL3 MULTIGRADO - DIESEL 15W 40', 'Vehículos', 'Aceite de Carter', '1300');
const dhl5 = prod('DHL 5 15W40 PREMIUN MBA 229.1', 'Vehículos', '', '2305');
const auto = prod('SAVIA J 10W 40 SINTETICO', 'Vehículos', 'MOTORES NAFTEROS', '2115');

assert.deepStrictEqual(tokens('lubricante moto'), ['moto']);
assert.deepStrictEqual(tokens('lubri moto'), ['moto']);
assert.deepStrictEqual(tokens('15w40 dhl 3'), ['15w40', 'dhl3']);
assert.deepStrictEqual(tokens('2 tiempos'), ['2tiempos']);
assert.strictEqual(puntaje(kanbike, '2 tiempos'), 0);
assert.deepStrictEqual(tokens('aceite'), ['aceite']); // solo genéricas: se busca igual

// "lubricante moto": motos primero, motosierra después, autos al final
const [k, s, a] = [kanbike, sierra, auto].map((p) => puntaje(p, 'lubricante moto'));
assert.ok(k > s && s > a && a > 0, `moto: ${k} ${s} ${a}`);

// espacios/guiones/acentos
assert.ok(puntaje(dhl3, '15w40 dhl 3') > 0);
assert.strictEqual(puntaje(dhl5, '15w40 dhl 3'), 0);
assert.ok(puntaje(dhl3, 'dhl 3 15w-40') > 0);
assert.ok(puntaje(kanbike, 'sintetico 10w40') > 0);
assert.ok(puntaje(dhl5, 'DHL5') > 0);
assert.strictEqual(puntaje(auto, 'moto 2t'), 0);
console.log('ok');
