let speedEl = document.getElementById("speed");
let unitEl = document.getElementById("unit");
let unitSelector = document.getElementById("unitSelector");

let unit = "mbps";

// Simulate the speed test using image download
async function startTest() {
  speedEl.innerText = "0";
  let imageAddr = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg"; // 5MB image
  let startTime = new Date().getTime();
  
  let downloadSize = 5 * 1024 * 1024; // 5MB

  try {
    const response = await fetch(imageAddr + "?nn=" + Math.random(), {
      cache: "no-cache"
    });
    await response.blob();
    let endTime = new Date().getTime();
    let duration = (endTime - startTime) / 1000;

    let bitsLoaded = downloadSize * 8;
    let speedBps = bitsLoaded / duration;

    showSpeed(speedBps);
  } catch (err) {
    alert("Error testing speed: " + err);
  }
}

function showSpeed(speedBps) {
  let selectedUnit = unitSelector.value;
  unit = selectedUnit;
  unitEl.innerText = selectedUnit;

  let convertedSpeed;

  switch (selectedUnit) {
    case "mbps":
      convertedSpeed = speedBps / (1024 * 1024);
      break;
    case "MBps":
      convertedSpeed = speedBps / (8 * 1024 * 1024);
      break;
    case "kbps":
      convertedSpeed = speedBps / 1024;
      break;
    case "gbps":
      convertedSpeed = speedBps / (1024 * 1024 * 1024);
      break;
    default:
      convertedSpeed = speedBps / (1024 * 1024);
  }

  animateSpeed(0, convertedSpeed, 1000);
}

function animateSpeed(start, end, duration) {
  let startTime = null;
  function update(timestamp) {
    if (!startTime) startTime = timestamp;
    let progress = timestamp - startTime;
    let current = easeOutQuad(progress, start, end - start, duration);
    speedEl.innerText = current.toFixed(2);
    if (progress < duration) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

function easeOutQuad(t, b, c, d) {
  t /= d;
  return -c * t*(t-2) + b;
}

// Get server info
fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {
    document.getElementById("server").innerText = `${data.city}, ${data.country_name} (${data.ip})`;
  });
