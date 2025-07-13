const alertBox = document.getElementById("alertBox");

db.ref("tips").limitToLast(1).on("child_added", (snapshot) => {
  const tip = snapshot.val();
  alertBox.innerHTML = `<h2>${tip.name} tipped ₹${tip.amount}</h2><p>${tip.message}</p>`;
  alertBox.style.display = "block";

  // Text-to-speech
  const speech = new SpeechSynthesisUtterance(`${tip.name} says: ${tip.message}`);
  window.speechSynthesis.speak(speech);

  setTimeout(() => {
    alertBox.style.display = "none";
  }, 10000); // hide after 10s
});
