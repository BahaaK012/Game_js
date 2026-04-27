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

const slenderImg = new Image();
slenderImg.src = 'New Piskel.png'; 

const playerImg = new Image();
playerImg.src = 'New Piskel (7).png'; 

const treeImg = new Image();
treeImg.src = 'dead_tree-001.png';

const tree2Img = new Image();
tree2Img.src = 'tree_10 (1).png';

const groundImg = new Image();
groundImg.src = 'map.png';

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
    x: Math.random() * (canvas.width - 20), //radnom postions
    y: Math.random() * (canvas.height - 20),
    size: 15,
    color: "white"
};

const player = {
    x: 50,
    y: 50,
    size: 40, 
    speed: 5
};

const stalker = {
    x: 500,
    y: 500,
    size: 40,
    speed: 2,
    color: "red", 
    killTimer: 0,
    teleportTimer: 0,
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
        shakeTime = 10; // shake effect 
        bullets.push({
            x: player.x + player.size / 2, // created at player postion
            y: player.y + player.size / 2,
            size: 5
        }); 
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

function update() {
    if (!gameStarted) return;

    // check player movment
    const isMoving = keys['w'] || keys['s'] || keys['a'] || keys['d'] || 
                     keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright'];

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

    if (canMoveX && nextX >= 0 && nextX + player.size <= canvas.width) {
        player.x = nextX;
    }
    if (canMoveY && nextY >= 0 && nextY + player.size <= canvas.height) {
        player.y = nextY;
    }

    // stalker
    if (pagesFound > 0) {
        if (gameMode === "horror") {
            
            let currentPhase = 1;
            if (pagesFound >= 6) currentPhase = 3;
            else if (pagesFound >= 3) currentPhase = 2;

            let stats = stalker.phases[currentPhase];
            // Calculate from CENTERS so the math is perfectly accurate
            let pCenterX = player.x + player.size / 2;
            let pCenterY = player.y + player.size / 2;
            let sCenterX = stalker.x + stalker.size / 2;
            let sCenterY = stalker.y + stalker.size / 2;

            // Reversed dx and dy so it points FROM player TO stalker
            let dx = sCenterX - pCenterX; 
            let dy = sCenterY - pCenterY; 
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            // check if the flash is on slender 
            let angleToStalker = Math.atan2(dy, dx);
            let mouseAngle = Math.atan2(mouse.y - pCenterY, mouse.x - pCenterX);
            let angleDiff = Math.abs(angleToStalker - mouseAngle);
            
            // normlize 
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            
            // if he on light
            let isBeingWatched = (distance < 450 && angleDiff < 0.4);

            if (!isBeingWatched) {
                stalker.teleportTimer++; 
                if (stalker.teleportTimer > stats.teleportCooldown){
                    // Pick a spot closer to player
                    stalker.x = player.x + (Math.random() - 0.5) * 400;
                    stalker.y = player.y + (Math.random() - 0.5) * 400;
                    stalker.teleportTimer = 0;
                }
            } else {
                // when watching his timer will be not working
                stalker.teleportTimer = 0;
            }

            // kill mechanic
            if (distance < stats.killDistance){
                stalker.killTimer++; 
                shakeTime = 10;
                if (stalker.killTimer > 120) { 
                    endScreen = "gameover";
                    for (let key in keys) { keys[key] = false; }
                    player.x = 50; player.y = 50;
                    stalker.x = 500; stalker.y = 500;
                    pagesFound = 0; stamina = 100;
                    isSprinting = false;
                    shakeTime = 0;
                    stalker.killTimer = 0; 
                    stalker.teleportTimer = 0; 
                    gameStarted = false;
                    return; 
                }
            } else {
                 
                stalker.killTimer = Math.max(0, stalker.killTimer - 1); 
            }

            if (distance < 150){
                shakeTime = 5; // shake effect 
            }
        } else {
            // Action Mode movement logic
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
                player.x = 50; player.y = 50;
                stalker.x = 500; stalker.y = 500;
                pagesFound = 0; stamina = 100;
                isSprinting = false;
                shakeTime = 0;
                stalker.killTimer = 0; // Fixes red screen bug
                stalker.teleportTimer = 0; // Fixes instant teleport bug
                gameStarted = false;
                return;
            }
        }
    }

    // loop through bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bulletSpeed; // move it forward
        
        // bullet obstacle logic
        let bulletHitObstacle = false;
        obstacles.forEach(t => {
            if (bullets[i].x < t.x + t.w && bullets[i].x + bullets[i].size > t.x &&
                bullets[i].y < t.y + t.h && bullets[i].y + bullets[i].size > t.y) {
                bulletHitObstacle = true;
            }
        });

        if (bulletHitObstacle) {
            bullets.splice(i, 1);
            continue; // Bullet is gone, skip to next bullet
        }
        
        if (bullets[i].x > canvas.width) { bullets.splice(i, 1); continue; } // here we actully do want the bullet to go off screen
        
        if (pagesFound > 0) {
            if (// if it will hit 
                bullets[i].x < stalker.x + stalker.size &&
                bullets[i].x + bullets[i].size > stalker.x &&
                bullets[i].y < stalker.y + stalker.size &&
                bullets[i].y + bullets[i].size > stalker.y
            ) {
                stalker.x = Math.random() * (canvas.width - 50); // gets teleported
                stalker.y = Math.random() * (canvas.height - 50);
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
                stalker.x = Math.random() * (canvas.width - stalker.size);
                stalker.y = Math.random() * (canvas.height - stalker.size);
                let dx = player.x - stalker.x;
                let dy = player.y - stalker.y;
                distance = Math.sqrt(dx * dx + dy * dy);
            }
        }

        page.x = Math.random() * (canvas.width - 30) + 15; // teleported for random place
        page.y = Math.random() * (canvas.height - 30) + 15; 
        stalker.speed += 0.2; // buff for slender     
    }

    if (shakeTime > 0) shakeTime--;
     // win reset
    if (pagesFound >= 8) { // win mechnic 
        endScreen = "win"; // our new win screen 
        pagesFound = 0; 
        gameStarted = false;
        player.x = 50; 
        player.y = 50;
        stalker.x = 500; stalker.y = 500;
        isSprinting = false;
        shakeTime = 0;
        stalker.killTimer = 0; // Fixes red screen that keeps happening
        stalker.teleportTimer = 0; // Fixes instant teleport bug
    }
}


