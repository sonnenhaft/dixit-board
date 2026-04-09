window.CACHE_NAME = 'dixit-v1.8';

const STORAGE_KEY = window.CACHE_NAME;

const canvas = document.getElementById('dixit-board-canvas');
const ctx = canvas.getContext('2d');

const BASE_WIDTH = 784;
const BASE_HEIGHT = 1414;
const BASE_CHIP_SIZE = 60;
const BORDER = 4;
const MIN_RADIUS_PX = 10;


let drawWidth = 0;
let drawHeight = 0;
let draggingChip = null;
let initialized = false;

let needsRedraw = true;

const chips = [
    '#f4a7a8', '#a8dadc', '#bde0fe', '#cdb4db', '#ffc8dd',
    '#d8f3dc', '#ffd6a5', '#fdffb6', '#caffbf', '#b5ead7'
].map((color, i, total) => ({
    id: i,
    x: 0,
    y: 0,
    color,
    textColor: '#222',
    label: String(total.length - i)
}));

const getRadius = () =>
    Math.max(MIN_RADIUS_PX, drawWidth * (BASE_CHIP_SIZE / BASE_WIDTH) / 2);

const requestDraw = () => needsRedraw = true;

function renderLoop() {
    if (needsRedraw) {
        redrawCanvas();
        needsRedraw = false;
    }
    requestAnimationFrame(renderLoop);
}

function getXY(event) {
    const rect = canvas.getBoundingClientRect();
    event = event.touches ? event.touches[0] : event;
    return {x: event.clientX - rect.left, y: event.clientY - rect.top};
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chips));
}

function initChips() {
    try {
        const localStorageChips = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (localStorageChips) {
            chips.length = 0;
            chips.push(...localStorageChips);
            return;
        }
    } catch (e) {}


    const r = getRadius();
    const step = 2 * r;

    chips.forEach((chip, idx) => {
        const col = idx % 5;
        const row = Math.floor(idx / 5);

        chip.x = (r + col * step) / drawWidth;
        chip.y = (r + row * step) / drawHeight;
    });
}

function resizeCanvas() {
    const canvasWidth = window.innerWidth;
    const canvasHeight = canvas.parentElement.offsetHeight;

    const ratio = BASE_WIDTH / BASE_HEIGHT;

    if (canvasWidth / canvasHeight > ratio) {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * ratio;
    } else {
        drawWidth = canvasWidth;
        drawHeight = canvasHeight;
    }

    canvas.parentElement.parentElement.style.width = drawWidth + 'px';
    canvas.width = drawWidth;
    canvas.height = drawHeight;

    if (!initialized) {
        initChips();
        initialized = true;
    }

    requestDraw();
}

function redrawCanvas() {
    ctx.clearRect(0, 0, drawWidth, drawHeight);

    const r = getRadius();
    const offsetY = Math.max(3, drawWidth * 0.006);

    chips.forEach((chip) => {
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

function selectDraggingChip(e) {
    const {x, y} = getXY(e);
    const r = getRadius();

    const found = chips.find(c => {
        const dx = x - c.x * drawWidth;
        const dy = y - c.y * drawHeight;
        return dx * dx + dy * dy <= r * r;
    });

    if (!found) {
        draggingChip = null;
        return;
    }

    const index = chips.indexOf(found);
    chips.splice(index, 1);
    chips.push(found);

    draggingChip = found;
    requestDraw();
}

function moveDraggingChipAndRedrawEverything(e) {
    if (!draggingChip) {
        return;
    }

    const {x, y} = getXY(e);
    const r = getRadius();

    const clampedX = Math.min(Math.max(x, r), drawWidth - r);
    const clampedY = Math.min(Math.max(y, r), drawHeight - r);

    draggingChip.x = clampedX / drawWidth;
    draggingChip.y = clampedY / drawHeight;

    requestDraw();
}

function rememberDraggingChipPosition() {
    if (!draggingChip) {
        return;
    }
    save();
    draggingChip = null;
}

[
    [selectDraggingChip, ['mousedown', 'touchstart']],
    [moveDraggingChipAndRedrawEverything, ['mousemove', 'touchmove']],
    [rememberDraggingChipPosition, ['mouseup', 'mouseleave', 'touchend']]
].forEach(([handler, events]) => {
    events.forEach(event => {
        canvas.addEventListener(event, handler);
    });
});

const resizeCanvasAndRender = () => {
    resizeCanvas();
    renderLoop();
};

resizeCanvasAndRender();

window.resetCanvas = function () {
    localStorage.clear();
    chips.sort((a, b) => a.id - b.id);
    initChips();
    resizeCanvas();
    renderLoop();
};

window.addEventListener('resize', resizeCanvasAndRender);