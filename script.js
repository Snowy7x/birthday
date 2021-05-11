var rnd = Math.random,
    flr = Math.floor;

let canvas = document.createElement("canvas");
canvas.id = "background";
document.getElementsByTagName("body")[0].appendChild(canvas);
canvas.style.position = "absolute";
canvas.style.zIndex = "-1";
canvas.style.width = "100%";
canvas.style.height = "100%";


canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let ctx = canvas.getContext("2d");

var myGamePiece;
var gifts = [];

for (let i = 0; i < 1; i++){
    gifts.push(new GiftObject(Math.floor(Math.random() * canvas.width - 10), Math.floor(Math.random() * canvas.height), 40, 30));
}

let giftModal = document.getElementById("modal-container");
giftModal.addEventListener("mousedown", () => {
    console.log("closed prize");
    giftModal.classList.add("out");
    document.body.classList.remove('modal-active');
}, false);

console.log("gg");

let sounds = 0;

let muted = true;

// Mute a singular HTML5 element
function muteMe(elem) {
    elem.muted = true;
}

function unmuteMe(elem) {
    elem.muted = false;
}

// Try to mute all video and audio elements on the page
function mutePage() {
    document.querySelectorAll("video, audio").forEach(elem => muteMe(elem));
}

function unmutePage() {
    document.querySelectorAll("video, audio").forEach(elem => unmuteMe(elem));
}

mutePage();

function rndNum(num) {
    return rnd() * num + 1;
}

function vector(x, y) {
    this.x = x;
    this.y = y;

    this.add = function (vec2) {
        this.x = this.x + vec2.x;
        this.y = this.y + vec2.y;
    };
}

function particle(pos, vel) {
    this.pos = new vector(pos.x, pos.y);
    this.vel = vel;
    this.dead = false;
    this.start = 0;

    this.update = function (time) {
        let timeSpan = time - this.start;

        if (timeSpan > 500) {
            this.dead = true;
        }

        if (!this.dead) {
            this.pos.add(this.vel);
            this.vel.y = this.vel.y + gravity;
        }
    };

    this.draw = function () {
        if (!this.dead) {
            drawDot(this.pos.x, this.pos.y, 2);
        }
    };
}

function firework(x, y, z = 10) {
    this.pos = new vector(x, y);
    this.vel = new vector(0, -rndNum(z) - 3);
    this.color = "hsl(" + rndNum(360) + ", 100%, 50%)";
    this.size = 7;
    this.dead = false;
    this.start = 0;

    let exParticles = [],
        exPLen = 100;

    let rootShow = true;

    this.update = function (time) {
        if (this.dead) {
            return;
        }

        rootShow = this.vel.y < 0;

        if (rootShow) {
            this.pos.add(this.vel);
            this.vel.y = this.vel.y + gravity;
        } else {
            if (exParticles.length === 0) {
                flash = true;
                for (let i = 0; i < exPLen; i++) {
                    exParticles.push(
                        new particle(this.pos, new vector(-rndNum(10) + 5, -rndNum(10) + 5))
                    );
                    exParticles[exParticles.length - 1].start = time;
                }
            }
            let numOfDead = 0;
            for (let i = 0; i < exPLen; i++) {
                let p = exParticles[i];
                p.update(time);
                if (p.dead) {
                    numOfDead++;
                }
            }

            if (numOfDead === exPLen) {
                this.dead = true;
            }
        }
    };

    this.draw = function () {
        if (this.dead) {
            return;
        }

        ctx.fillStyle = this.color;
        if (rootShow) {
            drawDot(this.pos.x, this.pos.y, this.size);
        } else {
            for (let i = 0; i < exPLen; i++) {
                let p = exParticles[i];
                p.draw();
            }
        }
    };
}

function drawDot(x, y, size) {
    ctx.beginPath();

    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.closePath();
}

let fireworks = [],
    clickFireworks = [],
    gravity = 0.15,
    snapTime = 0,
    flash = false;

function init() {
    let numOfFireworks = 30;
    for (let i = 0; i < numOfFireworks; i++) {
        fireworks.push(new firework(rndNum(canvas.width), canvas.height));
    }
}

function toggleMute(elm) {
    if (elm.innerHTML === "Un Mute") {
        muted = false;
        elm.innerHTML = "Mute";
    } else {
        muted = true;
        elm.innerHTML = "Un Mute";
    }
}

function update(time){
    if (muted) {
        mutePage()
    } else {
        unmutePage()
    }
    for (let i = 0, len = fireworks.length; i < len; i++) {
        let p = fireworks[i];
        p.update(time);
    }
    if (muted) {
        mutePage()
    } else {
        unmutePage()
    }
    for (let i = 0, len = clickFireworks.length; i < len; i++) {
        let p = clickFireworks[i];
        p.update(time);
    }

    if (muted) {
        mutePage()
    } else {
        unmutePage()
    }
    for (let i = 0, len = gifts.length; i < len; i++) {
        let g = gifts[i];
        g.update();
    }

}

function draw(time) {
    update(time);

    ctx.fillStyle = "transparent";

    if (flash) {
        flash = false;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    let newTime = time - snapTime;
    snapTime = time;

    //ctx.fillText(newTime,10,50);

    ctx.fillStyle = "blue";
    for (let i = 0, len = fireworks.length; i < len; i++) {
        let p = fireworks[i];
        if (p.dead) {
            fireworks[i] = new firework(rndNum(canvas.width), canvas.height);
            p = fireworks[i];
            p.start = time;
        }
        p.draw();
    }
    for (let i = 0, len = clickFireworks.length; i < len; i++) {
        let p = clickFireworks[i];
        if (p.dead) {
            clickFireworks.slice(i, 1);
        }
        p.draw();
    }
    ctx.fillStyle = "white";
    window.requestAnimationFrame(draw);
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

window.addEventListener("resize", function () {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
});

var motionTrailLength = 10;
var positions = [];

var canvasPos = getPosition(canvas);
var mouseX = 0;
var mouseY = 0;

canvas.addEventListener("mousemove", setMousePosition, false);

function setMousePosition(e) {
    mouseX = e.clientX - canvasPos.x;
    mouseY = e.clientY - canvasPos.y;
}

function getPosition(el) {
    var xPosition = 0;
    var yPosition = 0;

    while (el) {
        xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
        el = el.offsetParent;
    }
    return {
        x: xPosition,
        y: yPosition
    };
}

function storeLastPosition(xPos, yPos) {
    // push an item
    positions.push({
        x: xPos,
        y: yPos
    });

    //get rid of first item
    if (positions.length > motionTrailLength) {
        positions.shift();
    }
}

function mouseTrail() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let img = new Image();
    img.src = './images/logo.png';
    ctx.drawImage(img, (canvas.width / 2) - 300, canvas.height / 9, 600, 60);

    for (var i = 0; i < positions.length; i++) {
        var ratio = (i + 1) / positions.length;
        drawCircle(positions[i].x, positions[i].y, 1);
    }

    drawCircle(mouseX, mouseY, "source");

    storeLastPosition(mouseX, mouseY);

    requestAnimationFrame(mouseTrail);
}

update();

function drawCircle(x, y, r) {
    if (r == "source") {
        r = 1;
    } else {
        r /= 4;
    }

    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI, true);
    ctx.fillStyle = "rgba(255, 255, 49, " + r + ")";
    ctx.fill();
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

function GiftObject(x, y, height, width) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.img = new Image();
    this.img.src = './images/gift.png';


    this.update = function () {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    };
}




//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

mouseTrail();
init();
draw();