function draw() {
    ctx.save();
    
    // Screen shake logic
    if (shakeTime > 0) {
        let shakeX = (Math.random() - 0.5) * 10;
        let shakeY = (Math.random() - 0.5) * 10;
        ctx.translate(shakeX, shakeY);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Safety check for Background Pattern
    try {
        if (groundImg.complete && groundImg.width > 0) {
            const pattern = ctx.createPattern(groundImg, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black"; // Fallback color so you can still see to play
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } catch (e) {
        ctx.fillStyle = "#002200"; // Second fallback
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (!gameStarted) { // menu
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
        ctx.textAlign = "left";

        // Draw Obstacles with safety check
        obstacles.forEach(t => {
            if (t.img.complete && t.img.width > 0) {
                ctx.drawImage(t.img, t.x, t.y, t.w, t.h);
            }
        });

        // Draw Stalker with safety check
        if (pagesFound > 0 && slenderImg.complete && slenderImg.width > 0) {
            ctx.drawImage(slenderImg, stalker.x, stalker.y, stalker.size, stalker.size);
        }

        // Draw Player with safety check
        if (playerImg.complete && playerImg.width > 0) {
            ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
        } else {
            ctx.fillStyle = (gameMode === "action") ? "cyan" : "white";
            ctx.fillRect(player.x, player.y, player.size, player.size);
        }

        // Bullets
        ctx.fillStyle = 'yellow';
        bullets.forEach(bullet => { ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size); });
       
        ctx.fillStyle = page.color; 
        ctx.fillRect(page.x, page.y, page.size, page.size);

        if (gameMode === "horror") {
            // Create an off screen canvas for the darkness overlay
            const darkCanvas = document.createElement("canvas");
            darkCanvas.width = canvas.width;
            darkCanvas.height = canvas.height;
            const darkCtx = darkCanvas.getContext("2d");

            // fill it with darkness 
            darkCtx.fillStyle = "rgb(0, 0, 10)";
            darkCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);

            // now the drawing will act as an eraser
            darkCtx.globalCompositeOperation = "destination-out";

            const centerX = player.x + player.size / 2;
            const centerY = player.y + player.size / 2;
            const angle = Math.atan2(mouse.y - centerY, mouse.x - centerX);

            // soft edges for the lighting
            const glowGradient = darkCtx.createRadialGradient(
                centerX, centerY, 30,
                centerX, centerY, 70
            );
            glowGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
            glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            darkCtx.fillStyle = glowGradient;
            darkCtx.beginPath();
            darkCtx.arc(centerX, centerY, 70, 0, Math.PI * 2);
            darkCtx.fill();

            // erase the beam cone
            const beamGradient = darkCtx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, 450
            );
            beamGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
            beamGradient.addColorStop(0.7, "rgba(0, 0, 0, 0.8)");
            beamGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            darkCtx.fillStyle = beamGradient;
            darkCtx.beginPath();
            darkCtx.moveTo(centerX, centerY);
            darkCtx.arc(centerX, centerY, 450, angle - 0.4, angle + 0.4);
            darkCtx.lineTo(centerX, centerY);
            darkCtx.fill();

            
            ctx.drawImage(darkCanvas, 0, 0);
        }

        if (gameMode === "horror" && stalker.killTimer > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${stalker.killTimer / 240})`; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // UI
        ctx.fillStyle = "white";
        ctx.font = "15px Arial";
        ctx.fillText("Mode: " + gameMode.toUpperCase(), 20, 30);
        ctx.fillText("Pages: " + pagesFound + "/8", 20, 50); 

        ctx.fillStyle = "gray";
        ctx.fillRect(20, 70, 100, 10); 
        
        if (isExhausted) ctx.fillStyle = "red";
        else if (isSprinting) ctx.fillStyle = "cyan";
        else ctx.fillStyle = "lime";
        
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