const gauge = new Gauge(document.getElementById("speedGauge")).setOptions({
  angle: 0, lineWidth: 0.2, radiusScale: 1,
  pointer: { length: 0.6, strokeWidth: 0.035, color: '#fff' },
  limitMax: false, limitMin: false,
  colorStart: '#6FADCF', colorStop: '#8FC0DA',
  strokeColor: '#E0E0E0', generateGradient: true,
});
gauge.maxValue = 1000;
gauge.setMinValue(0);
gauge.animationSpeed = 32;
gauge.set(0);

document.getElementById("startBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("https://ae24a2e9-0bf8-4d92-9380-8fe63556901a-00-3uh1h3ucqs3t4.pike.replit.dev/");
    const data = await res.json();
    
    gauge.set(data.download);
    document.getElementById("speed-text").innerText = `${data.download.toFixed(2)} Mbps`;
    document.getElementById("server").innerText = data.server;
    document.getElementById("download").innerText = data.download + " Mbps";
    document.getElementById("upload").innerText = data.upload + " Mbps";
    document.getElementById("ping").innerText = data.ping + " ms";
  } catch (err) {
    alert("Speed test failed. Check console.");
    console.error(err);
  }
});
