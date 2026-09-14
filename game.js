import { ANIMALS, WIDTH, HEIGHT, isRiver, isInside, isValidRiverLayout, trapOwner, denOwner, specialAt, effectiveRank, createInitialState, pieceAt, legalMoves, movePiece, SPECIAL_KINDS } from './rules.js';

const terrainDrawings = {
  jungle: '<span class="special-art" aria-hidden="true">🌳</span><span class="terrain-label">RỪNG</span>',
  home: '<span class="special-art" aria-hidden="true">🏡</span><span class="terrain-label">NHÀ</span>',
  mountain: '<span class="special-art" aria-hidden="true">⛰️</span><span class="terrain-label">NÚI</span>',
  spikes: '<span class="special-art" aria-hidden="true">🌵</span><span class="terrain-label">CHÔNG</span>'
};
const terrainNames = { river: 'sông', den: 'hang', trap: 'bẫy', jungle: 'rừng rậm', home: 'nhà', mountain: 'núi non', spikes: 'bẫy chông' };

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
const onlineStatus = document.querySelector('#onlineStatus');
const roomInput = document.querySelector('#roomInput');
const inviteBox = document.querySelector('#inviteBox');
const inviteLink = document.querySelector('#inviteLink');
const hostButton = document.querySelector('#hostButton');
const joinButton = document.querySelector('#joinButton');
const leaveButton = document.querySelector('#leaveButton');

const trapDrawing = `<svg class="terrain-svg" viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="45" rx="31" ry="23" fill="#b9784d"/><ellipse cx="40" cy="42" rx="26" ry="19" fill="#80543d"/><path d="M15 29c13 5 37 5 50 0M11 38c16 5 42 5 58 0M13 47c15 5 39 5 54 0M19 55c11 4 31 4 42 0M22 25l15 36M35 21l9 42M49 21l-4 42M61 25 46 61" fill="none" stroke="#e8c18d" stroke-width="2.4" stroke-linecap="round"/><path d="M10 18v38M70 18v38" stroke="#916540" stroke-width="5" stroke-linecap="round"/><circle cx="10" cy="18" r="5" fill="#d6a56b"/><circle cx="70" cy="18" r="5" fill="#d6a56b"/><path d="M6 59q-5-8-3-14m72 15q7-7 4-14" fill="none" stroke="#719e67" stroke-width="3" stroke-linecap="round"/></svg><span class="terrain-label">BẪY</span>`;
const denDrawing = `<svg class="terrain-svg" viewBox="0 0 80 80" aria-hidden="true"><path d="M3 63 26 17 42 40 55 10 78 63Z" fill="#8b957a"/><path d="m46 28 9-18 12 22-11-9-5 9Z" fill="#e2e5d1"/><path d="M4 64q7-24 24-26 20-3 31 13l8 13Z" fill="#aa9c7e"/><path d="M26 65V51a14 14 0 0 1 28 0v14Z" fill="#4b4e43"/><path d="M21 65V52a19 19 0 0 1 38 0v13" fill="none" stroke="#ddd3ad" stroke-width="3"/><path d="M0 68q11-17 20-3 7-9 15 1 13-10 22 0 13-12 23 2v12H0Z" fill="#7da56b"/><path d="M8 72q5-9 11 0m43 0q5-9 11 0" fill="none" stroke="#547e55" stroke-width="3" stroke-linecap="round"/></svg><span class="terrain-label">HANG</span>`;

let { pieces, specialTiles, riverTiles } = createInitialState();
let team = 'blue';
let selectedId = null;
let turn = 1;
let winner = null;
let history = [];
let online = { mode: 'local', peer: null, conn: null, connected: false, generation: 0 };

const animal = rank => ANIMALS.find(item => item.rank === rank);
const teamName = value => value === 'blue' ? 'Xanh' : 'Đỏ';
const coordName = (x, y) => `${String.fromCharCode(65 + x)}${9 - y}`;

function terrain(x, y) {
  if (isRiver(x, y, riverTiles)) return 'river';
  if (denOwner(x, y)) return 'den';
  if (trapOwner(x, y)) return 'trap';
  return specialAt(specialTiles, x, y) ?? 'grass';
}

