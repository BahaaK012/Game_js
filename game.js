const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bullets = [];
const bulletSpeed = 10;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouse = { x:0, y: 0}; // pointer for the mouse 
window.addEventListener('mousemove', (e)=> {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // shooting lisnter for action mode 
  window.addEventListener('mousedown', (e) => {
    if (gameStarted && gameMode === "action") {
        shootBullet();
    }
});

const slenderImg = new Image();
slenderImg.src = 'slender_new.png'; // 

const playerImg = new Image();
playerImg.src = 'New Piskel (7).png'; // Still frame

const playerAnimImg = new Image();
playerAnimImg.src = 'New Piskel (16).png'; // Animated walk frame

const treeImg = new Image();
treeImg.src = 'dead_tree-001.png';

const tree2Img = new Image();
tree2Img.src = 'tree_10 (1).png';

const groundImg = new Image();
groundImg.src = 'map.png';

//WORLD BORDER 
const borderImg = new Image();
borderImg.src = 'Pared del medio_0.png'; 

const WORLD_WIDTH = 2500;
const WORLD_HEIGHT = 2000;
const BORDER_SIZE = 20; 


const obstacles = [
    { img: treeImg, x: 300, y: 200, w: 60, h: 120 },
    { img: treeImg, x: 150, y: 400, w: 60, h: 120 },
    { img: treeImg, x: 600, y: 150, w: 60, h: 120 },
    { img: treeImg, x: 800, y: 500, w: 60, h: 120 },
    { img: treeImg, x: 200, y: 600, w: 60, h: 120 },
    { img: treeImg, x: 700, y: 50, w: 60, h: 120 },
    { img: treeImg, x: 450, y: 350, w: 60, h: 120 },
    { img: tree2Img, x: 50, y: 250, w: 60, h: 120 },
    { img: tree2Img, x: 650, y: 400, w: 60, h: 120 },
    { img: tree2Img, x: 350, y: 550, w: 60, h: 120 }
];

let gameStarted = false;
let gameMode = "";
let endScreen = "";

// stamina
let stamina = 100;
let isSprinting = false; 
let isExhausted = false; // to adjust certain problems with stamina
const maxStamina = 100;

// shaking effect 
let shakeTime = 0;

// pages
let pagesFound = 0;
const page = {
    x: Math.random() * (WORLD_WIDTH - 100) + 50, // Spawn inside borders
    y: Math.random() * (WORLD_HEIGHT - 100) + 50,
    size: 15,
    color: "white"
};

const player = {
    x: WORLD_WIDTH / 2, // Start in middle of big map
    y: WORLD_HEIGHT / 2,
    size: 60, // Increased to show off the 1080px detail
    speed: 5,
    animTimer: 0,
    showAnimFrame: false
};

const stalker = {
    x: 500,
    y: 500,
    size: 80, // NEW: Increased size to 80 to match high-res sprite detail
    speed: 2,
    color: "red", 
    killTimer: 0,
    teleportTimer: 0,
    reactionBuffer: 0, 
    staticTimer: 0, //Timer for the teleport status effect 
    phases: {
        1: { teleportCooldown: 180, killDistance: 80 },  // Pages 1-2
        2: { teleportCooldown: 120, killDistance: 110 }, // Pages 3-5
        3: { teleportCooldown: 60,  killDistance: 150 }  // Pages 6-7
    }
};
// keys
const keys = {};

window.addEventListener('keydown', (e) => {
// force fix for the lowercase situation I had 
 keys[e.key.toLowerCase()] = true;

 // check if end screen is showing 
 if (!gameStarted && endScreen !==""){
    endScreen = "";
    return;
 }

    // shift to sprint
    if (e.key.toLowerCase() === 'shift' && gameStarted && !isExhausted) {
        isSprinting = !isSprinting;
    }
    // shooting for action mode
    if (e.code === 'Space' && gameStarted && gameMode === "action") {
        shootBullet();
    }
      // to adjust which mode player will select 
    if (!gameStarted) {
        if (e.key.toLowerCase() === 'h') {
            gameMode = "horror";
            player.speed = 4;
            stalker.speed = 2.2;
            gameStarted = true;
        }
        if (e.key.toLowerCase() === 'a') {
            gameMode = "action";
            player.speed = 7;
            stalker.speed = 1.2;
            gameStarted = true;
        }
    }
});

window.addEventListener('keyup', (e) => {
 // same issue of keys getting stuck while sprinting
    keys[e.key.toLowerCase()] = false;
});

// helper fucntion for bullets shooting aim 
function shootBullet() {
    shakeTime = 10; 
    
    // We need to calculate the angle from the center of the screen (where the player is)
    // to the mouse position.
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const angle = Math.atan2(mouse.y - centerY, mouse.x - centerX);

    bullets.push({
        x: player.x + player.size / 2, 
        y: player.y + player.size / 2,
        vx: Math.cos(angle) * bulletSpeed,
        vy: Math.sin(angle) * bulletSpeed,
        size: 5
    }); 
}

function update() {
    if (!gameStarted) return;

    // check player movment
    const isMoving = keys['w'] || keys['s'] || keys['a'] || keys['d'] || 
                     keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright'];

    // Player Animation Logic
    if (isMoving) {
        player.animTimer++;
        if (player.animTimer > 12) { // this number is for walking speed (how it appears)
            player.showAnimFrame = !player.showAnimFrame;
            player.animTimer = 0;
        }
    } else {
        player.showAnimFrame = false; // stay still when not moving
    }

    if (stamina <= 0) { 
        isExhausted = true; 
        stamina = 0; 
        isSprinting = false; // to again fix the stuck issue
    }
    
    if (stamina >= 20) { isExhausted = false; }
// normal speed
    let currentSpeed = player.speed;
    // sprint speed
    if(isSprinting && isMoving && !isExhausted) {
        currentSpeed = player.speed * 1.6;
        stamina -= 1;
    } else { // recovery 
        isSprinting = false; 
        if (stamina < maxStamina) stamina += 0.3;
    }

    // predict player postion
    let nextX = player.x;
    let nextY = player.y;

   
    if (keys['arrowup'] || keys['w']) nextY -= currentSpeed;
    if (keys['arrowdown'] || keys['s']) nextY += currentSpeed;
    if (keys['arrowleft'] || keys['a']) nextX -= currentSpeed;
    if (keys['arrowright'] || keys['d']) nextX += currentSpeed;

    // collisions with objects
    let canMoveX = true;
    let canMoveY = true;

    obstacles.forEach(t => {
        if (nextX < t.x + t.w && nextX + player.size > t.x &&
            player.y < t.y + t.h && player.y + player.size > t.y) {
            canMoveX = false;
        }

        if (player.x < t.x + t.w && player.x + player.size > t.x &&
            nextY < t.y + t.h && nextY + player.size > t.y) {
            canMoveY = false;
        }
    });

    // collision with world border now (I hate collisoion)
    if (canMoveX && nextX >= BORDER_SIZE && nextX + player.size <= WORLD_WIDTH - BORDER_SIZE) {
        player.x = nextX;
    }
    if (canMoveY && nextY >= BORDER_SIZE && nextY + player.size <= WORLD_HEIGHT - BORDER_SIZE) {
        player.y = nextY;
    }
   
    // stalker
    if (pagesFound > 0) {
        if (gameMode === "horror") {
            // modlur way for the pages and selnder
            let currentPhase = 1;
            if (pagesFound >= 6) currentPhase = 3;
            else if (pagesFound >= 3) currentPhase = 2;
            // calculate from center so the math dont get messed up 
            let stats = stalker.phases[currentPhase];
            let pCenterX = player.x + player.size / 2;
            let pCenterY = player.y + player.size / 2;
            let sCenterX = stalker.x + stalker.size / 2;
            let sCenterY = stalker.y + stalker.size / 2;
            // to point form the player to slender
            let dx = sCenterX - pCenterX; 
            let dy = sCenterY - pCenterY; 
            let distance = Math.sqrt(dx * dx + dy * dy);
            // to check if slender is under the light 
            let angleToStalker = Math.atan2(dy, dx);
            let mouseAngle = Math.atan2(mouse.y - canvas.height/2, mouse.x - canvas.width/2);
            let angleDiff = Math.abs(angleToStalker - mouseAngle);
            // normalize
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            // if he is on light
            let isBeingWatched = (distance < 500 && angleDiff < 0.5); 

            if (!isBeingWatched) {
                stalker.reactionBuffer = 0; 
                stalker.teleportTimer++; 
                if (stalker.teleportTimer > stats.teleportCooldown){
                    // Teleport inside borders (this is not really working)
                    let tx = player.x + (Math.random() - 0.5) * 800; // pick the spot closer to the player (also not always working)
                    let ty = player.y + (Math.random() - 0.5) * 800;
                    stalker.x = Math.max(BORDER_SIZE, Math.min(tx, WORLD_WIDTH - BORDER_SIZE));
                    stalker.y = Math.max(BORDER_SIZE, Math.min(ty, WORLD_HEIGHT - BORDER_SIZE));
                    stalker.teleportTimer = 0;
                    stalker.staticTimer = 15; // Trigger static on teleport
                }
            } else {
                stalker.reactionBuffer++;
                if (stalker.reactionBuffer > 5) { 
                    stalker.teleportTimer = 0; // when watched his timer be reseted
                }
            }
             // kill mechanic 
            if (distance < stats.killDistance){
                stalker.killTimer++; 
                shakeTime = 10;
                if (stalker.killTimer > 120) { 
                    endScreen = "gameover";
                    for (let key in keys) { keys[key] = false; }
                    player.x = WORLD_WIDTH / 2; player.y = WORLD_HEIGHT / 2;
                    stalker.x = 500; stalker.y = 500;
                    pagesFound = 0; stamina = 100;
                    isSprinting = false;
                    shakeTime = 0;
                    stalker.killTimer = 0; 
                    stalker.teleportTimer = 0; 
                    stalker.staticTimer = 0;
                    gameStarted = false;
                    return; 
                }
            } else {
                stalker.killTimer = Math.max(0, stalker.killTimer - 1); 
            }

            if (distance < 150) shakeTime = 5; // shake logic
        } else {
            // this the action mode logic (I havent changed it yet )
            if (stalker.x < player.x) stalker.x += stalker.speed;
            if (stalker.x > player.x) stalker.x -= stalker.speed;
            if (stalker.y < player.y) stalker.y += stalker.speed;
            if (stalker.y > player.y) stalker.y -= stalker.speed;

            if ( 
                player.x < stalker.x + stalker.size &&
                player.x + player.size > stalker.x &&
                player.y < stalker.y + stalker.size &&
                player.y + player.size > stalker.y
            ) { 
                endScreen = "gameover";
                for (let key in keys) { keys[key] = false; }
                player.x = WORLD_WIDTH / 2; player.y = WORLD_HEIGHT / 2;
                stalker.x = 500; stalker.y = 500;
                pagesFound = 0; stamina = 100;
                isSprinting = false;
                shakeTime = 0;
                stalker.killTimer = 0; 
                stalker.teleportTimer = 0; 
                stalker.staticTimer = 0;
                gameStarted = false;
                return;
            }
        }
    }

    // loop through bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].vx;
        bullets[i].y += bullets[i].vy;

        let bulletHitObstacle = false;
        obstacles.forEach(t => {
            if (bullets[i].x < t.x + t.w && bullets[i].x + bullets[i].size > t.x &&
                bullets[i].y < t.y + t.h && bullets[i].y + bullets[i].size > t.y) {
                bulletHitObstacle = true;
            }
        });
        if (bulletHitObstacle) { bullets.splice(i, 1); continue; }  // continue was important if bullet is gone contine to next one
        // Bullet hits world border
        if (bullets[i].x < BORDER_SIZE || bullets[i].x > WORLD_WIDTH - BORDER_SIZE ||
            bullets[i].y < BORDER_SIZE || bullets[i].y > WORLD_HEIGHT - BORDER_SIZE) { 
            bullets.splice(i, 1); 
            continue; 
        }
        
        if (pagesFound > 0) {
            if ( // if the bullet will hit
                bullets[i].x < stalker.x + stalker.size &&
                bullets[i].x + bullets[i].size > stalker.x &&
                bullets[i].y < stalker.y + stalker.size &&
                bullets[i].y + bullets[i].size > stalker.y
            ) {
                stalker.x = Math.random() * (WORLD_WIDTH - 100) + 50; // gets teleported
                stalker.y = Math.random() * (WORLD_HEIGHT - 100) + 50;
                stalker.staticTimer = 10; // Smaller static on bullet hit
                bullets.splice(i, 1);
            }
        }
    }

    if ( // again collision(I DID IT SO MANY TIMES) 
        player.x < page.x + page.size &&
        player.x + player.size > page.x &&
        player.y < page.y + page.size &&
        player.y + player.size > page.y
    ) {
        pagesFound++; 
        if (pagesFound === 1) {
            let distance = 0;
            while (distance < 400) {
                stalker.x = Math.random() * (WORLD_WIDTH - 100) + 50;
                stalker.y = Math.random() * (WORLD_HEIGHT - 100) + 50;
                let dx = player.x - stalker.x;
                let dy = player.y - stalker.y;
                distance = Math.sqrt(dx * dx + dy * dy);
            }
        }
        page.x = Math.random() * (WORLD_WIDTH - 100) + 50;
        page.y = Math.random() * (WORLD_HEIGHT - 100) + 50; 
        stalker.speed += 0.2;     
    }

    if (shakeTime > 0) shakeTime--;
    if (stalker.staticTimer > 0) stalker.staticTimer--;

    // win reset logic 
    if (pagesFound >= 8) {
        endScreen = "win";
        pagesFound = 0; 
        gameStarted = false;
        player.x = WORLD_WIDTH / 2; player.y = WORLD_HEIGHT / 2;
        stalker.x = 500; stalker.y = 500;
        isSprinting = false; shakeTime = 0;
        stalker.killTimer = 0; stalker.teleportTimer = 0; stalker.staticTimer = 0;
    }
}

function draw() {
    ctx.save();
    
    // Pixel Perfect Fix (because they appeard blurry (they kinda still do))
    ctx.imageSmoothingEnabled = false;
    // scrnee shake 
    if (shakeTime > 0) {
        let shakeX = (Math.random() - 0.5) * 10;
        let shakeY = (Math.random() - 0.5) * 10;
        ctx.translate(shakeX, shakeY);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
     // player camara zoom and follow player now 
    let zoom = 1.5;
    let camX = player.x + player.size / 2 - (canvas.width / 2) / zoom;
    let camY = player.y + player.size / 2 - (canvas.height / 2) / zoom;
    
    ctx.save();
    ctx.scale(zoom, zoom); // apply zoom
    ctx.translate(-camX, -camY); // shit the world 


   // check for the background pattern
    try {
        if (groundImg.complete && groundImg.width > 0) {
            const pattern = ctx.createPattern(groundImg, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        }
    } catch (e) {
        ctx.fillStyle = "#002200";
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }

    if (gameStarted) {
        obstacles.forEach(t => {
            if (t.img.complete && t.img.width > 0) {
                ctx.drawImage(t.img, t.x, t.y, t.w, t.h);
            }
        });

        // Draw Stalker
        if (pagesFound > 0 && slenderImg.complete && slenderImg.width > 0) {
            ctx.drawImage(slenderImg, stalker.x, stalker.y, stalker.size, stalker.size);
        }

        // Draw Player with new animation logic 
        const currentPlayerImg = player.showAnimFrame ? playerAnimImg : playerImg;
        if (currentPlayerImg.complete && currentPlayerImg.width > 0) {
            ctx.drawImage(currentPlayerImg, player.x, player.y, player.size, player.size);
        } else {
            ctx.fillStyle = (gameMode === "action") ? "cyan" : "white";
            ctx.fillRect(player.x, player.y, player.size, player.size);
        }
        // bullet and pages 
        ctx.fillStyle = 'yellow';
        bullets.forEach(bullet => { ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size); });
        ctx.fillStyle = page.color; 
        ctx.fillRect(page.x, page.y, page.size, page.size);
    }

    // Draw world border
    if (borderImg.complete) {
        const pattern = ctx.createPattern(borderImg, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, WORLD_WIDTH, BORDER_SIZE); // Top
        ctx.fillRect(0, WORLD_HEIGHT - BORDER_SIZE, WORLD_WIDTH, BORDER_SIZE); // Bottom
        ctx.fillRect(0, 0, BORDER_SIZE, WORLD_HEIGHT); // Left
        ctx.fillRect(WORLD_WIDTH - BORDER_SIZE, 0, BORDER_SIZE, WORLD_HEIGHT); // Right
    }
    

    ctx.restore();
    // darkness overlay and flashlight (horror mode only)
    if (gameStarted && gameMode === "horror") {
        const darkCanvas = document.createElement("canvas");
        darkCanvas.width = canvas.width;
        darkCanvas.height = canvas.height;
        const darkCtx = darkCanvas.getContext("2d");
        darkCtx.fillStyle = "rgb(0, 0, 10)";
        darkCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);
        darkCtx.globalCompositeOperation = "destination-out";

 // Screen-space coordinates for the flashlight

        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;
        const angle = Math.atan2(mouse.y - screenCenterY, mouse.x - screenCenterX);
      // Body Glow

        const glowGradient = darkCtx.createRadialGradient(screenCenterX, screenCenterY, 30 * zoom, screenCenterX, screenCenterY, 70 * zoom);
        glowGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        darkCtx.fillStyle = glowGradient;
        darkCtx.beginPath();
        darkCtx.arc(screenCenterX, screenCenterY, 70 * zoom, 0, Math.PI * 2);
        darkCtx.fill();
          // Flashlight Cone
        const beamGradient = darkCtx.createRadialGradient(screenCenterX, screenCenterY, 0, screenCenterX, screenCenterY, 450 * zoom);
        beamGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        beamGradient.addColorStop(0.7, "rgba(0, 0, 0, 0.8)");
        beamGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        darkCtx.fillStyle = beamGradient;
        darkCtx.beginPath();
        darkCtx.moveTo(screenCenterX, screenCenterY);
        darkCtx.arc(screenCenterX, screenCenterY, 450 * zoom, angle - 0.4, angle + 0.4);
        darkCtx.lineTo(screenCenterX, screenCenterY);
        darkCtx.fill();

        ctx.drawImage(darkCanvas, 0, 0);
    }

    // static effect 
    if (gameStarted && stalker.staticTimer > 0) {
        // Draw random noisy pixels
        for (let i = 0; i < 5000; i++) { 
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let gray = Math.random() * 255;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.4)`;
            ctx.fillRect(x, y, 2, 2);
        }
    }

  // UI and Menu

    if (!gameStarted) {
        if (endScreen === "gameover") {
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.font = "60px Arial";
            ctx.fillText("SLENDER MAN CAUGHT YOU!!", canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Press any key to return to menu", canvas.width / 2, canvas.height / 2 + 30);
        } else if (endScreen === "win") {
            ctx.fillStyle = "lime";
            ctx.textAlign = "center";
            ctx.font = "60px Arial";
            ctx.fillText("YOU WON!", canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Press any key to return to menu", canvas.width / 2, canvas.height / 2 + 30);
        } else {
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "60px Arial";
            ctx.fillText("Slender Man Game", canvas.width / 2, canvas.height / 2 - 100);
            ctx.font = "20px Arial";
            ctx.fillText("by Bahaa", canvas.width / 2, canvas.height / 2 - 60);
            ctx.font = "30px Arial";
            ctx.fillText("Press 'H' for Horror Mode", canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText("Press 'A' for Action Mode", canvas.width / 2, canvas.height / 2 + 70);
        }
    } else {
        // the in game Ui 
        if (gameMode === "horror" && stalker.killTimer > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${stalker.killTimer / 240})`; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.fillStyle = "white";
        ctx.font = "15px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Mode: " + gameMode.toUpperCase(), 20, 30);
        ctx.fillText("Pages: " + pagesFound + "/8", 20, 50); 
        ctx.fillStyle = "gray";
        ctx.fillRect(20, 70, 100, 10); 
        ctx.fillStyle = isExhausted ? "red" : isSprinting ? "cyan" : "lime";
        ctx.fillRect(20, 70, stamina, 10);
        ctx.strokeStyle = "white";
        ctx.strokeRect(20, 70, 100, 10);
    }
    ctx.restore();
}
// main loop 
function gameloop() {
    update(); draw(); requestAnimationFrame(gameloop);
}

gameloop();