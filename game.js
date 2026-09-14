import { ANIMALS, WIDTH, HEIGHT, DENS, isRiver, trapOwner, denOwner, initialPieces, pieceAt, legalMoves, movePiece } from './rules.js';

const board = document.querySelector('#board');
const statusMessage = document.querySelector('#statusMessage');
const turnTitle = document.querySelector('#turnTitle');
const turnHint = document.querySelector('#turnHint');
const turnAvatar = document.querySelector('#turnAvatar');
const turnPill = document.querySelector('#turnPill');
const undoButton = document.querySelector('#undoButton');
const blueCaptured = document.querySelector('#blueCaptured');
const redCaptured = document.querySelector('#redCaptured');
const rulesDialog = document.querySelector('#rulesDialog');

let pieces = initialPieces();
let team = 'blue';
let selectedId = null;
let turn = 1;
let winner = null;
let history = [];

const animal = rank => ANIMALS.find(item => item.rank === rank);
const teamName = value => value === 'blue' ? 'Xanh' : 'Đỏ';
const coordName = (x, y) => `${String.fromCharCode(65 + x)}${9 - y}`;

function terrain(x, y) {
  if (isRiver(x, y)) return 'river';
  if (denOwner(x, y)) return 'den';
  if (trapOwner(x, y)) return 'trap';
  return 'grass';
}

function status(text) { statusMessage.textContent = text; }

function renderCaptured() {
  for (const [owner, element] of [['blue', blueCaptured], ['red', redCaptured]]) {
    const lost = ANIMALS.filter(item => !pieces.some(piece => piece.id === `${owner}-${item.rank}`));
    element.innerHTML = lost.length ? lost.map(item => `<span title="${item.name}" aria-label="${item.name}">${item.emoji}</span>`).join('') : '<span class="empty-capture">Chưa có</span>';
  }
}

function render() {
  const selected = pieces.find(piece => piece.id === selectedId);
  const moves = selected ? legalMoves(pieces, selected) : [];
  board.replaceChildren();
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const piece = pieceAt(pieces, x, y);
      const square = document.createElement('button');
      const kind = terrain(x, y);
      const move = moves.find(item => item.x === x && item.y === y);
      square.type = 'button';
      square.className = `square ${kind}${denOwner(x, y) ? ` ${denOwner(x, y)}-terrain` : ''}${trapOwner(x, y) ? ` ${trapOwner(x, y)}-terrain` : ''}${move ? ` legal ${move.capture ? 'capture-target' : ''}` : ''}${piece?.id === selectedId ? ' selected' : ''}`;
      square.dataset.x = x;
      square.dataset.y = y;
      square.setAttribute('role', 'gridcell');
      square.setAttribute('aria-label', `${coordName(x, y)}, ${kind === 'river' ? 'sông' : kind === 'den' ? 'hang' : kind === 'trap' ? 'bẫy' : 'đất'}${piece ? `, ${animal(piece.rank).name} đội ${teamName(piece.team)}` : ''}${move ? ', đi được' : ''}`);
      if (kind === 'river') square.innerHTML = '<span class="river-lines" aria-hidden="true">〰<br>〰</span>';
      if (kind === 'trap') square.innerHTML = '<span class="terrain-art trap-art" aria-hidden="true">✳</span><span class="terrain-label">BẪY</span>';
      if (kind === 'den') square.innerHTML = '<span class="terrain-art den-art" aria-hidden="true">⌂</span><span class="terrain-label">HANG</span>';
      if (kind === 'grass' && (x * 11 + y * 7) % 5 === 0) square.innerHTML = '<span class="grass-detail" aria-hidden="true">✿</span>';
      if (move) square.insertAdjacentHTML('beforeend', `<span class="move-marker${move.capture ? ' capture-marker' : ''}" aria-hidden="true"></span>`);
      if (piece) {
        const token = document.createElement('span');
        token.className = `piece ${piece.team}`;
        token.innerHTML = `<span class="piece-rank">${piece.rank}</span><span class="piece-emoji" aria-hidden="true">${animal(piece.rank).emoji}</span><span class="piece-name">${animal(piece.rank).name}</span>`;
        square.append(token);
      }
      board.append(square);
    }
  }
  turnTitle.textContent = winner ? `Đội ${teamName(winner)} thắng!` : `Đội ${teamName(team)}`;
  turnHint.textContent = winner ? 'Một cuộc phiêu lưu thật tuyệt!' : selected ? `Đang chọn ${animal(selected.rank).name}. Chạm ô sáng để di chuyển.` : 'Chọn một quân thú để xem đường đi.';
  turnAvatar.textContent = winner ? '🏆' : team === 'blue' ? '🐘' : '🦁';
  turnAvatar.className = `turn-avatar ${winner ?? team}`;
  turnPill.textContent = winner ? 'HOÀN THÀNH' : `LƯỢT ${String(turn).padStart(2, '0')}`;
  undoButton.disabled = history.length === 0;
  renderCaptured();
}

