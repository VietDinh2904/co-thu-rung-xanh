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
export function isRiver(x, y) { return y >= 3 && y <= 5 && ((x >= 1 && x <= 3) || (x >= 5 && x <= 7)); }
export function isInside(x, y) { return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT; }
export function sameSquare(a, x, y) { return a[0] === x && a[1] === y; }
export function trapOwner(x, y) { return Object.keys(TRAPS).find(team => TRAPS[team].some(square => sameSquare(square, x, y))) ?? null; }
export function denOwner(x, y) { return Object.keys(DENS).find(team => sameSquare(DENS[team], x, y)) ?? null; }
export function pieceAt(pieces, x, y) { return pieces.find(piece => piece.x === x && piece.y === y); }
export function specialAt(tiles, x, y) { return tiles.find(tile => tile.x === x && tile.y === y)?.kind ?? null; }
export function phaseForTurn(turn) { return ['day', 'day', 'night', 'fullmoon'][(turn - 1) % 4]; }
export function tileBonus(rank, kind) {
  if (kind === 'jungle') return rank === 6 ? 1 : [1, 2, 4].includes(rank) ? -1 : 0;
  if (kind === 'home') return [1, 2, 4].includes(rank) ? 1 : -2;
  if (kind === 'mountain') return [3, 5].includes(rank) ? 1 : -1;
  return 0;
}
export function effectiveRank(piece, tiles = [], turn = 1) {
  if (trapOwner(piece.x, piece.y) && trapOwner(piece.x, piece.y) !== piece.team) return 0;
  const phase = phaseForTurn(turn);
  const phaseBonus = phase === 'night' ? (piece.rank === 3 ? 2 : piece.rank === 6 ? 1 : 0) : phase === 'fullmoon' && piece.rank === 3 ? 3 : 0;
  return Math.max(0, piece.rank - (piece.wounds ?? 0) + tileBonus(piece.rank, specialAt(tiles, piece.x, piece.y)) + phaseBonus);
}
function shuffle(items, rng) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
export function createInitialState(rng = Math.random) {
  const pieces = [], specialTiles = [];
  for (const team of ['red', 'blue']) {
    const ys = team === 'red' ? [0, 1, 2] : [6, 7, 8];
    const cells = shuffle(ys.flatMap(y => Array.from({ length: WIDTH }, (_, x) => ({ x, y }))).filter(({ x, y }) => !denOwner(x, y) && !trapOwner(x, y)), rng);
    for (let rank = 1; rank <= 8; rank++) {
      const { x, y } = cells.pop();
      pieces.push({ id: `${team}-${rank}`, team, rank, x, y, wounds: 0 });
    }
    for (const kind of SPECIAL_KINDS) for (let i = 0; i < 2; i++) {
      const { x, y } = cells.pop();
      specialTiles.push({ x, y, kind });
    }
  }
  return { pieces, specialTiles };
}
export function initialPieces(rng = Math.random) { return createInitialState(rng).pieces; }
function canCapture(attacker, defender, to, tiles, turn) {
  if (!defender) return true;
  if (attacker.team === defender.team) return false;
  const fromWater = isRiver(attacker.x, attacker.y), toWater = isRiver(to.x, to.y);
  if (fromWater !== toWater) return false;
  if (phaseForTurn(turn) === 'night' && defender.rank === 1) return attacker.rank === 2;
  if (trapOwner(to.x, to.y) === attacker.team) return true;
  const attackerPower = effectiveRank(attacker, tiles, turn), defenderPower = effectiveRank(defender, tiles, turn);
  if (attacker.rank === 1 && defender.rank === 8 && !fromWater && specialAt(tiles, to.x, to.y) !== 'jungle') return true;
  if (attacker.rank === 8 && defender.rank === 1) return false;
  return attackerPower >= defenderPower;
}
export function legalMoves(pieces, piece, tiles = [], turn = 1) {
  if (!piece) return [];
  const moves = [];
  const add = (x, y) => {
    if (!isInside(x, y) || (isRiver(x, y) && piece.rank !== 1) || denOwner(x, y) === piece.team) return;
    const target = pieceAt(pieces, x, y);
    if (canCapture(piece, target, { x, y }, tiles, turn) && !moves.some(move => move.x === x && move.y === y)) moves.push({ x, y, capture: Boolean(target) });
  };
  for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    let x = piece.x + dx, y = piece.y + dy;
    if (isRiver(x, y) && piece.rank !== 1) {
      if (piece.rank !== 6 && piece.rank !== 7) continue;
      let blocked = false;
      while (isInside(x, y) && isRiver(x, y)) {
        if (pieceAt(pieces, x, y)) blocked = true;
        x += dx; y += dy;
      }
      if (blocked) continue;
    }
    add(x, y);
  }
  const bonus = tileBonus(piece.rank, specialAt(tiles, piece.x, piece.y));
  const jump = phaseForTurn(turn) === 'fullmoon' && piece.rank === 3 ? 3 : bonus > 0 ? 2 : 0;
  if (jump) for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
    if (dx || dy) add(piece.x + dx * jump, piece.y + dy * jump);
  }
  return moves;
}
export function movePiece(pieces, pieceId, x, y, tiles = [], turn = 1) {
  const piece = pieces.find(item => item.id === pieceId);
  if (!piece || !legalMoves(pieces, piece, tiles, turn).some(move => move.x === x && move.y === y)) return null;
  const captured = pieceAt(pieces, x, y);
  let wounded = false;
  const next = pieces.filter(item => item !== captured).map(item => {
    if (item.id !== pieceId) return { ...item };
    const moved = { ...item, x, y };
    if (specialAt(tiles, x, y) === 'spikes' && effectiveRank(moved, tiles, turn) >= 6) {
      moved.wounds = (moved.wounds ?? 0) + 1;
      wounded = true;
    }
    return moved;
  });
  const opponent = piece.team === 'blue' ? 'red' : 'blue';
  const winner = denOwner(x, y) === opponent || !next.some(item => item.team === opponent) ? piece.team : null;
  return { pieces: next, captured: captured ?? null, winner, wounded };
}