function status(text) { statusMessage.textContent = text; }

function renderOnline() {
  const active = online.mode !== 'local';
  leaveButton.hidden = !active;
  inviteBox.hidden = online.mode !== 'host' || !inviteLink.value;
  hostButton.disabled = active;
  joinButton.disabled = active;
  roomInput.disabled = active;
  undoButton.disabled = active || history.length === 0;
  document.querySelector('#newGameButton').disabled = online.mode === 'guest';
}

function renderCaptured() {
  for (const [owner, element] of [['blue', blueCaptured], ['red', redCaptured]]) {
    const lost = ANIMALS.filter(item => !pieces.some(piece => piece.id === `${owner}-${item.rank}`));
    element.innerHTML = lost.length ? lost.map(item => `<span title="${item.name}" aria-label="${item.name}">${item.emoji}</span>`).join('') : '<span class="empty-capture">Chưa có</span>';
  }
}

function render() {
  const selected = pieces.find(piece => piece.id === selectedId);
  const moves = selected ? legalMoves(pieces, selected, specialTiles, riverTiles) : [];
  board.replaceChildren();
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const piece = pieceAt(pieces, x, y);
      const square = document.createElement('button');
      const kind = terrain(x, y);
      const move = moves.find(item => item.x === x && item.y === y);
      square.type = 'button';
      square.className = `square ${kind}${denOwner(x, y) ? ` ${denOwner(x, y)}-terrain` : ''}${trapOwner(x, y) ? ` ${trapOwner(x, y)}-terrain` : ''}${piece && effectiveRank(piece, specialTiles) === 0 ? ' trapped-piece' : ''}${move ? ` legal ${move.capture ? 'capture-target' : ''}` : ''}${piece?.id === selectedId ? ' selected' : ''}`;
      square.dataset.x = x;
      square.dataset.y = y;
      square.setAttribute('role', 'gridcell');
      square.setAttribute('aria-label', `${coordName(x, y)}, ${terrainNames[kind] ?? 'đất'}${piece ? `, ${animal(piece.rank).name} đội ${teamName(piece.team)}, bậc ${effectiveRank(piece, specialTiles)}${piece.wounds ? `, ${piece.wounds} vết thương` : ''}` : ''}${move ? ', đi được' : ''}`);
      if (kind === 'river') square.innerHTML = '<span class="river-lines" aria-hidden="true">〰<br>〰</span>';
      if (kind === 'trap') square.innerHTML = trapDrawing;
      if (kind === 'den') square.innerHTML = denDrawing;
      if (terrainDrawings[kind]) square.innerHTML = terrainDrawings[kind];
      if (kind === 'grass' && (x * 11 + y * 7) % 5 === 0) square.innerHTML = '<span class="grass-detail" aria-hidden="true">✿</span>';
      if (move) square.insertAdjacentHTML('beforeend', `<span class="move-marker${move.capture ? ' capture-marker' : ''}" aria-hidden="true"></span>`);
      if (piece) {
        const token = document.createElement('span');
        const power = effectiveRank(piece, specialTiles);
        token.className = `piece ${piece.team}${power === 0 ? ' weakened' : ''}`;
        const rankChange = power > piece.rank ? 'rank-up' : power < piece.rank ? 'rank-down' : 'rank-base';
        token.innerHTML = `<span class="piece-rank ${rankChange}" title="Bậc hiện tại ${power}${piece.wounds ? `, bị thương ${piece.wounds} lần` : ''}">${power}</span><span class="piece-emoji" aria-hidden="true">${animal(piece.rank).emoji}</span><span class="piece-name">${animal(piece.rank).name}</span>${piece.wounds ? `<span class="wound-mark" title="${piece.wounds} vết thương">🩹${piece.wounds}</span>` : ''}`;
        square.append(token);
      }
      board.append(square);
    }
  }
  turnTitle.textContent = winner ? `Đội ${teamName(winner)} thắng!` : `Đội ${teamName(team)}`;
  turnHint.textContent = winner ? 'Một cuộc phiêu lưu thật tuyệt!' : !online.connected && online.mode !== 'local' ? 'Đang chờ người chơi còn lại kết nối.' : online.mode !== 'local' && team !== (online.mode === 'host' ? 'blue' : 'red') ? 'Chờ đối thủ đi quân.' : selected ? `Đang chọn ${animal(selected.rank).name}. Chạm ô sáng để di chuyển.` : 'Chọn một quân thú để xem đường đi.';
  turnAvatar.textContent = winner ? '🏆' : team === 'blue' ? '🐘' : '🦁';
  turnAvatar.className = `turn-avatar ${winner ?? team}`;
  turnPill.textContent = winner ? 'HOÀN THÀNH' : `LƯỢT ${String(turn).padStart(2, '0')}`;
  renderCaptured();
  renderOnline();
}

