export const WIDTH = 9;
export const HEIGHT = 9;
export const ANIMALS = [
  { rank: 8, name: 'Voi', emoji: '🐘' },
  { rank: 7, name: 'Sư tử', emoji: '🦁' },
  { rank: 6, name: 'Hổ', emoji: '🐯' },
  { rank: 5, name: 'Báo', emoji: '🐆' },
  { rank: 4, name: 'Chó', emoji: '🐶' },
  { rank: 3, name: 'Sói', emoji: '🐺' },
  { rank: 2, name: 'Mèo', emoji: '🐱' },
  { rank: 1, name: 'Chuột', emoji: '🐭' }
];

export const DENS = { red: [4, 0], blue: [4, 8] };
export const TRAPS = { red: [[3, 0], [5, 0], [4, 1]], blue: [[3, 8], [5, 8], [4, 7]] };
export const SPECIAL_KINDS = ['jungle', 'home', 'mountain', 'spikes'];
export const DEFAULT_RIVER = [1, 2, 3, 5, 6, 7].flatMap(x => [3, 4].map(y => ({ x, y })));
export function isRiver(x, y, riverTiles = DEFAULT_RIVER) { return riverTiles.some(square => square.x === x && square.y === y); }
export function isInside(x, y) { return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT; }
export function sameSquare(a, x, y) { return a[0] === x && a[1] === y; }
export function trapOwner(x, y) { return Object.keys(TRAPS).find(team => TRAPS[team].some(square => sameSquare(square, x, y))) ?? null; }
export function denOwner(x, y) { return Object.keys(DENS).find(team => sameSquare(DENS[team], x, y)) ?? null; }
export function pieceAt(pieces, x, y) { return pieces.find(piece => piece.x === x && piece.y === y); }
export function specialAt(tiles, x, y) { return tiles.find(tile => tile.x === x && tile.y === y)?.kind ?? null; }
export function tileBonus(rank, kind) {
  if (kind === 'jungle') return rank === 6 ? 1 : [1, 2, 4].includes(rank) ? -1 : 0;
  if (kind === 'home') return [1, 2, 4].includes(rank) ? 1 : -2;
  if (kind === 'mountain') return [3, 5].includes(rank) ? 1 : -1;
  return 0;
}
export function effectiveRank(piece, tiles = []) {
  if (trapOwner(piece.x, piece.y) && trapOwner(piece.x, piece.y) !== piece.team) return 0;
  return Math.max(0, piece.rank - (piece.wounds ?? 0) + tileBonus(piece.rank, specialAt(tiles, piece.x, piece.y)));
}
function shuffle(items, rng) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function riverBlock(side, rng) {
  const horizontal = rng() < .5;
  const width = horizontal ? 3 : 2, height = horizontal ? 2 : 3;
  const left = side === 'left' ? 1 : 5;
  const x = left + Math.floor(rng() * (4 - width));
  const y = 3 + Math.floor(rng() * (4 - height));
  return Array.from({ length: width * height }, (_, index) => ({ x: x + index % width, y: y + Math.floor(index / width) }));
}
export function createRiverTiles(rng = Math.random) { return [...riverBlock('left', rng), ...riverBlock('right', rng)]; }
export function isValidRiverLayout(riverTiles) {
  if (!Array.isArray(riverTiles) || riverTiles.length !== 12) return false;
  const unique = new Set();
  for (const tile of riverTiles) {
    if (!tile || !isInside(tile.x, tile.y) || tile.y < 3 || tile.y > 5 || !((tile.x >= 1 && tile.x <= 3) || (tile.x >= 5 && tile.x <= 7))) return false;
    unique.add(`${tile.x},${tile.y}`);
  }
  if (unique.size !== 12) return false;
  return [[1, 3], [5, 7]].every(([min, max]) => {
    const block = riverTiles.filter(tile => tile.x >= min && tile.x <= max);
    if (block.length !== 6) return false;
    const xs = block.map(tile => tile.x), ys = block.map(tile => tile.y);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    const width = Math.max(...xs) - x0 + 1, height = Math.max(...ys) - y0 + 1;
    return ((width === 2 && height === 3) || (width === 3 && height === 2)) &&
      block.every(tile => tile.x >= x0 && tile.x < x0 + width && tile.y >= y0 && tile.y < y0 + height);
  });
}
export function createInitialState(rng = Math.random) {
  const pieces = [], specialTiles = [], riverTiles = createRiverTiles(rng);
  const shores = {};
  for (const team of ['red', 'blue']) {
    const ys = team === 'red' ? [0, 1, 2] : [6, 7, 8];
    const cells = shuffle(ys.flatMap(y => Array.from({ length: WIDTH }, (_, x) => ({ x, y }))).filter(({ x, y }) => !denOwner(x, y) && !trapOwner(x, y)), rng);
    for (let rank = 1; rank <= 8; rank++) {
      const { x, y } = cells.pop();
      pieces.push({ id: `${team}-${rank}`, team, rank, x, y, wounds: 0 });
    }
    shores[team] = cells;
  }
  shuffle([...SPECIAL_KINDS], rng).forEach((kind, index) => {
    const { x, y } = shores[index < 2 ? 'red' : 'blue'].pop();
    specialTiles.push({ x, y, kind });
  });
  return { pieces, specialTiles, riverTiles };
}
export function initialPieces(rng = Math.random) { return createInitialState(rng).pieces; }
function canCapture(attacker, defender, to, tiles, riverTiles) {
  if (!defender) return true;
  if (attacker.team === defender.team) return false;
  const fromWater = isRiver(attacker.x, attacker.y, riverTiles), toWater = isRiver(to.x, to.y, riverTiles);
  if (fromWater !== toWater) return false;
  if (trapOwner(to.x, to.y) === attacker.team) return true;
  const attackerPower = effectiveRank(attacker, tiles), defenderPower = effectiveRank(defender, tiles);
  if (attacker.rank === 1 && defender.rank === 8 && !fromWater && specialAt(tiles, to.x, to.y) !== 'jungle') return true;
  if (attacker.rank === 8 && defender.rank === 1) return false;
  return attackerPower >= defenderPower;
}
export function legalMoves(pieces, piece, tiles = [], riverTiles = DEFAULT_RIVER) {
  if (!piece) return [];
  const moves = [];
  const add = (x, y) => {
    if (!isInside(x, y) || (isRiver(x, y, riverTiles) && piece.rank !== 1) || denOwner(x, y) === piece.team) return;
    const target = pieceAt(pieces, x, y);
    if (canCapture(piece, target, { x, y }, tiles, riverTiles) && !moves.some(move => move.x === x && move.y === y)) moves.push({ x, y, capture: Boolean(target) });
  };
  for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    let x = piece.x + dx, y = piece.y + dy;
    if (isRiver(x, y, riverTiles) && piece.rank !== 1) {
      if (piece.rank !== 6 && piece.rank !== 7) continue;
      let blocked = false;
      while (isInside(x, y) && isRiver(x, y, riverTiles)) {
        if (pieceAt(pieces, x, y)) blocked = true;
        x += dx; y += dy;
      }
      if (blocked) continue;
    }
    add(x, y);
  }
  const bonus = tileBonus(piece.rank, specialAt(tiles, piece.x, piece.y));
  const jump = bonus > 0 ? 2 : 0;
  if (jump) for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
    if (dx || dy) add(piece.x + dx * jump, piece.y + dy * jump);
  }
  return moves;
}
export function movePiece(pieces, pieceId, x, y, tiles = [], riverTiles = DEFAULT_RIVER) {
  const piece = pieces.find(item => item.id === pieceId);
  if (!piece || !legalMoves(pieces, piece, tiles, riverTiles).some(move => move.x === x && move.y === y)) return null;
  const captured = pieceAt(pieces, x, y);
  let wounded = false;
  const next = pieces.filter(item => item !== captured).map(item => {
    if (item.id !== pieceId) return { ...item };
    const moved = { ...item, x, y };
    if (specialAt(tiles, x, y) === 'spikes' && effectiveRank(moved, tiles) >= 6) {
      moved.wounds = (moved.wounds ?? 0) + 1;
      wounded = true;
    }
    return moved;
  });
  const opponent = piece.team === 'blue' ? 'red' : 'blue';
  const winner = denOwner(x, y) === opponent || !next.some(item => item.team === opponent) ? piece.team : null;
  return { pieces: next, captured: captured ?? null, winner, wounded };
}
