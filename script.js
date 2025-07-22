function bitsToMbps(bits) {
  return (bits / 1024 / 1024).toFixed(2);
}

function ms(ms) {
  return ms.toFixed(0);
}

async function startSpeedTest() {
  document.getElementById("downloadText").textContent = "Testing...";
  document.getElementById("uploadText").textContent = "Testing...";
  document.getElementById("pingText").textContent = "Testing...";

  try {
    // Ping
    const pingStart = performance.now();
    await fetch(config.xhr_pingURL + "?r=" + Math.random(), { cache: "no-store" });
    const pingEnd = performance.now();
    const ping = pingEnd - pingStart;

    // Download test
    const dlStart = performance.now();
    const dlRes = await fetch(config.xhr_dlURL[0] + "?r=" + Math.random(), { cache: "no-store" });
    const dlBlob = await dlRes.blob();
    const dlEnd = performance.now();
    const dlDuration = (dlEnd - dlStart) / 1000;
    const dlBits = dlBlob.size * 8;
    const dlSpeed = bitsToMbps(dlBits / dlDuration);

    // Upload test
    const data = new Uint8Array(2 * 1024 * 1024); // 2MB
    const ulStart = performance.now();
    await fetch(config.xhr_ulURL + "?r=" + Math.random(), {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/octet-stream"
      }
    });
    const ulEnd = performance.now();
    const ulDuration = (ulEnd - ulStart) / 1000;
    const ulBits = data.length * 8;
    const ulSpeed = bitsToMbps(ulBits / ulDuration);

    // Display
    document.getElementById("downloadText").textContent = `${dlSpeed} Mbps`;
    document.getElementById("uploadText").textContent = `${ulSpeed} Mbps`;
    document.getElementById("pingText").textContent = `${ms(ping)} ms`;
  } catch (err) {
    alert("Speed test failed: " + err.message);
  }
}

// Fetch IP/server info
fetch(config.ipURL)
  .then(res => res.json())
  .then(data => {
    document.getElementById("serverInfo").textContent = `${data.city}, ${data.country_name} (${data.ip})`;
  })
  .catch(() => {
    document.getElementById("serverInfo").textContent = "Unknown";
  });
