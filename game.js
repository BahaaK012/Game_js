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
slenderImg.src = 'slender_new.png'; 

const playerImg = new Image();
playerImg.src = 'player_front.png'; // Still frame

const playerAnimImg = new Image();
playerAnimImg.src = 'player_side.png'; // Animated walk frame

const treeImg = new Image();
treeImg.src = 'tree1.png';

const tree2Img = new Image();
tree2Img.src = 'tree2.png';

const groundImg = new Image();
groundImg.src = 'map.png';

// Wall Image
const wallImg = new Image();
wallImg.src = 'wall.png'; 

//WORLD BORDER 
const borderImg = new Image();
borderImg.src = 'Pared del medio_0.png'; 

// 4x map size
const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 4000;
const BORDER_SIZE = 20; 

const obstacles = [
    // INDOOR1 (House)
    { img: wallImg, x: 1200, y: 300, w: 40, h: 640, isWall: true }, 
    { img: wallImg, x: 1960, y: 300, w: 40, h: 640, isWall: true }, 
    { img: wallImg, x: 1200, y: 300, w: 800, h: 40, isWall: true }, 
    { img: wallImg, x: 1200, y: 900, w: 340, h: 40, isWall: true }, 
    { img: wallImg, x: 1660, y: 900, w: 340, h: 40, isWall: true }, 
    { img: wallImg, x: 1240, y: 580, w: 260, h: 40, isWall: true }, 
    { img: wallImg, x: 1700, y: 580, w: 260, h: 40, isWall: true }, 
    { img: wallImg, x: 1500, y: 340, w: 40, h: 100, isWall: true }, 
    { img: wallImg, x: 1500, y: 540, w: 40, h: 80, isWall: true }, 
    { img: wallImg, x: 1500, y: 620, w: 40, h: 100, isWall: true }, 
    { img: wallImg, x: 1500, y: 820, w: 40, h: 80, isWall: true }, 
    { img: wallImg, x: 1660, y: 340, w: 40, h: 100, isWall: true },
    { img: wallImg, x: 1660, y: 540, w: 40, h: 80, isWall: true }, 
    { img: wallImg, x: 1660, y: 620, w: 40, h: 100, isWall: true },
    { img: wallImg, x: 1660, y: 820, w: 40, h: 80, isWall: true },

    // INDOOR 2 (Warehouse)
    { img: wallImg, x: 3500, y: 2000, w: 40, h: 800, isWall: true }, 
    { img: wallImg, x: 4260, y: 2000, w: 40, h: 800, isWall: true }, 
    { img: wallImg, x: 3500, y: 2000, w: 800, h: 40, isWall: true }, 
    { img: wallImg, x: 3500, y: 2760, w: 300, h: 40, isWall: true }, 
    { img: wallImg, x: 4000, y: 2760, w: 300, h: 40, isWall: true }, 
    { img: wallImg, x: 3540, y: 2400, w: 300, h: 40, isWall: true }, 

    // INDOOR 3 (Shed)
    { img: wallImg, x: 600, y: 3000, w: 40, h: 400, isWall: true }, 
    { img: wallImg, x: 1060, y: 3000, w: 40, h: 400, isWall: true }, 
    { img: wallImg, x: 600, y: 3000, w: 500, h: 40, isWall: true }, 
    { img: wallImg, x: 600, y: 3360, w: 150, h: 40, isWall: true }, 
    { img: wallImg, x: 910, y: 3360, w: 190, h: 40, isWall: true }, 

    // THE WOODS 
    { img: treeImg,  x: 300, y: 200, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 150, y: 400, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 600, y: 150, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 800, y: 500, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 200, y: 600, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 700, y: 50,  w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 450, y: 350, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 50,  y: 250, w: 390, h: 390, isWall: false },
    { img: tree2Img, x: 650, y: 400, w: 390, h: 390, isWall: false },
    { img: tree2Img, x: 350, y: 550, w: 390, h: 390, isWall: false },

    // MORE Trees
    { img: treeImg,  x: 2500, y: 300, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 3100, y: 150, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 2800, y: 600, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 3900, y: 500, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 4400, y: 250, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 4600, y: 800, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 2100, y: 1200, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 2500, y: 1500, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 3200, y: 1100, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 100, y: 1300, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 500, y: 1600, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 900, y: 1800, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 1800, y: 2200, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 2300, y: 2600, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 2900, y: 2100, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 150, y: 2500, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 1200, y: 2800, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 4500, y: 1500, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 4200, y: 1200, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 4000, y: 3200, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 4600, y: 3600, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 3100, y: 3500, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 2500, y: 3300, w: 320, h: 400, isWall: false },
    { img: tree2Img, x: 1900, y: 3700, w: 390, h: 390, isWall: false },
    { img: treeImg,  x: 1400, y: 3500, w: 320, h: 400, isWall: false },
    { img: treeImg,  x: 200, y: 3700, w: 320, h: 400, isWall: false }
];

