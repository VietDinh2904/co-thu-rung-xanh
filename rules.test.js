import test from 'node:test';
import assert from 'node:assert/strict';
import { effectiveRank, initialPieces, isRiver, legalMoves, movePiece } from './rules.js';

const piece = (team, rank, x, y) => ({ id: `${team}-${rank}`, team, rank, x, y });
const has = (moves, x, y) => moves.some(move => move.x === x && move.y === y);

test('the game starts with eight distinct animals per team and blue goes from the bottom', () => {
  const pieces = initialPieces();
  assert.equal(pieces.length, 16);
  assert.equal(new Set(pieces.map(item => item.id)).size, 16);
  assert.equal(pieces.filter(item => item.team === 'blue').length, 8);
  assert.ok(pieces.filter(item => item.team === 'blue').every(item => item.y >= 6));
});

test('only rats enter the river, and land animals cannot capture a swimming rat', () => {
  const rat = piece('blue', 1, 0, 3);
  const cat = piece('blue', 2, 0, 4);
  const swimmingRat = piece('red', 1, 1, 4);
  assert.ok(has(legalMoves([rat], rat), 1, 3));
  assert.ok(!has(legalMoves([cat], cat), 1, 4));
  assert.ok(!has(legalMoves([cat, swimmingRat], cat), 1, 4));
  assert.ok(isRiver(1, 4));
});

test('a swimming rat cannot capture a land animal while leaving water', () => {
  const rat = piece('blue', 1, 1, 3);
  const elephant = piece('red', 8, 0, 3);
  assert.ok(!has(legalMoves([rat, elephant], rat), 0, 3));
  assert.ok(has(legalMoves([rat], rat), 0, 3));
});

test('lion jumps the river unless a rat blocks the path', () => {
  const lion = piece('blue', 7, 0, 4);
  assert.ok(has(legalMoves([lion], lion), 3, 4));
  const rat = piece('red', 1, 1, 4);
  assert.ok(!has(legalMoves([lion, rat], lion), 3, 4));
});

test('rats capture elephants on land, but elephants cannot capture rats', () => {
  const rat = piece('blue', 1, 0, 2);
  const elephant = piece('red', 8, 0, 1);
  assert.ok(has(legalMoves([rat, elephant], rat), 0, 1));
  assert.ok(!has(legalMoves([rat, elephant], elephant), 0, 2));
});

test('a trapped enemy has zero strength and restores strength after leaving', () => {
  const mouse = piece('blue', 1, 2, 1);
  const elephant = piece('red', 8, 2, 0);
  assert.ok(has(legalMoves([mouse, elephant], mouse), 2, 0));
  const trappedBlueElephant = piece('blue', 8, 2, 0);
  const redCat = piece('red', 2, 1, 0);
  assert.ok(has(legalMoves([trappedBlueElephant, redCat], redCat), 2, 0));
  assert.ok(!has(legalMoves([trappedBlueElephant, redCat], trappedBlueElephant), 1, 0));
  assert.equal(effectiveRank(trappedBlueElephant), 0);
  assert.equal(effectiveRank({ ...trappedBlueElephant, x: 1, y: 1 }), 8);
});

test('pieces cannot enter their own den; entering the enemy den wins', () => {
  const blueRat = piece('blue', 1, 3, 7);
  assert.ok(!has(legalMoves([blueRat], blueRat), 3, 8));
  const redRat = piece('red', 1, 3, 7);
  const result = movePiece([redRat, piece('blue', 2, 0, 6)], redRat.id, 3, 8);
  assert.equal(result.winner, 'red');
});

test('capturing the last enemy piece wins and illegal moves do not change state', () => {
  const dog = piece('blue', 4, 0, 1);
  const cat = piece('red', 2, 0, 0);
  assert.equal(movePiece([dog, cat], dog.id, 3, 3), null);
  const result = movePiece([dog, cat], dog.id, 0, 0);
  assert.equal(result.winner, 'blue');
  assert.equal(result.captured.id, cat.id);
  assert.equal(result.pieces.length, 1);
});