function sendState(message = '') {
  if (online.mode === 'host' && online.connected && online.conn?.open) {
    online.conn.send({ type: 'state', pieces, specialTiles, riverTiles, team, turn, winner, message });
  }
}

function applyMove(pieceId, x, y) {
  const selected = pieces.find(piece => piece.id === pieceId);
  if (!selected || selected.team !== team) return false;
  const result = movePiece(pieces, pieceId, x, y, specialTiles, riverTiles);
  if (!result) return false;
  if (online.mode === 'local') history.push({ pieces: pieces.map(piece => ({ ...piece })), specialTiles: specialTiles.map(tile => ({ ...tile })), riverTiles: riverTiles.map(tile => ({ ...tile })), team, turn, winner });
  pieces = result.pieces;
  selectedId = null;
  let message;
  if (result.winner) {
    winner = result.winner;
    message = `🎉 Đội ${teamName(winner)} chiến thắng!`;
  } else {
    team = team === 'blue' ? 'red' : 'blue';
    turn++;
    message = result.captured ? `${animal(selected.rank).name} bắt được ${animal(result.captured.rank).name}! Đến lượt đội ${teamName(team)}.` : `Đến lượt đội ${teamName(team)}. Chọn một quân thú để đi.`;
  }
  if (result.wounded) message = `${animal(selected.rank).name} dẫm chông, bị thương vĩnh viễn −1! ${message}`;
  if (effectiveRank(pieces.find(piece => piece.id === pieceId), specialTiles) === 0 && trapOwner(x, y)) message = `${animal(selected.rank).name} sa bẫy: bậc 0! ${message}`;
  status(message);
  sendState(message);
  render();
  return true;
}

