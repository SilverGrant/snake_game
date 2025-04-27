(function () {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  canvas.style.border = "2px solid white";
  canvas.style.background = "black";
  canvas.style.display = "block";
  canvas.style.margin = "20px auto";

  const scoreEl = document.createElement("h2");
  scoreEl.style.textAlign = "center";
  scoreEl.style.color = "white";
  scoreEl.textContent = "Score: 0";

  const modeMessage = document.createElement("h1");
  modeMessage.style.textAlign = "center";
  modeMessage.style.display = "none";
  modeMessage.textContent = "GAY MODE ENGAGED";

  const inputBox = document.createElement("input");
  inputBox.style.display = "none";
  inputBox.style.position = "absolute";
  inputBox.style.top = "50%";
  inputBox.style.left = "50%";
  inputBox.style.transform = "translate(-50%, -50%)";
  inputBox.style.fontSize = "20px";
  inputBox.style.padding = "10px";
  inputBox.style.zIndex = "10";

  document.body.style.background = "black";
  document.body.style.color = "white";
  document.body.style.fontFamily = "sans-serif";
  document.body.innerHTML = "<h1 style='text-align:center;'>Smooth Snake Game</h1><p style='text-align:center;'>Use arrow keys</p>";
  document.body.appendChild(scoreEl);
  document.body.appendChild(modeMessage);
  document.body.appendChild(canvas);
  document.body.appendChild(inputBox);

  const ctx = canvas.getContext("2d");
  const box = 20;
  const speed = 2;

  let snake = [{ x: 160, y: 200 }];
  let direction = { x: speed, y: 0 };
  let food = spawnFood();
  let segmentsToAdd = 0;
  let score = 0;
  let gameOver = false;
  let rainbowMode = false;
  let modeDisplayTime = 0;
  let rainbowOffset = -400;
  let fires = [];
  let fireMode = false;
  let paused = false;
  let showGif = false;

  const rainbowColors = [
    "#FF0000", "#FF7F00", "#FFFF00",
    "#00FF00", "#0000FF", "#4B0082", "#8B00FF",
  ];

  function spawnFood() {
    return {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box,
    };
  }

  function spawnFire() {
    fires.push({
      x: Math.random() * (canvas.width - box),
      y: Math.random() * (canvas.height - box),
      born: Date.now()
    });
  }

  document.addEventListener("keydown", function (e) {
    if (paused) return;

    const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, R = 82, T = 84;
    if (e.keyCode === LEFT && direction.x === 0) {
      direction = { x: -speed, y: 0 };
    } else if (e.keyCode === UP && direction.y === 0) {
      direction = { x: 0, y: -speed };
    } else if (e.keyCode === RIGHT && direction.x === 0) {
      direction = { x: speed, y: 0 };
    } else if (e.keyCode === DOWN && direction.y === 0) {
      direction = { x: 0, y: speed };
    } else if (e.keyCode === R) {
      rainbowMode = !rainbowMode;
      if (rainbowMode) {
        modeMessage.style.display = "block";
        modeDisplayTime = Date.now();
        rainbowOffset = -400;
      } else {
        modeMessage.style.display = "none";
      }
    } else if (e.keyCode === T) {
      paused = true;
      inputBox.style.display = "block";
      inputBox.focus();
    }
  });

  inputBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      if (inputBox.value.toLowerCase() === "flintandsteel") {
        fireMode = true;
        showGif = true;
      }
      inputBox.value = "";
      inputBox.style.display = "none";
      paused = false;
    } else if (e.key === "Escape") {
      inputBox.value = "";
      inputBox.style.display = "none";
      paused = false;
    }
  });

  function drawRoundedRect(x, y, w, h, r, fillStyle) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  function drawRainbowArch() {
    if (!rainbowMode) return;

    const centerX = rainbowOffset;
    const centerY = canvas.height;
    const maxRadius = 300;

    for (let i = 0; i < rainbowColors.length; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius - i * 10, Math.PI, 2 * Math.PI);
      ctx.strokeStyle = rainbowColors[i];
      ctx.lineWidth = 10;
      ctx.stroke();
    }

    rainbowOffset += 2;
    if (rainbowOffset > canvas.width + 300) {
      rainbowOffset = -300;
    }
  }

  function drawFires() {
    if (!fireMode) return;

    fires = fires.filter(f => Date.now() - f.born < 3000);

    for (const fire of fires) {
      const flicker = Math.random() * 4 - 2;
      const radius = 10 + flicker;

      const gradient = ctx.createRadialGradient(fire.x, fire.y, 0, fire.x, fire.y, radius);
      gradient.addColorStop(0, "yellow");
      gradient.addColorStop(0.4, "orange");
      gradient.addColorStop(1, "red");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(fire.x, fire.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = "orange";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(fire.x, fire.y, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function checkFireCollision(x, y) {
    for (const fire of fires) {
      if (Math.hypot(fire.x - x, fire.y - y) < 15) {
        return true;
      }
    }
    return false;
  }

  function draw() {
    if (gameOver || paused) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };
    snake.unshift(newHead);

    if (segmentsToAdd > 0) {
      segmentsToAdd--;
    } else {
      snake.pop();
    }

    if (
      newHead.x < 0 || newHead.y < 0 ||
      newHead.x >= canvas.width || newHead.y >= canvas.height
    ) {
      alert("Game Over! Final Score: " + score);
      gameOver = true;
      location.reload();
      return;
    }

    if (checkFireCollision(newHead.x, newHead.y)) {
      alert("Game Over! Burned! Final Score: " + score);
      gameOver = true;
      location.reload();
      return;
    }

    if (Math.abs(newHead.x - food.x) < box && Math.abs(newHead.y - food.y) < box) {
      segmentsToAdd += box / speed;
      score++;
      scoreEl.textContent = "Score: " + score;
      food = spawnFood();
    }

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(food.x + box / 3, food.y + box / 3, box / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(food.x + box / 2 + 4, food.y + box / 2 - 10, 4, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      const color = rainbowMode
        ? `hsl(${(i * 20 + Date.now() / 5) % 360}, 100%, 50%)`
        : i === 0 ? "limegreen" : "lime";
      drawRoundedRect(seg.x, seg.y, box, box, 5, color);
    }

    drawRainbowArch();
    drawFires();

    if (fireMode && Math.random() < 0.01) {  // Adjust spawn rate to be a bit more frequent
      spawnFire();
    }

    if (showGif) {
      const snakeHead = snake[0];

      // Calculate position for the GIF near the snake's head, right of the box
      const gifX = canvas.width - 150; // Positioned close to the right side of the canvas
      const gifY = 150; // Centered vertically near the snake's box

      const gif = document.createElement("img");
      gif.src = "https://media1.tenor.com/m/-cVyC1yYZCkAAAAd/minecraft-minecraft-movie.gif";
      gif.style.position = "absolute";
      gif.style.left = `${gifX}px`;
      gif.style.top = `${gifY}px`;
      gif.style.width = "150px"; // Adjust GIF size
      gif.style.zIndex = "1000"; // Ensure it's above the canvas
      document.body.appendChild(gif);

      // Remove the GIF after 3 seconds (or adjust as needed)
      setTimeout(() => {
          gif.remove();
      }, 3000);
    }

    if (rainbowMode && Date.now() - modeDisplayTime <= 5000) {
      modeMessage.style.visibility = Math.floor(Date.now() / 150) % 2 ? "visible" : "hidden";
      modeMessage.style.color = `hsl(${(Date.now() / 5) % 360}, 100%, 70%)`;
    } else {
      modeMessage.style.display = "none";
    }

    requestAnimationFrame(draw);
  }

  draw();
})();