const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: 50,
    y: 50,
    size: 20,
    speed: 5
};

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function update() {
    if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;

    // Boundary Box
    if (player.x < 0) player.x = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y < 0) player.y = 0;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
}

function draw() {
    // clearRect (Clears the screen)
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // Draw player square
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function gameloop() {
    update();
    draw();
    requestAnimationFrame(gameloop);
}

gameloop();