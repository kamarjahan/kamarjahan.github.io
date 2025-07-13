document.getElementById("tipForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value || "Anonymous";
  const message = document.getElementById("message").value;
  const amount = document.getElementById("amount").value;
  const txnId = document.getElementById("txnId").value;

  const tip = {
    name,
    message,
    amount,
    txnId,
    timestamp: Date.now()
  };

  db.ref("tips").push(tip).then(() => {
    document.getElementById("statusMsg").innerText = "✅ Tip Sent Successfully!";
    document.getElementById("tipForm").reset();
  });
});
