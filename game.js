const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bullets = [];
const bulletSpeed = 10;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//game didnt start yet 
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
    size: 20,
    speed: 5
};

const stalker = {
    x: 500,
    y: 500,
    size: 30,
    speed: 2,
    color: "red"
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
    // prevent going outside screen
    if (nextX >= 0 && nextX + player.size <= canvas.width) player.x = nextX;
    if (nextY >= 0 && nextY + player.size <= canvas.height) player.y = nextY;

    // stalker
    if (stalker.x < player.x) stalker.x += stalker.speed;
    if (stalker.x > player.x) stalker.x -= stalker.speed;
    if (stalker.y < player.y) stalker.y += stalker.speed;
    if (stalker.y > player.y) stalker.y -= stalker.speed;

    if ( // collision 
        player.x < stalker.x + stalker.size &&
        player.x + player.size > stalker.x &&
        player.y < stalker.y + stalker.size &&
        player.y + player.size > stalker.y
    ) { // reset when loss
       endScreen = "gameover"; // our new endscnree
        for (let key in keys) { keys[key] = false; }
        player.x = 50; player.y = 50;
        stalker.x = 500; stalker.y = 500;
        pagesFound = 0; stamina = 100;
        isSprinting = false;
        shakeTime = 0;
        gameStarted = false;
    }
    // loop through bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bulletSpeed; // move it forward
        if (bullets[i].x > canvas.width) { bullets.splice(i, 1); continue; } // here we actully do want the bullet to go off screen
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

    if ( // again collision(I DID IT SO MANY TIMES) 
        player.x < page.x + page.size &&
        player.x + player.size > page.x &&
        player.y < page.y + page.size &&
        player.y + player.size > page.y
    ) {
        pagesFound++; // Increase counter 
        page.x = Math.random() * (canvas.width - 30) + 15; // teleported for random place
        page.y = Math.random() * (canvas.height - 30) + 15; 
        stalker.speed += 0.2; // buff for slender
    }
    let dx = player.x - stalker.x;
    let dy= player.y - stalker.y;
    let distance = Math.sqrt(dx *dx + dy *dy);

    if (gameMode === "horror" && distance < 150){
        shakeTime = 5; // shake effect 
    }
    if (shakeTime > 0) shakeTime--;
     // win reset
    if (pagesFound >= 8) { // win mechnic 
        endScreen = "win"; // our new win screen 
        pagesFound = 0; 
        gameStarted = false;
        player.x = 50; 
        player.y = 50;
        isSprinting = false;
        shakeTime =0;
    }
}

function draw() {
    ctx.save();
    if (shakeTime > 0) {
        let shakeX = (Math.random() - 0.5) * 10;
        let shakeY = (Math.random() - 0.5) * 10;
        ctx.translate(shakeX, shakeY);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        ctx.fillStyle = stalker.color;
        ctx.fillRect(stalker.x, stalker.y, stalker.size, stalker.size);
        // for action mode differnt a little
        ctx.fillStyle = (gameMode === "action") ? "cyan" : "white";
        ctx.fillRect(player.x, player.y, player.size, player.size);
       // bullets color 
        ctx.fillStyle = 'yellow';
        bullets.forEach(bullet => { ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size); });
       
        ctx.fillStyle = page.color; 
        ctx.fillRect(page.x, page.y, page.size, page.size);
         // for horror 
        if (gameMode === "horror") {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height); // next line we will creat a circle to simluate a flashlight
            ctx.arc(player.x + player.size / 2, player.y + player.size / 2, 150, 0, Math.PI * 2, true);
            ctx.fillStyle = "black"; // everything else will become black
            ctx.fill();
            ctx.restore();
        }
       // ui 
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