const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bullets = [];
const bulletSpeed = 10;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// copying the static so it can not cause lag 
const staticCanvas = document.createElement('canvas');
staticCanvas.width = 512;
staticCanvas.height = 512;
const staticCtx = staticCanvas.getContext('2d');
const staticData = staticCtx.createImageData(512, 512);
for (let i = 0; i < staticData.data.length; i += 4) {
    let v = Math.random() * 255;
    staticData.data[i] = v;
    staticData.data[i+1] = v;
    staticData.data[i+2] = v;
    staticData.data[i+3] = 255;
}
staticCtx.putImageData(staticData, 0, 0);

const darkCanvas = document.createElement("canvas");
const darkCtx = darkCanvas.getContext("2d");

// Adding menu state for controls screen
let showingControls = false;

const mouse = { x:0, y: 0}; 
window.addEventListener('mousemove', (e)=> {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

window.addEventListener('mousedown', (e) => {
    if (gameStarted && gameMode === "action" && !intro.active) {
        shootBullet();
    }
    
    // Mouse interaction for the Main Menu
    if (!gameStarted && endScreen === "") {
        const mx = e.clientX;
        const my = e.clientY;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        if (showingControls) {
            showingControls = false; // Click anywhere to exit controls
            return;
        }

        // Horror Mode Button bounds
        if (Math.abs(mx - cx) < 150 && Math.abs(my - (cy + 20)) < 30) {
            gameMode = "horror";
            player.speed = 5;
            stalker.speed = 3.0; // Slightly faster for giant map
            gameStarted = true;
            intro.active = true; 
        }
        // Action Mode Button bounds
        else if (Math.abs(mx - cx) < 150 && Math.abs(my - (cy + 80)) < 30) {
            gameMode = "action";
            player.speed = 7;
            gameStarted = true;
            intro.active = true; 
        }
        // Controls Button bounds
        else if (Math.abs(mx - cx) < 150 && Math.abs(my - (cy + 140)) < 30) {
            showingControls = true;
        }
    }
});

const slenderImg = new Image();
slenderImg.src = 'slender_new.png'; 

const playerImg = new Image();
playerImg.src = 'player_front.png'; 

const playerAnimImg = new Image();
playerAnimImg.src = 'player_side.png'; 

const treeImg = new Image();
treeImg.src = 'tree1.png';

const tree2Img = new Image();
tree2Img.src = 'tree2.png';

const groundImg = new Image();
groundImg.src = 'map.png';

const wallImg = new Image();
wallImg.src = 'wall.png'; 

const floorImg = new Image();
floorImg.src = 'IndoorFloor.png';

const campfireImg = new Image();
campfireImg.src = 'campfire.png';

const scarecrowImg = new Image();
scarecrowImg.src = 'scarecrow.png';

const scarecrow2Img = new Image();
scarecrow2Img.src = 'scarecrow2.png';

const borderImg = new Image();
borderImg.src = 'Pared del medio_0.png'; 

// 4x map size
const WORLD_WIDTH = 10000;
const WORLD_HEIGHT = 8000;
const BORDER_SIZE = 20; 

// Building coordinates for AI pathfinding
const buildings = [
    { x: 1000, y: 1000, w: 1500, h: 1200, dx: 1750, dy: 2300 }, // Manor
    { x: 4000, y: 5000, w: 2000, h: 1500, dx: 5000, dy: 6600 }, // Warehouse
    { x: 7000, y: 1000, w: 1800, h: 1800, dx: 6800, dy: 1900 }, // Asylum
    { x: 7500, y: 6000, w: 1500, h: 1500, dx: 8250, dy: 7600 }  // Cabin
];

const obstacles = [
    // buldinh 1 wall and indoor 
    { img: floorImg, x: 1000, y: 1000, w: 1500, h: 1200, isFloor: true },
    { img: wallImg, x: 1000, y: 1000, w: 1500, h: 40, isWall: true }, // Top
    { img: wallImg, x: 1000, y: 2160, w: 650, h: 40, isWall: true }, // Bottom L
    { img: wallImg, x: 1850, y: 2160, w: 650, h: 40, isWall: true }, // Bottom R (Entrance)
    { img: wallImg, x: 1000, y: 1000, w: 40, h: 1200, isWall: true }, // Left
    { img: wallImg, x: 2460, y: 1000, w: 40, h: 1200, isWall: true }, // Right
    { img: wallImg, x: 1040, y: 1500, w: 610, h: 40, isWall: true }, // Inner H Divider L
    { img: wallImg, x: 1890, y: 1500, w: 570, h: 40, isWall: true }, // Inner H Divider R
    // Left Hall Wall (with doors)
    { img: wallImg, x: 1650, y: 1040, w: 40, h: 260, isWall: true }, 
    { img: wallImg, x: 1650, y: 1450, w: 40, h: 300, isWall: true }, 
    { img: wallImg, x: 1650, y: 1900, w: 40, h: 260, isWall: true }, 
    // Right Hall Wall (with doors)
    { img: wallImg, x: 1850, y: 1040, w: 40, h: 260, isWall: true }, 
    { img: wallImg, x: 1850, y: 1450, w: 40, h: 300, isWall: true },  // btw this is hell 
    { img: wallImg, x: 1850, y: 1900, w: 40, h: 260, isWall: true }, 

    // 2
    { img: floorImg, x: 4000, y: 5000, w: 2000, h: 1500, isFloor: true },
    { img: wallImg, x: 4000, y: 5000, w: 2000, h: 40, isWall: true }, // Top
    { img: wallImg, x: 4000, y: 6460, w: 900, h: 40, isWall: true }, // Bottom L
    { img: wallImg, x: 5100, y: 6460, w: 900, h: 40, isWall: true }, // Bottom R (Entrance)
    { img: wallImg, x: 4000, y: 5000, w: 40, h: 1500, isWall: true }, // Left
    { img: wallImg, x: 5960, y: 5000, w: 40, h: 1500, isWall: true }, // Right
    // Horizontal Hallway Top Wall
    { img: wallImg, x: 4000, y: 5500, w: 200, h: 40, isWall: true }, 
    { img: wallImg, x: 4350, y: 5500, w: 600, h: 40, isWall: true }, 
    { img: wallImg, x: 5100, y: 5500, w: 500, h: 40, isWall: true }, 
    { img: wallImg, x: 5750, y: 5500, w: 250, h: 40, isWall: true }, 
    // Horizontal Hallway Bottom Wall
    { img: wallImg, x: 4000, y: 5800, w: 200, h: 40, isWall: true }, 
    { img: wallImg, x: 4350, y: 5800, w: 500, h: 40, isWall: true }, 
    { img: wallImg, x: 5100, y: 5800, w: 500, h: 40, isWall: true }, 
    { img: wallImg, x: 5750, y: 5800, w: 250, h: 40, isWall: true }, 
    // Vertical room dividers
    { img: wallImg, x: 4500, y: 5000, w: 40, h: 500, isWall: true }, 
    { img: wallImg, x: 4500, y: 5840, w: 40, h: 620, isWall: true }, 
    { img: wallImg, x: 5500, y: 5000, w: 40, h: 500, isWall: true }, 
    { img: wallImg, x: 5500, y: 5840, w: 40, h: 620, isWall: true }, 
    // Entry channel
    { img: wallImg, x: 4900, y: 5840, w: 40, h: 620, isWall: true }, 
    { img: wallImg, x: 5100, y: 5840, w: 40, h: 620, isWall: true },

    // 3
    { img: floorImg, x: 7000, y: 1000, w: 1800, h: 1800, isFloor: true },
    { img: wallImg, x: 7000, y: 1000, w: 1800, h: 40, isWall: true }, // Top
    { img: wallImg, x: 7000, y: 2760, w: 1800, h: 40, isWall: true }, // Bottom
    { img: wallImg, x: 8760, y: 1000, w: 40, h: 1800, isWall: true }, // Right
    { img: wallImg, x: 7000, y: 1000, w: 40, h: 800, isWall: true }, // Left Top
    { img: wallImg, x: 7000, y: 2000, w: 40, h: 800, isWall: true }, // Left Bot (Side Entrance)
    // Central Spine Corridors
    { img: wallImg, x: 7040, y: 1800, w: 300, h: 40, isWall: true }, 
    { img: wallImg, x: 7490, y: 1800, w: 300, h: 40, isWall: true }, 
    { img: wallImg, x: 7940, y: 1800, w: 300, h: 40, isWall: true }, 
    { img: wallImg, x: 8390, y: 1800, w: 370, h: 40, isWall: true }, 
    { img: wallImg, x: 7040, y: 2000, w: 300, h: 40, isWall: true }, 
    { img: wallImg, x: 7490, y: 2000, w: 300, h: 40, isWall: true }, 
    { img: wallImg, x: 7940, y: 2000, w: 300, h: 40, isWall: true }, 
    { img: wallImg, x: 8390, y: 2000, w: 370, h: 40, isWall: true }, 
    // Ward Dividers
    { img: wallImg, x: 7500, y: 1040, w: 40, h: 760, isWall: true }, 
    { img: wallImg, x: 8000, y: 1040, w: 40, h: 760, isWall: true }, 
    { img: wallImg, x: 7500, y: 2040, w: 40, h: 720, isWall: true }, 
    { img: wallImg, x: 8000, y: 2040, w: 40, h: 720, isWall: true }, 

    // 5
    { img: floorImg, x: 7500, y: 6000, w: 1500, h: 1500, isFloor: true },
    { img: wallImg, x: 7500, y: 6000, w: 1500, h: 40, isWall: true }, // Top
    { img: wallImg, x: 7500, y: 7460, w: 700, h: 40, isWall: true }, // Bottom L
    { img: wallImg, x: 8350, y: 7460, w: 650, h: 40, isWall: true }, // Bottom R (Entrance)
    { img: wallImg, x: 7500, y: 6000, w: 40, h: 1500, isWall: true }, // Left
    { img: wallImg, x: 8960, y: 6000, w: 40, h: 1500, isWall: true }, // Right
    // Zig zag walls and yes they didnt really work but I will keep them 
    { img: wallImg, x: 7900, y: 6000, w: 40, h: 800, isWall: true }, 
    { img: wallImg, x: 7900, y: 6950, w: 40, h: 510, isWall: true }, 
    { img: wallImg, x: 7940, y: 7000, w: 400, h: 40, isWall: true }, 
    { img: wallImg, x: 8490, y: 7000, w: 470, h: 40, isWall: true }
];


function isInsideBuilding(x, y, w, h) {
    for(let b of buildings) {
        if (x + w > b.x - 300 && x < b.x + b.w + 300 &&
            y + h > b.y - 300 && y < b.y + b.h + 300) {
            return true;
        }
    }
    return false;
}

// limit the assets so they dont be too much 
for(let i = 0; i < 550; i++) {
    let rand = Math.random();
    let type;
    
    if (rand < 0.50) type = {img: treeImg, w: 320, h: 400, isTree: true}; // 50% Tree 1
    else if (rand < 0.88) type = {img: tree2Img, w: 390, h: 390, isTree: true}; // 38% Tree 2
    else if (rand < 0.93) type = {img: scarecrowImg, w: 140, h: 140, isProp: true}; // 5% Scarecrow 1
    else if (rand < 0.98) type = {img: scarecrow2Img, w: 140, h: 140, isProp: true}; // 5% Scarecrow 2
    else type = {img: campfireImg, w: 120, h: 120, isProp: true}; // 2% Campfire

    let tx = Math.random() * (WORLD_WIDTH - 600) + 300;
    let ty = Math.random() * (WORLD_HEIGHT - 600) + 300;

    if (!isInsideBuilding(tx, ty, type.w, type.h)) {
        obstacles.push({
            img: type.img, x: tx, y: ty, w: type.w, h: type.h, 
            isWall: false, isFloor: false, isProp: type.isProp || false, isTree: type.isTree || false
        });
    }
}

let gameStarted = false;
let gameMode = "";
let endScreen = "";

// -cimentic intro 
const introDialogue = [
    { speaker: "Player", text: "Where... where am I? It's so cold... What is this place?" },
    { speaker: "Bahaa", text: "You are inside the matrix of my code. A fragile entity born within the canvas." },
    { speaker: "Player", text: "Who's there?! Show yourself!" },
    { speaker: "Bahaa", text: "I am your creator. I built this forest, these walls, and the terror that hunts you." },
    { speaker: "Bahaa", text: "It is my final project for Tuğberk Hoca's class. The ultimate hurdle." },
    { speaker: "Player", text: "A project?! You're feeding me to a monster for a grade?!" },
    { speaker: "Bahaa", text: "I am sorry, my friend. Your terror is the toll I must pay. Face your fate." }
];

let intro = {
    active: false,
    alpha: 1.0, 
    fadeState: 'dark', 
    timer: 0,
    lineIdx: 0,
    charIdx: 0,
    showText: ""
};

let playerHealth = 100;
let ammo = 6; 
let stamina = 100;
let isSprinting = false; 
let isExhausted = false; 
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
    facingLeft: false 
};

const stalker = {
    x: WORLD_WIDTH / 2 + 1000,
    y: WORLD_HEIGHT / 2 + 1000,
    size: 80, 
    speed: 2.5,
    color: "red", 
    killTimer: 0,
    teleportTimer: 0,
    reactionBuffer: 0, 
    staticTimer: 0, 
    stareTimer: 0, 
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

 if (e.code === 'Space' && intro.active && intro.fadeState === 'dialogue') {
     if (intro.charIdx < introDialogue[intro.lineIdx].text.length) {
         intro.showText = introDialogue[intro.lineIdx].text;
         intro.charIdx = introDialogue[intro.lineIdx].text.length;
     } else {
         intro.lineIdx++;
         intro.charIdx = 0;
         intro.showText = "";
         if (intro.lineIdx >= introDialogue.length) {
             intro.fadeState = 'flickerOut';
             intro.timer = 0;
         }
     }
     return; 
 }

 if (!gameStarted && endScreen !==""){
    endScreen = "";
    return;
 }
    if (e.key.toLowerCase() === 'shift' && gameStarted && !isExhausted && !intro.active) {
        isSprinting = !isSprinting;
    }
    if (e.code === 'Space' && gameStarted && gameMode === "action" && !intro.active) {
        shootBullet();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function shootBullet() {
    if (ammo <= 0) return; 
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

function teleportStalkerSafely(isCloseToPlayer = false) {
    let validSpot = false; 
    let tx, ty;
    let attempts = 0;
    while (!validSpot && attempts < 100) { 
        if (isCloseToPlayer) {
            tx = player.x + (Math.random() - 0.5) * 1200; 
            ty = player.y + (Math.random() - 0.5) * 1200; 
        } else { 
            tx = Math.random() * (WORLD_WIDTH - 100) + 50; 
            ty = Math.random() * (WORLD_HEIGHT - 100) + 50;
        }
        
        tx = Math.max(BORDER_SIZE, Math.min(tx, WORLD_WIDTH - BORDER_SIZE - stalker.size));
        ty = Math.max(BORDER_SIZE, Math.min(ty, WORLD_HEIGHT - BORDER_SIZE - stalker.size));

        let hitWall = false; 
        for(let t of obstacles) {
            if(t.isWall) {
                if (tx < t.x + t.w && tx + stalker.size > t.x &&
                    ty < t.y + t.h && ty + stalker.size > t.y) {
                    hitWall = true;
                    break;
                }
            }
        }
        if (!hitWall) validSpot = true; 
        attempts++;
    }
    stalker.x = tx;
    stalker.y = ty;
}

function update() {
    if (!gameStarted) return;

    if (intro.active) {
        if (intro.fadeState === 'dark') {
            intro.timer++;
            if (intro.timer > 60) intro.fadeState = 'fadingIn';
        } else if (intro.fadeState === 'fadingIn') {
            intro.alpha -= 0.01;
            if (intro.alpha <= 0) {
                intro.alpha = 0;
                intro.fadeState = 'dialogue';
                intro.timer = 0;
            }
        } else if (intro.fadeState === 'dialogue') {
            intro.timer++;
            if (intro.timer % 2 === 0 && intro.charIdx < introDialogue[intro.lineIdx].text.length) {
                intro.showText += introDialogue[intro.lineIdx].text[intro.charIdx];
                intro.charIdx++;
            }
        } else if (intro.fadeState === 'flickerOut') {
            intro.timer++;
            intro.alpha = Math.random() > 0.5 ? 0.8 : 0.1; 
            if (intro.timer > 60) {
                intro.active = false;
                intro.alpha = 0;
            }
        }
        return; 
    }

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
        player.facingLeft = true; 
    }
    if (keys['arrowright'] || keys['d']) {
        nextX += currentSpeed;
        player.facingLeft = false; 
    }

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
                if (stalker.stareTimer > 0) stalker.stareTimer -= 2;
                if (stalker.stareTimer < 0) stalker.stareTimer = 0;

                stalker.teleportTimer++; 
                if (stalker.teleportTimer > stats.teleportCooldown){
                    teleportStalkerSafely(true); 
                    stalker.teleportTimer = 0;
                    stalker.staticTimer = 15; 
                }
            } else {
                stalker.reactionBuffer++;
                stalker.stareTimer++; 
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
                    stalker.stareTimer = 0;
                    gameStarted = false;
                    return; 
                }
            } else {
                stalker.killTimer = Math.max(0, stalker.killTimer - 1); 
            }

            if (distance < 150) shakeTime = 5; 
        } else {
            // Action Mode Logic
            if (stalker.stunTimer > 0) {
                stalker.stunTimer--; 
            } else {
                
                // Smart Waypoint Logic
                let target = { x: player.x, y: player.y };
                let pCenter = { x: player.x + player.size/2, y: player.y + player.size/2 };
                let sCenter = { x: stalker.x + stalker.size/2, y: stalker.y + stalker.size/2 };

                for (let b of buildings) {
                    let pIn = (pCenter.x > b.x && pCenter.x < b.x + b.w && pCenter.y > b.y && pCenter.y < b.y + b.h);
                    let sIn = (sCenter.x > b.x && sCenter.x < b.x + b.w && sCenter.y > b.y && sCenter.y < b.y + b.h);
                    
                    if (pIn && !sIn) {
                        target.x = b.dx; target.y = b.dy; break;
                    } else if (sIn && !pIn) {
                        target.x = b.dx; target.y = b.dy; break;
                    }
                }

                let dx = target.x - stalker.x;
                let dy = target.y - stalker.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                stalker.actionTeleportTimer++;
                let tpCooldown = Math.max(60, 300 - (pagesFound * 30)); 
                let tpDamage = 15 + (pagesFound * 5); 
                
                if (stalker.actionTeleportTimer >= tpCooldown) {
                    if (dist < 1800) {
                        playerHealth -= tpDamage;
                        shakeTime = 30; 
                        stalker.staticTimer = 40; 
                        
                        teleportStalkerSafely(true); 
                        stalker.actionTeleportTimer = 0;
                        
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
                    } else {
                        teleportStalkerSafely(true); 
                        stalker.actionTeleportTimer = 0;
                    }
                }

                if ( 
                    player.x < stalker.x + stalker.size &&
                    player.x + player.size > stalker.x &&
                    player.y < stalker.y + stalker.size &&
                    player.y + player.size > stalker.y
                ) {
                    playerHealth -= 30;
                    shakeTime = 30;
                    stalker.staticTimer = 40;
                    teleportStalkerSafely(true);
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
                
                if (gameMode === "action") {
                    stalker.stunTimer = 1200; 
                    stalker.actionTeleportTimer = 0; 
                    stalker.x = -10000;
                    stalker.y = -10000;
                } else {
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
        
        if (pagesFound < 8) {
            page.x = pageLocations[pagesFound].x;
            page.y = pageLocations[pagesFound].y; 
            stalker.speed += 0.2;     
            
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
        stalker.stareTimer = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    
    ctx.imageSmoothingEnabled = false;
    
    if (gameStarted && gameMode === "action" && playerHealth < 100) {
        let hurtTremble = (100 - playerHealth) / 20;
        ctx.translate((Math.random() - 0.5) * hurtTremble, (Math.random() - 0.5) * hurtTremble);
    }

    if (shakeTime > 0) {
        let shakeX = (Math.random() - 0.5) * 15; 
        let shakeY = (Math.random() - 0.5) * 15;
        ctx.translate(shakeX, shakeY);
    }
    
    let zoom = 1.5;
    let camX = player.x + player.size / 2 - (canvas.width / 2) / zoom;
    let camY = player.y + player.size / 2 - (canvas.height / 2) / zoom;
    
    ctx.save();
    ctx.scale(zoom, zoom); 
    ctx.translate(-camX, -camY); 

    // draw gorund 
    try {
        if (groundImg.complete && groundImg.width > 0) {
            const pattern = ctx.createPattern(groundImg, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        }
    } catch (e) {
        ctx.fillStyle = "#002200";
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }

    if (gameStarted) {
        // inddor floor 
        obstacles.forEach(t => {
            if (t.isFloor && t.img.complete && t.img.width > 0) {
                ctx.save();
                const pattern = ctx.createPattern(t.img, 'repeat');
                ctx.fillStyle = pattern;
                ctx.translate(t.x, t.y);
                ctx.fillRect(0, 0, t.w, t.h);
                ctx.restore();
            }
        });

        //walls 
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

        // campfire scarecrows stuff 
        obstacles.forEach(t => {
            if (t.isProp && t.img.complete && t.img.width > 0) {
                ctx.drawImage(t.img, t.x, t.y, t.w, t.h);
            }
        });

        // moving entities 
        if (pagesFound > 0 && slenderImg.complete && slenderImg.width > 0 && !intro.active) {
            ctx.drawImage(slenderImg, stalker.x, stalker.y, stalker.size, stalker.size);
        }

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

        if (pagesFound < 8 && !intro.active) { 
            ctx.fillStyle = page.color; 
            ctx.fillRect(page.x, page.y, page.size, page.size);
        }
        ctx.fillStyle = 'yellow';
        bullets.forEach(bullet => { ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size); });

        //tree (it most overlap over stuff)
        obstacles.forEach(t => {
            if (t.isTree && t.img.complete && t.img.width > 0) {
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
        if (darkCanvas.width !== canvas.width + 100 || darkCanvas.height !== canvas.height + 100) {
            darkCanvas.width = canvas.width + 100;
            darkCanvas.height = canvas.height + 100;
        }

        darkCtx.globalCompositeOperation = "source-over";
        darkCtx.fillStyle = "rgb(0, 0, 10)";
        darkCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);
        darkCtx.globalCompositeOperation = "destination-out";

        const darkCenterX = darkCanvas.width / 2;
        const darkCenterY = darkCanvas.height / 2;
        const angle = Math.atan2(mouse.y - (canvas.height / 2), mouse.x - (canvas.width / 2));

        const glowGradient = darkCtx.createRadialGradient(darkCenterX, darkCenterY, 30 * zoom, darkCenterX, darkCenterY, 70 * zoom);
        glowGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        darkCtx.fillStyle = glowGradient;
        darkCtx.beginPath();
        darkCtx.arc(darkCenterX, darkCenterY, 70 * zoom, 0, Math.PI * 2);
        darkCtx.fill();

        const beamGradient = darkCtx.createRadialGradient(darkCenterX, darkCenterY, 0, darkCenterX, darkCenterY, 450 * zoom);
        beamGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        beamGradient.addColorStop(0.7, "rgba(0, 0, 0, 0.8)");
        beamGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        darkCtx.fillStyle = beamGradient;
        darkCtx.beginPath();
        darkCtx.moveTo(darkCenterX, darkCenterY);
        darkCtx.arc(darkCenterX, darkCenterY, 450 * zoom, angle - 0.4, angle + 0.4);
        darkCtx.lineTo(darkCenterX, darkCenterY);
        darkCtx.fill();

        ctx.drawImage(darkCanvas, -50, -50); 
    }

    if (gameStarted && !intro.active) {
        let drawStatic = false;
        let staticAlpha = 0;

        if (stalker.staticTimer > 0) {
            drawStatic = true;
            staticAlpha = 0.6;
        } 
        else if (gameMode === "horror" && stalker.stareTimer > 0) {
            drawStatic = true;
            let stareIntensity = Math.min(stalker.stareTimer / 120, 1);
            staticAlpha = 0.9 * stareIntensity;
        }

        if (drawStatic) {
            ctx.save();
            ctx.globalAlpha = staticAlpha;
            let offsetX = -(Math.random() * 256);
            let offsetY = -(Math.random() * 256);
            ctx.drawImage(staticCanvas, offsetX, offsetY, canvas.width + 256, canvas.height + 256);
            ctx.restore();
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
            // Main Menu Draw
            if (showingControls) {
                // Smeared blood (yes I know)
                ctx.textAlign = "center";
                
                // Shadow layer for the blood 
                ctx.fillStyle = "rgba(139, 0, 0, 0.4)";
                ctx.font = "bold 50px 'Courier New', Courier, monospace";
                ctx.fillText("THEY ARE WATCHING", canvas.width / 2 + 3, canvas.height / 2 - 117);
                
                ctx.font = "bold 25px 'Courier New', Courier, monospace";
                ctx.fillText("WASD to Move. SHIFT to Run.", canvas.width / 2 + 2, canvas.height / 2 - 38);
                ctx.fillText("In Action Mode: Left Click to Shoot.", canvas.width / 2 + 2, canvas.height / 2 + 12);
                ctx.fillText("Do not look at him.", canvas.width / 2 + 2, canvas.height / 2 + 62);

                // Top layer 
                ctx.fillStyle = "#8B0000"; 
                ctx.font = "bold 50px 'Courier New', Courier, monospace";
                ctx.fillText("THEY ARE WATCHING", canvas.width / 2, canvas.height / 2 - 120);
                
                ctx.font = "bold 25px 'Courier New', Courier, monospace";
                ctx.fillText("WASD to Move. SHIFT to Run.", canvas.width / 2, canvas.height / 2 - 40);
                ctx.fillText("In Action Mode: Left Click to Shoot.", canvas.width / 2, canvas.height / 2 + 10);
                ctx.fillText("Do not look at him.", canvas.width / 2, canvas.height / 2 + 60);

                ctx.fillStyle = "gray";
                ctx.font = "18px Arial";
                ctx.fillText("[ Click anywhere to go back ]", canvas.width / 2, canvas.height / 2 + 140);
            } else {
                ctx.textAlign = "center";
                
                // Pixelated Slender Man title
                ctx.fillStyle = "white";
                ctx.font = "bold 80px 'Courier New', Courier, monospace";
                ctx.fillText("SLENDER MAN", canvas.width / 2, canvas.height / 2 - 100);
                
                ctx.fillStyle = "darkgray";
                ctx.font = "20px 'Courier New', Courier, monospace";
                ctx.fillText("by Bahaa", canvas.width / 2, canvas.height / 2 - 60);
                
                ctx.fillStyle = "white";
                ctx.font = "30px 'Courier New', Courier, monospace";
                ctx.fillText("Play HORROR Mode", canvas.width / 2, canvas.height / 2 + 20);
                ctx.fillText("Play ACTION Mode", canvas.width / 2, canvas.height / 2 + 80);
                
                ctx.fillStyle = "darkred";
                ctx.fillText("CONTROLS", canvas.width / 2, canvas.height / 2 + 140);
            }
        }
    } else if (!intro.active) {
        if (gameMode === "action") {
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
            ctx.fillStyle = isExhausted ? "red" : isSprinting ? "gray" : "white"; // changed lime/cyan to fit no neon rule
            ctx.fillRect(20, 110, stamina, 10);
            ctx.strokeStyle = "white";
            ctx.strokeRect(20, 110, 100, 10);

            if (stalker.stunTimer > 0) {
                ctx.fillStyle = "white"; // changed from lime
                ctx.fillText("Slender Cooldown: " + Math.ceil(stalker.stunTimer / 60) + "s", 20, 140);
            }

        } else {
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
            ctx.fillStyle = isExhausted ? "red" : isSprinting ? "gray" : "white"; // changed lime/cyan to fit no neon rule
            ctx.fillRect(20, 70, stamina, 10);
            ctx.strokeStyle = "white";
            ctx.strokeRect(20, 70, 100, 10);
        }
    }

    if (gameStarted && intro.active) {
        ctx.save();
        
        ctx.fillStyle = `rgba(0, 0, 0, ${intro.alpha})`;
        ctx.fillRect(-50, -50, canvas.width + 100, canvas.height + 100);

        if (intro.fadeState === 'dialogue') {
            const boxWidth = 800;
            const boxHeight = 150;
            const boxX = (canvas.width - boxWidth) / 2;
            const boxY = canvas.height - boxHeight - 50;

            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            const currentLine = introDialogue[intro.lineIdx];
            
            ctx.fillStyle = currentLine.speaker === "Player" ? "#4da6ff" : "#ff4d4d";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "left";
            ctx.fillText(currentLine.speaker, boxX + 20, boxY + 40);

            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText(intro.showText, boxX + 20, boxY + 80);

            if (intro.charIdx === currentLine.text.length) {
                ctx.fillStyle = "gray";
                ctx.font = "italic 16px Arial";
                ctx.textAlign = "right";
                ctx.fillText("Press Space to continue...", boxX + boxWidth - 20, boxY + boxHeight - 20);
            }
        }
        ctx.restore();
    }
    
    ctx.restore();
}

function gameloop() {
    update(); draw(); requestAnimationFrame(gameloop);
}

gameloop();