function onSquareClick(x, y) {
  if (winner) return;
  const clicked = pieceAt(pieces, x, y);
  const selected = pieces.find(piece => piece.id === selectedId);
  if (selected) {
    const result = movePiece(pieces, selected.id, x, y);
    if (result) {
      history.push({ pieces: pieces.map(piece => ({ ...piece })), team, turn, winner });
      pieces = result.pieces;
      selectedId = null;
      if (result.winner) {
        winner = result.winner;
        status(`🎉 Đội ${teamName(winner)} chiến thắng! Chơi ván mới để khám phá khu rừng lần nữa.`);
      } else {
        team = team === 'blue' ? 'red' : 'blue';
        turn++;
        status(result.captured ? `${animal(selected.rank).name} bắt được ${animal(result.captured.rank).name}! Đến lượt đội ${teamName(team)}.` : `Đến lượt đội ${teamName(team)}. Chọn một quân thú để đi.`);
      }
      render();
      return;
    }
  }
  if (clicked?.team === team) {
    selectedId = selectedId === clicked.id ? null : clicked.id;
    status(selectedId ? `${animal(clicked.rank).name}: chọn một ô được đánh dấu để di chuyển.` : `Đã bỏ chọn. Đến lượt đội ${teamName(team)}.`);
  } else if (selectedId) {
    status('Ô này không đi được. Hãy chọn một ô được đánh dấu.');
  } else {
    status(`Đến lượt đội ${teamName(team)}. Hãy chọn quân của đội mình.`);
  }
  render();
}

board.addEventListener('click', event => {
  const square = event.target.closest('.square');
  if (square) onSquareClick(Number(square.dataset.x), Number(square.dataset.y));
});

document.querySelector('#newGameButton').addEventListener('click', () => {
  pieces = initialPieces(); team = 'blue'; selectedId = null; turn = 1; winner = null; history = [];
  status('Ván mới bắt đầu! Đội Xanh đi trước.');
  render();
});
undoButton.addEventListener('click', () => {
  const previous = history.pop();
  if (!previous) return;
  ({ pieces, team, turn, winner } = previous);
  selectedId = null;
  status(`Đã đi lại lượt trước. Đến lượt đội ${teamName(team)}.`);
  render();
});

document.querySelector('#rulesButton').addEventListener('click', () => rulesDialog.showModal());
document.querySelector('#closeRulesButton').addEventListener('click', () => rulesDialog.close());
document.querySelector('#startButton').addEventListener('click', () => rulesDialog.close());
rulesDialog.addEventListener('click', event => { if (event.target === rulesDialog) rulesDialog.close(); });

document.querySelector('#rankList').innerHTML = ANIMALS.map(item => `<span title="${item.name}: bậc ${item.rank}"><b>${item.emoji}</b><small>${item.rank}</small></span>`).join('');
render();