let gameStarted = false;
let gameMode = "";
let endScreen = "";

// player Health and  ammo Systems
let playerHealth = 100;
let ammo = 6; 

// stamina
let stamina = 100;
let isSprinting = false; 
let isExhausted = false; // to adjust certain problems with stamina
const maxStamina = 100;
let shakeTime = 0;

// static page locations because when I showed it to my lecturer the pages decided not to appear
const pageLocations = [
    { x: 1300, y: 400 },  // Inside Building 1 (Top Left Room)
    { x: 3800, y: 2200 }, // Inside Building 2 (Warehouse)
    { x: 800, y: 3150 },  // Inside Building 3 (Shed)
    { x: 400, y: 800 },   // Woods Top-Left
    { x: 2800, y: 1000 }, // Woods Top-Mid
    { x: 4600, y: 500 },  // Woods Top-Right
    { x: 2000, y: 3500 }, // Woods Bottom-Mid
    { x: 1500, y: 1500 }  // Woods Center
];

let pagesFound = 0;
const page = {
    x: pageLocations[0].x, 
    y: pageLocations[0].y,
    size: 15,
    color: "white"
};

const player = {
    x: WORLD_WIDTH / 2, //starts in the middle
    y: WORLD_HEIGHT / 2,
    size: 60, // Increased to show off the 1080px detail otherwise they look ugly
    speed: 5,
    animTimer: 0,
    showAnimFrame: false,
    facingLeft: false // Track orientation for left-facing horizontal flips
};

const stalker = {
    x: WORLD_WIDTH / 2 + 500,
    y: WORLD_HEIGHT / 2 + 500,
    size: 80, 
    speed: 2.5,
    color: "red", 
    killTimer: 0,
    teleportTimer: 0,
    reactionBuffer: 0, 
    staticTimer: 0, 
    // New Action Mode variables
    actionTeleportTimer: 0, 
    stunTimer: 0,
    phases: {
        1: { teleportCooldown: 180, killDistance: 80 }, 
        2: { teleportCooldown: 120, killDistance: 110 },
        3: { teleportCooldown: 60,  killDistance: 150 } 
    }
};

const keys = {};

