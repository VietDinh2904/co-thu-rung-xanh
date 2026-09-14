import test from 'node:test';
import assert from 'node:assert/strict';
import { WIDTH, HEIGHT, initialPieces, effectiveRank, legalMoves } from './rules.js';

test('simple edition keeps the original 7×9 board and fixed starting pieces', () => {
  assert.equal(WIDTH, 7);
  assert.equal(HEIGHT, 9);
  const first = initialPieces(), second = initialPieces();
  assert.deepEqual(first, second);
  assert.equal(first.length, 16);
});

test('simple edition keeps the opponent trap at rank zero', () => {
  const trapped = { id: 'blue-8', team: 'blue', rank: 8, x: 2, y: 0 };
  const cat = { id: 'red-2', team: 'red', rank: 2, x: 1, y: 0 };
  assert.equal(effectiveRank(trapped), 0);
  assert.ok(legalMoves([trapped, cat], cat).some(move => move.x === 2 && move.y === 0));
});
