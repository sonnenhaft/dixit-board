const rulesBlock = document.querySelector('.rules-block');
const rulesBtn = document.querySelector('.rules-btn');
const resetBtn = document.querySelector('.reset-btn');
const backBtn = document.querySelector('.back-btn');

function showRules() {
    rulesBtn.style.display = 'none';
    resetBtn.style.display = 'none';
    backBtn.style.display = 'flex';
    rulesBlock.style.display = 'block';
}

function hideRules() {
    rulesBtn.style.display = 'flex';
    resetBtn.style.display = 'flex';
    backBtn.style.display = 'none';
    rulesBlock.style.display = 'none';
}

function resetRules() {
    if (!confirm('Are you sure you want to reset the game?') || !confirm('Are you really sure?')) {
        return;
    }

    window.resetCanvas();
}

rulesBtn.addEventListener('pointerdown', showRules, {passive: true});
backBtn.addEventListener('pointerdown', hideRules, {passive: true});
resetBtn.addEventListener('pointerdown', resetRules, {passive: true});
