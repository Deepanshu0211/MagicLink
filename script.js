const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const center = { x: canvas.width / 2, y: canvas.height / 2 };
let otherWindowPos = { x: center.x, y: center.y };


const channel = new BroadcastChannel('magic_link');

function sendPosition() {
  channel.postMessage({ x: window.screenX + center.x, y: window.screenY + center.y });
}
window.addEventListener('move', sendPosition);
setInterval(sendPosition, 30);

channel.onmessage = (event) => {
  otherWindowPos = event.data;
};


let particles = [];
const particleCount = 50;

function createParticles() {
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      trail: []
    });
  }
}
createParticles();


function lerp(a, b, t) {
  return a + (b - a) * t;
}
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let dx = (otherWindowPos.x - (window.screenX + center.x));
  let dy = (otherWindowPos.y - (window.screenY + center.y));
  let distance = Math.sqrt(dx * dx + dy * dy);

  let colorFactor = Math.min(distance / 1000, 1);
  let r = Math.floor(255 * (1 - colorFactor));
  let g = 50;
  let b = Math.floor(255 * colorFactor);

  ctx.lineWidth = 2;

 
  if (distance < 1200) { 
    let steps = 40;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);

    for (let i = 1; i <= steps; i++) {
      let t = i / steps;
      let x = lerp(center.x, center.x + dx, t);
      let y = lerp(center.y, center.y + dy, t);

    
      let wave = Math.sin(t * 10 * Math.PI + Date.now() * 0.005) * 20;
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      x += Math.cos(angle) * wave;
      y += Math.sin(angle) * wave;

      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.stroke();
  }


  particles.forEach(p => {
    p.progress += p.speed;
    if (p.progress > 1) p.progress = 0;

    const px = lerp(center.x, center.x + dx, p.progress);
    const py = lerp(center.y, center.y + dy, p.progress);

    
    p.trail.push({ x: px, y: py });
    if (p.trail.length > 10) p.trail.shift(); 

   
    for (let i = 0; i < p.trail.length; i++) {
      let trailPoint = p.trail[i];
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${i / p.trail.length})`;
      ctx.arc(trailPoint.x, trailPoint.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });


  let gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 50);
  gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 50, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(animate);
}

animate();
