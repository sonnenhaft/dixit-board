const canvas = document.getElementById('dixit-board-canvas');
const ctx = canvas.getContext('2d');

const img = new Image();
img.src = 'dixit-board.webp';

let draggingChip = null;

const BASE_WIDTH = 784;
const BASE_HEIGHT = 1414;
const BASE_CHIP_SIZE = 72;
const BORDER = 6;

const MIN_RADIUS_PX = 10;

// 🎨 приятные пастельные цвета
const chips = [
    { x: 0, y: 0, color: '#f4a7a8', textColor: '#222', label: '1' },
    { x: 0, y: 0, color: '#a8dadc', textColor: '#222', label: '2' },
    { x: 0, y: 0, color: '#bde0fe', textColor: '#222', label: '3' },
    { x: 0, y: 0, color: '#cdb4db', textColor: '#222', label: '4' },
    { x: 0, y: 0, color: '#ffc8dd', textColor: '#222', label: '5' },

    { x: 0, y: 0, color: '#d8f3dc', textColor: '#222', label: '6' },
    { x: 0, y: 0, color: '#ffd6a5', textColor: '#222', label: '7' },
    { x: 0, y: 0, color: '#fdffb6', textColor: '#222', label: '8' },
    { x: 0, y: 0, color: '#caffbf', textColor: '#222', label: '9' },
    { x: 0, y: 0, color: '#b5ead7', textColor: '#222', label: '10' }
];

let drawWidth = 0;
let drawHeight = 0;
let initialized = false;

function getRadiusPx() {
    const scaled = drawWidth * (BASE_CHIP_SIZE / BASE_WIDTH) / 2;
    return Math.max(MIN_RADIUS_PX, scaled);
}

// 🔥 2 ряда × 5 колонок, вплотную
function initChips() {
    const cols = 5;

    const r = getRadiusPx();
    const step = 2 * r;

    chips.forEach((chip, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const px = r + col * step;
        const py = r + row * step;

        chip.x = px / drawWidth;
        chip.y = py / drawHeight;
    });
}

function resize() {
    const cw = window.innerWidth;
    const ch = window.innerHeight;

    const ratio = BASE_WIDTH / BASE_HEIGHT;
    const screenRatio = cw / ch;

    if (screenRatio > ratio) {
        drawHeight = ch;
        drawWidth = ch * ratio;
    } else {
        drawWidth = cw;
        drawHeight = ch;
    }

    canvas.width = drawWidth;
    canvas.height = drawHeight;

    canvas.style.position = 'fixed';
    canvas.style.left = ((cw - drawWidth) / 2) + 'px';
    canvas.style.top = ((ch - drawHeight) / 2) + 'px';

    if (!initialized) {
        initChips();
        initialized = true;
    }

    draw();
}

function drawChips() {
    const r = getRadiusPx();

    const offsetY = Math.max(3, drawWidth * 0.006);

    chips.forEach(chip => {
        const cx = chip.x * drawWidth;
        const cy = chip.y * drawHeight;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = chip.color;
        ctx.fill();

        ctx.lineWidth = BORDER;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        ctx.fillStyle = chip.textColor;
        ctx.font = `bold ${r * 1.28}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(chip.label, cx, cy + offsetY);
    });
}

function draw() {
    if (!img.complete) return;

    ctx.clearRect(0, 0, drawWidth, drawHeight);
    ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

    drawChips();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function getTouchPos(t) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top
    };
}

function pickChip(px, py) {
    const r = getRadiusPx();

    for (let chip of chips) {
        const cx = chip.x * drawWidth;
        const cy = chip.y * drawHeight;

        const dx = px - cx;
        const dy = py - cy;

        if (dx * dx + dy * dy <= r * r) {
            return chip;
        }
    }

    return null;
}

// mouse
canvas.addEventListener('mousedown', e => {
    const { x, y } = getMousePos(e);
    draggingChip = pickChip(x, y);
});

canvas.addEventListener('mousemove', e => {
    if (!draggingChip) return;

    const { x, y } = getMousePos(e);

    draggingChip.x = x / drawWidth;
    draggingChip.y = y / drawHeight;

    draw();
});

canvas.addEventListener('mouseup', () => draggingChip = null);
canvas.addEventListener('mouseleave', () => draggingChip = null);

// touch
canvas.addEventListener('touchstart', e => {
    const { x, y } = getTouchPos(e.touches[0]);
    draggingChip = pickChip(x, y);
});

canvas.addEventListener('touchmove', e => {
    if (!draggingChip) return;

    const { x, y } = getTouchPos(e.touches[0]);

    draggingChip.x = x / drawWidth;
    draggingChip.y = y / drawHeight;

    draw();
});

canvas.addEventListener('touchend', () => draggingChip = null);

// init
img.onload = resize;
window.addEventListener('resize', resize);