function onSquareClick(x, y) {
  if (winner) return;
  if (online.mode !== 'local' && !online.connected) { status('Hãy đợi người chơi còn lại kết nối.'); return; }
  if (online.mode === 'host' && team !== 'blue' || online.mode === 'guest' && team !== 'red') { status('Chưa đến lượt bạn.'); return; }
  const clicked = pieceAt(pieces, x, y);
  const selected = pieces.find(piece => piece.id === selectedId);
  if (selected) {
    if (legalMoves(pieces, selected, specialTiles, riverTiles).some(move => move.x === x && move.y === y)) {
      if (online.mode === 'guest') {
        online.conn.send({ type: 'move', pieceId: selected.id, x, y });
        selectedId = null;
        status('Đã gửi nước đi. Đang chờ chủ phòng xác nhận…');
        render();
      } else applyMove(selected.id, x, y);
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
  if (online.mode === 'guest') return;
  ({ pieces, specialTiles, riverTiles } = createInitialState()); team = 'blue'; selectedId = null; turn = 1; winner = null; history = [];
  status('Ván mới bắt đầu! Đội Xanh đi trước.');
  sendState('Chủ phòng đã bắt đầu ván mới. Đội Xanh đi trước.');
  render();
});
undoButton.addEventListener('click', () => {
  if (online.mode !== 'local') return;
  const previous = history.pop();
  if (!previous) return;
  ({ pieces, specialTiles, riverTiles, team, turn, winner } = previous);
  selectedId = null;
  status(`Đã đi lại lượt trước. Đến lượt đội ${teamName(team)}.`);
  render();
});

function validState(data) {
  if (!data || !Array.isArray(data.pieces) || data.pieces.length > 16 || data.pieces.length < 1 || !Array.isArray(data.specialTiles) || data.specialTiles.length !== SPECIAL_KINDS.length || !isValidRiverLayout(data.riverTiles)) return false;
  if (!['blue', 'red'].includes(data.team) || !Number.isSafeInteger(data.turn) || data.turn < 1 || ![null, 'blue', 'red'].includes(data.winner)) return false;
  const ids = new Set(), squares = new Set();
  for (const piece of data.pieces) {
    if (!piece || !['blue', 'red'].includes(piece.team) || !Number.isInteger(piece.rank) || piece.rank < 1 || piece.rank > 8 || piece.id !== `${piece.team}-${piece.rank}` || !Number.isInteger(piece.x) || !Number.isInteger(piece.y) || piece.x < 0 || piece.x >= WIDTH || piece.y < 0 || piece.y >= HEIGHT || !Number.isInteger(piece.wounds) || piece.wounds < 0 || piece.wounds > 100) return false;
    ids.add(piece.id); squares.add(`${piece.x},${piece.y}`);
  }
  if (ids.size !== data.pieces.length || squares.size !== data.pieces.length) return false;
  const tileSquares = new Set();
  for (const tile of data.specialTiles) {
    if (!tile || !SPECIAL_KINDS.includes(tile.kind) || !isInside(tile.x, tile.y) || isRiver(tile.x, tile.y, data.riverTiles) || denOwner(tile.x, tile.y) || trapOwner(tile.x, tile.y)) return false;
    tileSquares.add(`${tile.x},${tile.y}`);
  }
  return tileSquares.size === data.specialTiles.length && new Set(data.specialTiles.map(tile => tile.kind)).size === SPECIAL_KINDS.length;
}

function stopOnline(resetBoard = true) {
  const previous = online;
  online = { mode: 'local', peer: null, conn: null, connected: false, generation: previous.generation + 1 };
  previous.conn?.close();
  previous.peer?.destroy();
  inviteLink.value = '';
  if (resetBoard) {
    ({ pieces, specialTiles, riverTiles } = createInitialState()); team = 'blue'; selectedId = null; turn = 1; winner = null; history = [];
    status('Đã trở về chế độ chơi cùng thiết bị.');
  }
  onlineStatus.textContent = 'Đang chơi cùng thiết bị';
  render();
}

function connectData(conn, generation) {
  if (online.generation !== generation) { conn.close(); return; }
  if (online.conn && online.conn !== conn) { conn.close(); return; }
  online.conn = conn;
  conn.on('open', () => {
    if (online.generation !== generation) return;
    online.connected = true;
    onlineStatus.textContent = online.mode === 'host' ? 'Đã kết nối · Bạn là đội Xanh' : 'Đã kết nối · Bạn là đội Đỏ';
    status(online.mode === 'host' ? 'Người chơi đội Đỏ đã vào phòng. Bạn đi trước!' : 'Đã vào phòng. Chờ đội Xanh đi trước.');
    if (online.mode === 'host') sendState('Hai người đã kết nối. Đội Xanh đi trước.');
    render();
  });
  conn.on('data', data => {
    if (online.generation !== generation || !online.connected || typeof data !== 'object') return;
    if (online.mode === 'host' && data.type === 'move') {
      if (team !== 'red' || typeof data.pieceId !== 'string' || !data.pieceId.startsWith('red-') || !Number.isInteger(data.x) || !Number.isInteger(data.y) || !applyMove(data.pieceId, data.x, data.y)) sendState('Nước đi không hợp lệ. Hãy chọn lại quân Đỏ.');
    } else if (online.mode === 'guest' && data.type === 'state' && validState(data)) {
      pieces = data.pieces.map(piece => ({ ...piece }));
      specialTiles = data.specialTiles.map(tile => ({ ...tile }));
      riverTiles = data.riverTiles.map(tile => ({ ...tile }));
      team = data.team; turn = data.turn; winner = data.winner; selectedId = null; history = [];
      status(typeof data.message === 'string' ? data.message.slice(0, 180) : 'Bàn cờ đã đồng bộ.');
      render();
    }
  });
  conn.on('close', () => {
    if (online.generation !== generation || online.conn !== conn) return;
    online.conn = null; online.connected = false; selectedId = null;
    onlineStatus.textContent = online.mode === 'host' ? 'Khách đã rời phòng · có thể mời lại' : 'Mất kết nối với chủ phòng';
    status('Kết nối đã đóng. Hãy rời phòng để chơi lại hoặc tạo phòng khác.');
    render();
  });
  conn.on('error', () => { if (online.generation === generation) { onlineStatus.textContent = 'Không thể kết nối. Hãy thử lại.'; render(); } });
}

function roomIdFromInput(value) {
  const text = value.trim();
  if (!text) return null;
  let id = text;
  if (text.includes('#room=')) {
    try { id = new URL(text, location.href).hash.replace(/^#room=/, ''); } catch { return null; }
  }
  try { id = decodeURIComponent(id); } catch { return null; }
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id) ? id : null;
}

function startOnline(mode) {
  const roomId = mode === 'guest' ? roomIdFromInput(roomInput.value) : null;
  if (mode === 'guest' && !roomId) { onlineStatus.textContent = 'Mã phòng hoặc link mời không hợp lệ.'; return; }
  if (!window.Peer) { onlineStatus.textContent = 'Không tải được kết nối trực tuyến. Kiểm tra mạng và tải lại trang.'; return; }
  stopOnline(true);
  online.mode = mode;
  const generation = online.generation;
  onlineStatus.textContent = mode === 'host' ? 'Đang tạo phòng…' : 'Đang kết nối phòng…';
  status(mode === 'host' ? 'Đang mở phòng trực tuyến…' : 'Đang tham gia phòng trực tuyến…');
  render();
  const peer = new window.Peer();
  online.peer = peer;
  peer.on('open', id => {
    if (online.generation !== generation) return;
    if (mode === 'host') {
      inviteLink.value = `${location.origin}${location.pathname}#room=${encodeURIComponent(id)}`;
      onlineStatus.textContent = 'Phòng đã sẵn sàng · Chờ đội Đỏ';
      status('Sao chép link mời và gửi cho người chơi đội Đỏ.');
      render();
    } else connectData(peer.connect(roomId, { reliable: true }), generation);
  });
  peer.on('connection', conn => {
    if (online.generation !== generation || mode !== 'host') { conn.close(); return; }
    connectData(conn, generation);
  });
  peer.on('error', error => {
    if (online.generation !== generation) return;
    onlineStatus.textContent = error?.type === 'peer-unavailable' ? 'Không tìm thấy phòng. Kiểm tra lại link mời.' : 'Lỗi kết nối. Hãy rời phòng và thử lại.';
    status(onlineStatus.textContent);
    render();
  });
}

hostButton.addEventListener('click', () => startOnline('host'));
joinButton.addEventListener('click', () => startOnline('guest'));
roomInput.addEventListener('keydown', event => { if (event.key === 'Enter') startOnline('guest'); });
leaveButton.addEventListener('click', () => stopOnline(true));
document.querySelector('#copyInviteButton').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(inviteLink.value); onlineStatus.textContent = 'Đã sao chép link mời!'; }
  catch { inviteLink.select(); onlineStatus.textContent = 'Chọn và sao chép link mời ở trên.'; }
});
if (location.hash.startsWith('#room=')) {
  roomInput.value = location.hash.slice(6);
  onlineStatus.textContent = 'Đã có link mời. Bấm “Vào” để tham gia.';
}

document.querySelector('#rulesButton').addEventListener('click', () => rulesDialog.showModal());
document.querySelector('#closeRulesButton').addEventListener('click', () => rulesDialog.close());
document.querySelector('#startButton').addEventListener('click', () => rulesDialog.close());
rulesDialog.addEventListener('click', event => { if (event.target === rulesDialog) rulesDialog.close(); });

document.querySelector('#rankList').innerHTML = ANIMALS.map(item => `<span title="${item.name}: bậc ${item.rank}"><b>${item.emoji}</b><small>${item.rank}</small></span>`).join('');
render();
