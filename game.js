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
playerImg.src = 'New Piskel (7).png'; // Still frame

const playerAnimImg = new Image();
playerAnimImg.src = 'New Piskel (16).png'; // Animated walk frame

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
    showAnimFrame: false
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
            stalker.speed = 2.2; // Slightly faster to make up for smart pathing
            gameStarted = true;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function shootBullet() {
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
// teleport function (IT IS NOT WORKING WELL AND IT SO ANNOYING)
function teleportStalkerSafely(isCloseToPlayer = false) {
    let validSpot = false; // check if the place is found 
    let tx, ty;
    let attempts = 0;
    while (!validSpot && attempts < 100) { // in casw we wont found it doesewnt fall into infinite loop 
        if (isCloseToPlayer) {
            tx = player.x + (Math.random() - 0.5) * 1500; // generate random x around the player
            ty = player.y + (Math.random() - 0.5) * 1500; // same but for y 
        } else { // if the teleport is not near player 
            tx = Math.random() * (WORLD_WIDTH - 100) + 50; // fun fact the + 50 is to aviode the world border but he is NOT ACTULLY AVOIDNG THEM
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
    if (keys['arrowleft'] || keys['a']) nextX -= currentSpeed;
    if (keys['arrowright'] || keys['d']) nextX += currentSpeed;

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

            if (distance < 150) shakeTime = 5; 
        } else {
        
         // waypoint system for slender to detect the wall
         // it is not actully working 
            let target = { x: player.x, y: player.y };

            // x y w h represent the outer boundaries of the building 
            // dx dy are the safe coordinates just outside the entrance
            const buildings = [
                { x: 1180, y: 280, w: 840, h: 680, dx: 1600, dy: 960 }, // House
                { x: 3480, y: 1980, w: 840, h: 840, dx: 3900, dy: 2820 }, // Warehouse
                { x: 580, y: 2980, w: 540, h: 440, dx: 830, dy: 3420 } // Shed
            ]; // I need to teah this idiot what a shed looks like so he doesnt get stuck

            let pCenter = { x: player.x + player.size/2, y: player.y + player.size/2 };
            let sCenter = { x: stalker.x + stalker.size/2, y: stalker.y + stalker.size/2 };

            for (let b of buildings) {
                let pIn = (pCenter.x > b.x && pCenter.x < b.x + b.w && pCenter.y > b.y && pCenter.y < b.y + b.h);
                let sIn = (sCenter.x > b.x && sCenter.x < b.x + b.w && sCenter.y > b.y && sCenter.y < b.y + b.h);
                
                // if one is inside and one is outside, Stalker routes to the door first!
                if (pIn && !sIn) {
                    target.x = b.dx; target.y = b.dy; break;
                } else if (sIn && !pIn) {
                    target.x = b.dx; target.y = b.dy; break;
                }
            }

           // smooth sliding 
            let dx = target.x - stalker.x;
            let dy = target.y - stalker.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 5) { // Only move if he isnt already standing exactly on the waypoint
                let vx = (dx / dist) * stalker.speed;
                let vy = (dy / dist) * stalker.speed;

                // Move X
                stalker.x += vx;
                let hitX = false;
                for (let t of obstacles) {
                    if (t.isWall && stalker.x < t.x + t.w && stalker.x + stalker.size > t.x && 
                        stalker.y < t.y + t.h && stalker.y + stalker.size > t.y) {
                        hitX = true; break;
                    }
                }
                if (hitX) stalker.x -= vx; // revert x if it hil wall

                // Move Y
                stalker.y += vy;
                let hitY = false;
                for (let t of obstacles) {
                    if (t.isWall && stalker.x < t.x + t.w && stalker.x + stalker.size > t.x && 
                        stalker.y < t.y + t.h && stalker.y + stalker.size > t.y) {
                        hitY = true; break;
                    }
                }
                if (hitY) stalker.y -= vy; // same for y 
            }

            // catch player condtion 
            if ( 
                player.x < stalker.x + stalker.size &&
                player.x + player.size > stalker.x &&
                player.y < stalker.y + stalker.size &&
                player.y + player.size > stalker.y
            ) { 
                endScreen = "gameover";
                for (let key in keys) { keys[key] = false; }
                player.x = WORLD_WIDTH / 2; player.y = WORLD_HEIGHT / 2;
                teleportStalkerSafely(false);
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
                teleportStalkerSafely(false);
                stalker.staticTimer = 10; 
                bullets.splice(i, 1);
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
        isSprinting = false; shakeTime = 0;
        stalker.killTimer = 0; stalker.teleportTimer = 0; stalker.staticTimer = 0;
    }
}

function draw() {
    ctx.save();
    
    ctx.imageSmoothingEnabled = false;
    if (shakeTime > 0) {
        let shakeX = (Math.random() - 0.5) * 10;
        let shakeY = (Math.random() - 0.5) * 10;
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

        // Draw Player 
        const currentPlayerImg = player.showAnimFrame ? playerAnimImg : playerImg;
        if (currentPlayerImg.complete && currentPlayerImg.width > 0) {
            ctx.drawImage(currentPlayerImg, player.x, player.y, player.size, player.size);
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
        for (let i = 0; i < 5000; i++) { 
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let gray = Math.random() * 255;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.4)`;
            ctx.fillRect(x, y, 2, 2);
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
// main 
function gameloop() {
    update(); draw(); requestAnimationFrame(gameloop);
}

gameloop();