window.addEventListener('keydown', (e) => {
 keys[e.key.toLowerCase()] = true;
 if (!gameStarted && endScreen !==""){
    endScreen = "";
    return;
 }
    if (e.key.toLowerCase() === 'shift' && gameStarted && !isExhausted) {
        isSprinting = !isSprinting;
    }
    if (e.code === 'Space' && gameStarted && gameMode === "action") {
        shootBullet();
    }
    if (!gameStarted) {
        if (e.key.toLowerCase() === 'h') {
            gameMode = "horror";
            player.speed = 5;
            stalker.speed = 2.5;
            gameStarted = true;
        }
        if (e.key.toLowerCase() === 'a') {
            gameMode = "action";
            player.speed = 7;
            gameStarted = true;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function shootBullet() {
    if (ammo <= 0) return; // no ammo no shoot
    ammo--;
    
    shakeTime = 10; 
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

// Helper to spawn Stalker safely without getting trapped in a wall (i hope this wokrs)
function teleportStalkerSafely(isCloseToPlayer = false) {
    let validSpot = false; 
    let tx, ty;
    let attempts = 0;
    while (!validSpot && attempts < 100) { // in casw we wont found it doesewnt fall into infinite loop 
        if (isCloseToPlayer) {
            tx = player.x + (Math.random() - 0.5) * 800; // generate closer x around the player for strikes
            ty = player.y + (Math.random() - 0.5) * 800; 
        } else { // if the teleport is not near player 
            tx = Math.random() * (WORLD_WIDTH - 100) + 50; 
            ty = Math.random() * (WORLD_HEIGHT - 100) + 50;
        }
        // CHECK border size with map size
        tx = Math.max(BORDER_SIZE, Math.min(tx, WORLD_WIDTH - BORDER_SIZE - stalker.size));
        ty = Math.max(BORDER_SIZE, Math.min(ty, WORLD_HEIGHT - BORDER_SIZE - stalker.size));

        let hitWall = false; // to check walls since  I DONT WANT him to telport to walls
        for(let t of obstacles) {
            if(t.isWall) {
                if (tx < t.x + t.w && tx + stalker.size > t.x &&
                    ty < t.y + t.h && ty + stalker.size > t.y) {
                    hitWall = true;
                    break;
                }
            }
        }
        if (!hitWall) validSpot = true; // spot is vaild once there is no collsion 
        attempts++;
    }
    stalker.x = tx;
    stalker.y = ty;
}

function update() {
    if (!gameStarted) return;

    const isMoving = keys['w'] || keys['s'] || keys['a'] || keys['d'] || 
                     keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright'];

    if (isMoving) {
        player.animTimer++;
        if (player.animTimer > 12) { 
            player.showAnimFrame = !player.showAnimFrame;
            player.animTimer = 0;
        }
    } else {
        player.showAnimFrame = false; 
    }

    if (stamina <= 0) { 
        isExhausted = true; 
        stamina = 0; 
        isSprinting = false; 
    }
    if (stamina >= 20) { isExhausted = false; }

    let currentSpeed = player.speed;
    if(isSprinting && isMoving && !isExhausted) {
        currentSpeed = player.speed * 1.6;
        stamina -= 1;
    } else { 
        isSprinting = false; 
        if (stamina < maxStamina) stamina += 0.3;
    }

    let nextX = player.x;
    let nextY = player.y;

    if (keys['arrowup'] || keys['w']) nextY -= currentSpeed;
    if (keys['arrowdown'] || keys['s']) nextY += currentSpeed;
    if (keys['arrowleft'] || keys['a']) {
        nextX -= currentSpeed;
        player.facingLeft = true; // Flips image for left movement (this is the coolest thing I found and it helops not to waste yourr time drawing)
    }
    if (keys['arrowright'] || keys['d']) {
        nextX += currentSpeed;
        player.facingLeft = false; // Uses native right orientation
    }

    // collisions with walls only for player
    let canMoveX = true;
    let canMoveY = true;

    obstacles.forEach(t => {
        if (t.isWall) {
            if (nextX < t.x + t.w && nextX + player.size > t.x &&
                player.y < t.y + t.h && player.y + player.size > t.y) {
                canMoveX = false;
            }

            if (player.x < t.x + t.w && player.x + player.size > t.x &&
                nextY < t.y + t.h && nextY + player.size > t.y) {
                canMoveY = false;
            }
        }
    });

    if (canMoveX && nextX >= BORDER_SIZE && nextX + player.size <= WORLD_WIDTH - BORDER_SIZE) {
        player.x = nextX;
    }
    if (canMoveY && nextY >= BORDER_SIZE && nextY + player.size <= WORLD_HEIGHT - BORDER_SIZE) {
        player.y = nextY;
    }
   
    // stalker
    if (pagesFound > 0) {
        if (gameMode === "horror") {
            let currentPhase = 1;
            if (pagesFound >= 6) currentPhase = 3;
            else if (pagesFound >= 3) currentPhase = 2;
            let stats = stalker.phases[currentPhase];
            let dx = (stalker.x + stalker.size / 2) - (player.x + player.size / 2); 
            let dy = (stalker.y + stalker.size / 2) - (player.y + player.size / 2); 
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            let angleToStalker = Math.atan2(dy, dx);
            let mouseAngle = Math.atan2(mouse.y - canvas.height/2, mouse.x - canvas.width/2);
            let angleDiff = Math.abs(angleToStalker - mouseAngle);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            let isBeingWatched = (distance < 500 && angleDiff < 0.5); 

            if (!isBeingWatched) {
                stalker.reactionBuffer = 0; 
                stalker.teleportTimer++; 
                if (stalker.teleportTimer > stats.teleportCooldown){
                    teleportStalkerSafely(true); 
                    stalker.teleportTimer = 0;
                    stalker.staticTimer = 15; 
                }
            } else {
                stalker.reactionBuffer++;
                if (stalker.reactionBuffer > 5) { 
                    stalker.teleportTimer = 0; 
                }
            }
             
            if (distance < stats.killDistance){
                stalker.killTimer++; 
                shakeTime = 10;
                if (stalker.killTimer > 120) { 
                    endScreen = "gameover";
                    for (let key in keys) { keys[key] = false; }
                    player.x = WORLD_WIDTH / 2; player.y = WORLD_HEIGHT / 2;
                    teleportStalkerSafely(false);
                    pagesFound = 0; stamina = 100;
                    isSprinting = false; shakeTime = 0;
                    stalker.killTimer = 0; stalker.teleportTimer = 0; stalker.staticTimer = 0;
                    gameStarted = false;
                    return; 
                }
            } else {
                stalker.killTimer = Math.max(0, stalker.killTimer - 1); 
            }

            if (distance < 150) shakeTime = 5; 
        } else {
            // new mechanic for action mode teleport 
            if (stalker.stunTimer > 0) {
                stalker.stunTimer--; // recovering from a gunshot
            } else {
                stalker.actionTeleportTimer++;
                
                // more pages more diffcualt
                let tpCooldown = Math.max(60, 300 - (pagesFound * 30)); // drops from 5s down to 1s
                let tpDamage = 15 + (pagesFound * 5); // form 15 to 50
                
                // Attack Time
                if (stalker.actionTeleportTimer >= tpCooldown) {
                    playerHealth -= tpDamage;
                    shakeTime = 30; // heavy damage shake
                    stalker.staticTimer = 40; // intense static to completely jide the teleport
                    
                    teleportStalkerSafely(true); 
                    stalker.actionTeleportTimer = 0;
                    
                    // death check for player
                    if (playerHealth <= 0) {
                        endScreen = "gameover";
                        for (let key in keys) { keys[key] = false; }
                        player.x = WORLD_WIDTH / 2; player.y = WORLD_HEIGHT / 2;
                        teleportStalkerSafely(false);
                        pagesFound = 0; stamina = 100;
                        playerHealth = 100; ammo = 6;
                        isSprinting = false; shakeTime = 0;
                        stalker.killTimer = 0; stalker.teleportTimer = 0; stalker.staticTimer = 0;
                        stalker.actionTeleportTimer = 0; stalker.stunTimer = 0;
                        gameStarted = false;
                        return;
                    }
                }
            }
        }
    }

    // loop through bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].vx;
        bullets[i].y += bullets[i].vy;

        let bulletHitObstacle = false;
        obstacles.forEach(t => {
            if (t.isWall) {
                if (bullets[i].x < t.x + t.w && bullets[i].x + bullets[i].size > t.x &&
                    bullets[i].y < t.y + t.h && bullets[i].y + bullets[i].size > t.y) {
                    bulletHitObstacle = true;
                }
            }
        });
        if (bulletHitObstacle) { bullets.splice(i, 1); continue; }  
        
        if (bullets[i].x < BORDER_SIZE || bullets[i].x > WORLD_WIDTH - BORDER_SIZE ||
            bullets[i].y < BORDER_SIZE || bullets[i].y > WORLD_HEIGHT - BORDER_SIZE) { 
            bullets.splice(i, 1); 
            continue; 
        }
        
        if (pagesFound > 0) {
            if ( 
                bullets[i].x < stalker.x + stalker.size &&
                bullets[i].x + bullets[i].size > stalker.x &&
                bullets[i].y < stalker.y + stalker.size &&
                bullets[i].y + bullets[i].size > stalker.y
            ) {
                stalker.staticTimer = 10; 
                bullets.splice(i, 1);
                
                // bullet inflictss 20 second cooldown in action mode
                if (gameMode === "action") {
                    stalker.stunTimer = 1200; // 60 FPS * 20 sec = 1200 frames whichs is the 20 seconds i need 
                    stalker.actionTeleportTimer = 0; 
                    // if he got hit teleport to the deepset part of the boonies because the idiot would just be in the map
                    stalker.x = -10000;
                    stalker.y = -10000;
                } else {
                    // in horror mode just do the normal safe teleport
                    teleportStalkerSafely(false);
                }
            }
        }
    }

    if ( 
        player.x < page.x + page.size &&
        player.x + player.size > page.x &&
        player.y < page.y + page.size &&
        player.y + player.size > page.y
    ) {
        pagesFound++; 
        if (pagesFound === 1) {
            let distance = 0;
            while (distance < 600) { 
                teleportStalkerSafely(false);
                let dx = player.x - stalker.x;
                let dy = player.y - stalker.y;
                distance = Math.sqrt(dx * dx + dy * dy);
            }
        }
        
        // spawn the next page based on our safe static array
        if (pagesFound < 8) {
            page.x = pageLocations[pagesFound].x;
            page.y = pageLocations[pagesFound].y; 
            stalker.speed += 0.2;     
            
            // reheal and resupply on page collect
            if (gameMode === "action") {
                playerHealth = 100;
                ammo += 3;
            }
        }
    }

    if (shakeTime > 0) shakeTime--;
    if (stalker.staticTimer > 0) stalker.staticTimer--;

    if (pagesFound >= 8) {
        endScreen = "win";
        pagesFound = 0; 
        gameStarted = false;
        player.x = WORLD_WIDTH / 2; player.y = WORLD_HEIGHT / 2;
        teleportStalkerSafely(false);
        playerHealth = 100; ammo = 6;
        isSprinting = false; shakeTime = 0;
        stalker.killTimer = 0; stalker.teleportTimer = 0; stalker.staticTimer = 0;
        stalker.actionTeleportTimer = 0; stalker.stunTimer = 0;
    }
}

function draw() {
    ctx.save();
    
    ctx.imageSmoothingEnabled = false;
    
    // Constant minor trembling if injured in Action Mode
    if (gameStarted && gameMode === "action" && playerHealth < 100) {
        let hurtTremble = (100 - playerHealth) / 20;
        ctx.translate((Math.random() - 0.5) * hurtTremble, (Math.random() - 0.5) * hurtTremble);
    }

    if (shakeTime > 0) {
        let shakeX = (Math.random() - 0.5) * 15; // Increased base shake
        let shakeY = (Math.random() - 0.5) * 15;
        ctx.translate(shakeX, shakeY);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let zoom = 1.5;
    let camX = player.x + player.size / 2 - (canvas.width / 2) / zoom;
    let camY = player.y + player.size / 2 - (canvas.height / 2) / zoom;
    
    ctx.save();
    ctx.scale(zoom, zoom); 
    ctx.translate(-camX, -camY); 

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
        // Draw Walls FIRST
        obstacles.forEach(t => {
            if (t.isWall) {
                ctx.fillStyle = "#3d2314"; 
                ctx.fillRect(t.x, t.y, t.w, t.h);

                if (t.img.complete && t.img.width > 0) {
                    ctx.save();
                    const pattern = ctx.createPattern(t.img, 'repeat');
                    ctx.fillStyle = pattern;
                    ctx.translate(t.x, t.y);
                    ctx.fillRect(0, 0, t.w, t.h);
                    ctx.restore();
                }
            }
        });

        // Draw Stalker
        if (pagesFound > 0 && slenderImg.complete && slenderImg.width > 0) {
            ctx.drawImage(slenderImg, stalker.x, stalker.y, stalker.size, stalker.size);
        }

        // Draw Player with Left/Right directional flip
        const currentPlayerImg = player.showAnimFrame ? playerAnimImg : playerImg;
        if (currentPlayerImg.complete && currentPlayerImg.width > 0) {
            ctx.save();
            if (player.facingLeft) {
                ctx.translate(player.x + player.size, player.y);
                ctx.scale(-1, 1);
                ctx.drawImage(currentPlayerImg, 0, 0, player.size, player.size);
            } else {
                ctx.drawImage(currentPlayerImg, player.x, player.y, player.size, player.size);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = (gameMode === "action") ? "cyan" : "white";
            ctx.fillRect(player.x, player.y, player.size, player.size);
        }

        // bullet and pages 
        if (pagesFound < 8) { // Only draw pages if there are pages left to find
            ctx.fillStyle = page.color; 
            ctx.fillRect(page.x, page.y, page.size, page.size);
        }
        ctx.fillStyle = 'yellow';
        bullets.forEach(bullet => { ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size); });

        // Draw Trees LAST 
        obstacles.forEach(t => {
            if (!t.isWall && t.img.complete && t.img.width > 0) {
                ctx.drawImage(t.img, t.x, t.y, t.w, t.h);
            }
        });
    }

    if (borderImg.complete) {
        const pattern = ctx.createPattern(borderImg, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, WORLD_WIDTH, BORDER_SIZE); 
        ctx.fillRect(0, WORLD_HEIGHT - BORDER_SIZE, WORLD_WIDTH, BORDER_SIZE); 
        ctx.fillRect(0, 0, BORDER_SIZE, WORLD_HEIGHT); 
        ctx.fillRect(WORLD_WIDTH - BORDER_SIZE, 0, BORDER_SIZE, WORLD_HEIGHT); 
    }
    
    ctx.restore();

    if (gameStarted && gameMode === "horror") {
        const darkCanvas = document.createElement("canvas");
        darkCanvas.width = canvas.width;
        darkCanvas.height = canvas.height;
        const darkCtx = darkCanvas.getContext("2d");
        darkCtx.fillStyle = "rgb(0, 0, 10)";
        darkCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);
        darkCtx.globalCompositeOperation = "destination-out";

        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;
        const angle = Math.atan2(mouse.y - screenCenterY, mouse.x - screenCenterX);

        const glowGradient = darkCtx.createRadialGradient(screenCenterX, screenCenterY, 30 * zoom, screenCenterX, screenCenterY, 70 * zoom);
        glowGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        darkCtx.fillStyle = glowGradient;
        darkCtx.beginPath();
        darkCtx.arc(screenCenterX, screenCenterY, 70 * zoom, 0, Math.PI * 2);
        darkCtx.fill();

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

    if (gameStarted && stalker.staticTimer > 0) {
        // Boosted to 8000 iterations to make the static effect intensely blinding during action teleports
        for (let i = 0; i < 8000; i++) { 
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let gray = Math.random() * 255;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.6)`; // Increased opacity
            ctx.fillRect(x, y, 3, 3); // Slightly larger pixels for bolder static
        }
    }

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
        // UI Handling depending on Mode
        if (gameMode === "action") {
            // Screen bleeding red based on health lost
            if (playerHealth < 100) {
                ctx.fillStyle = `rgba(255, 0, 0, ${(100 - playerHealth) / 150})`; 
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.fillStyle = "white";
            ctx.font = "15px Arial";
            ctx.textAlign = "left";
            ctx.fillText("Mode: " + gameMode.toUpperCase(), 20, 30);
            ctx.fillText("Pages: " + pagesFound + "/8", 20, 50);
            ctx.fillText("Health: " + Math.max(0, Math.floor(playerHealth)) + "%", 20, 70);
            ctx.fillText("Ammo: " + ammo, 20, 90);
            
            ctx.fillStyle = "gray";
            ctx.fillRect(20, 110, 100, 10); 
            ctx.fillStyle = isExhausted ? "red" : isSprinting ? "cyan" : "lime";
            ctx.fillRect(20, 110, stamina, 10);
            ctx.strokeStyle = "white";
            ctx.strokeRect(20, 110, 100, 10);

            if (stalker.stunTimer > 0) {
                ctx.fillStyle = "lime";
                ctx.fillText("Slender Cooldown: " + Math.ceil(stalker.stunTimer / 60) + "s", 20, 140);
            }

        } else {
            // Original Horror HUD
            if (stalker.killTimer > 0) {
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
    }
    ctx.restore();
}

// main 
function gameloop() {
    update(); draw(); requestAnimationFrame(gameloop);
}

gameloop();