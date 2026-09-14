export const WIDTH = 7;
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

export const DENS = { red: [3, 0], blue: [3, 8] };
export const TRAPS = {
  red: [[2, 0], [4, 0], [3, 1]],
  blue: [[2, 8], [4, 8], [3, 7]]
};

export function isRiver(x, y) {
  return y >= 3 && y <= 5 && ((x >= 1 && x <= 2) || (x >= 4 && x <= 5));
}
export function isInside(x, y) { return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT; }
export function sameSquare(a, x, y) { return a[0] === x && a[1] === y; }
export function trapOwner(x, y) {
  return Object.keys(TRAPS).find(team => TRAPS[team].some(square => sameSquare(square, x, y))) ?? null;
}
export function denOwner(x, y) {
  return Object.keys(DENS).find(team => sameSquare(DENS[team], x, y)) ?? null;
}
export function pieceAt(pieces, x, y) { return pieces.find(piece => piece.x === x && piece.y === y); }

export function initialPieces() {
  const red = [[7, 0, 0], [6, 6, 0], [5, 2, 2], [4, 1, 1], [3, 5, 1], [2, 1, 2], [1, 6, 2], [8, 0, 2]];
  return [
    ...red.map(([rank, x, y]) => ({ id: `red-${rank}`, team: 'red', rank, x, y })),
    ...red.map(([rank, x, y]) => ({ id: `blue-${rank}`, team: 'blue', rank, x: 6 - x, y: 8 - y }))
  ];
}

function canCapture(attacker, defender, from, to) {
  if (!defender) return true;
  if (attacker.team === defender.team) return false;
  const fromWater = isRiver(from.x, from.y);
  const toWater = isRiver(to.x, to.y);
  if (fromWater !== toWater) return false;
  if (trapOwner(to.x, to.y) === attacker.team) return true;
  const attackerPower = trapOwner(from.x, from.y) === defender.team ? 0 : attacker.rank;
  if (attackerPower === 1 && defender.rank === 8 && !fromWater) return true;
  if (attackerPower === 8 && defender.rank === 1) return false;
  return attackerPower >= defender.rank;
}

export function legalMoves(pieces, piece) {
  if (!piece) return [];
  const moves = [];
  for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    let x = piece.x + dx;
    let y = piece.y + dy;
    if (!isInside(x, y)) continue;
    if (isRiver(x, y) && piece.rank !== 1) {
      if (piece.rank !== 6 && piece.rank !== 7) continue;
      let blocked = false;
      while (isInside(x, y) && isRiver(x, y)) {
        if (pieceAt(pieces, x, y)) blocked = true;
        x += dx;
        y += dy;
      }
      if (blocked || !isInside(x, y)) continue;
    }
    if (denOwner(x, y) === piece.team) continue;
    const target = pieceAt(pieces, x, y);
    if (canCapture(piece, target, piece, { x, y })) moves.push({ x, y, capture: Boolean(target) });
  }
  return moves;
}

export function movePiece(pieces, pieceId, x, y) {
  const piece = pieces.find(item => item.id === pieceId);
  if (!piece || !legalMoves(pieces, piece).some(move => move.x === x && move.y === y)) return null;
  const captured = pieceAt(pieces, x, y);
  const next = pieces.filter(item => item !== captured).map(item => item.id === pieceId ? { ...item, x, y } : { ...item });
  const opponent = piece.team === 'blue' ? 'red' : 'blue';
  const winner = denOwner(x, y) === opponent || !next.some(item => item.team === opponent) ? piece.team : null;
  return { pieces: next, captured: captured ?? null, winner };
}
