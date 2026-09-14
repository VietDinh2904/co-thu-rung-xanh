import test from 'node:test';
import assert from 'node:assert/strict';
import { WIDTH, HEIGHT, createInitialState, denOwner, trapOwner, isRiver, phaseForTurn, effectiveRank, legalMoves, movePiece } from './rules.js';

const piece = (team, rank, x, y, wounds = 0) => ({ id: `${team}-${rank}`, team, rank, x, y, wounds });
const has = (moves, x, y) => moves.some(move => move.x === x && move.y === y);
const tile = (x, y, kind) => [{ x, y, kind }];

test('9×9 layout places all pieces and special tiles on separate valid squares on both shores', () => {
  assert.equal(WIDTH, 9); assert.equal(HEIGHT, 9);
  for (let seed = 0; seed < 30; seed++) {
    let n = seed + 1;
    const rng = () => ((n = (n * 1664525 + 1013904223) >>> 0) / 4294967296);
    const { pieces, specialTiles } = createInitialState(rng);
    assert.equal(pieces.length, 16); assert.equal(specialTiles.length, 16);
    const occupied = new Set();
    for (const entry of [...pieces, ...specialTiles]) {
      assert.ok(entry.x >= 0 && entry.x < 9 && entry.y >= 0 && entry.y < 9);
      assert.ok(!isRiver(entry.x, entry.y) && !denOwner(entry.x, entry.y) && !trapOwner(entry.x, entry.y));
      const key = `${entry.x},${entry.y}`;
      assert.ok(!occupied.has(key)); occupied.add(key);
    }
    assert.ok(pieces.filter(p => p.team === 'red').every(p => p.y <= 2));
    assert.ok(pieces.filter(p => p.team === 'blue').every(p => p.y >= 6));
    for (const kind of ['jungle', 'home', 'mountain', 'spikes']) {
      assert.equal(specialTiles.filter(t => t.kind === kind && t.y <= 2).length, 2);
      assert.equal(specialTiles.filter(t => t.kind === kind && t.y >= 6).length, 2);
    }
  }
});

test('terrain modifiers and enemy net trap rank zero', () => {
  assert.equal(effectiveRank(piece('blue', 6, 1, 6), tile(1, 6, 'jungle')), 7);
  assert.equal(effectiveRank(piece('blue', 2, 1, 6), tile(1, 6, 'jungle')), 1);
  assert.equal(effectiveRank(piece('blue', 4, 1, 6), tile(1, 6, 'home')), 5);
  assert.equal(effectiveRank(piece('blue', 8, 1, 6), tile(1, 6, 'home')), 6);
  assert.equal(effectiveRank(piece('blue', 5, 1, 6), tile(1, 6, 'mountain')), 6);
  assert.equal(effectiveRank(piece('blue', 7, 1, 6), tile(1, 6, 'mountain')), 6);
  assert.equal(effectiveRank(piece('blue', 8, 3, 0)), 0);
  assert.equal(effectiveRank(piece('blue', 8, 2, 0)), 8);
});

test('two days, night, and full moon repeat with phase strengths', () => {
  assert.deepEqual(Array.from({ length: 8 }, (_, i) => phaseForTurn(i + 1)), ['day', 'day', 'night', 'fullmoon', 'day', 'day', 'night', 'fullmoon']);
  const wolf = piece('blue', 3, 0, 6);
  assert.equal(effectiveRank(wolf, [], 3), 5);
  assert.equal(effectiveRank(wolf, [], 4), 6);
  assert.equal(effectiveRank(piece('blue', 6, 0, 6), [], 3), 7);
});

test('positive terrain grants exact two-square jumps in eight directions; full moon wolf jumps three', () => {
  const tiger = piece('blue', 6, 4, 6);
  const tiles = tile(4, 6, 'jungle');
  const moves = legalMoves([tiger], tiger, tiles, 1);
  for (const [x, y] of [[2, 6], [6, 6], [4, 4], [2, 8], [6, 8]]) assert.ok(has(moves, x, y));
  assert.ok(!has(moves, 4, 8)); // Hang của chính mình vẫn bị cấm.
  assert.ok(!has(moves, 6, 7));
  const wolf = piece('blue', 3, 4, 5);
  assert.ok(has(legalMoves([wolf], wolf, [], 4), 7, 8));
  assert.ok(!has(legalMoves([wolf], wolf, [], 3), 7, 8));
});

test('at night only a cat captures a rat; jungle shields elephant from rat', () => {
  const rat = piece('red', 1, 0, 6), dog = piece('blue', 4, 0, 7), cat = piece('blue', 2, 1, 6);
  assert.ok(has(legalMoves([dog, rat], dog, [], 1), 0, 6));
  assert.ok(!has(legalMoves([dog, rat], dog, [], 3), 0, 6));
  assert.ok(has(legalMoves([cat, rat], cat, [], 3), 0, 6));
  assert.ok(has(legalMoves([dog, rat], dog, [], 4), 0, 6));
  const elephant = piece('red', 8, 0, 6), blueRat = piece('blue', 1, 0, 7);
  assert.ok(has(legalMoves([blueRat, elephant], blueRat), 0, 6));
  assert.ok(!has(legalMoves([blueRat, elephant], blueRat, tile(0, 6, 'jungle')), 0, 6));
});

test('spikes permanently wound 6+ strength pieces once per landing, including repeated landings', () => {
  const spike = tile(0, 6, 'spikes');
  const tiger = piece('blue', 6, 0, 7), enemy = piece('red', 1, 8, 0);
  const first = movePiece([tiger, enemy], tiger.id, 0, 6, spike);
  assert.equal(first.wounded, true);
  assert.equal(first.pieces[0].wounds, 1);
  const out = movePiece(first.pieces, tiger.id, 0, 7, spike);
  assert.equal(out.pieces[0].wounds, 1);
  const back = movePiece(out.pieces, tiger.id, 0, 6, spike);
  assert.equal(back.wounded, false); // Bậc 5 không đủ ngưỡng để bị thương thêm.
  const elephant = piece('blue', 8, 0, 7);
  const heavyFirst = movePiece([elephant, enemy], elephant.id, 0, 6, spike);
  const heavyOut = movePiece(heavyFirst.pieces, elephant.id, 0, 7, spike);
  const heavyBack = movePiece(heavyOut.pieces, elephant.id, 0, 6, spike);
  assert.equal(heavyBack.pieces[0].wounds, 2);
});

test('river, dens and enemy traps keep their original constraints', () => {
  const lion = piece('blue', 7, 0, 4);
  assert.ok(has(legalMoves([lion], lion), 4, 4));
  const rat = piece('red', 1, 1, 4);
  assert.ok(!has(legalMoves([lion, rat], lion), 4, 4));
  const blueRat = piece('blue', 1, 4, 7);
  assert.ok(!has(legalMoves([blueRat], blueRat), 4, 8));
  const redRat = piece('red', 1, 4, 7);
  assert.equal(movePiece([redRat, piece('blue', 2, 0, 6)], redRat.id, 4, 8).winner, 'red');
  const trapped = piece('blue', 8, 3, 0), attackingCat = piece('red', 2, 2, 0);
  assert.ok(has(legalMoves([trapped, attackingCat], attackingCat), 3, 0));
});
