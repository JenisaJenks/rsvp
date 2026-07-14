// Save the Date — envelope opening + RSVP

// ---- Envelope: click to open ----
const envelope = document.getElementById("envelope");
const openBtn = document.getElementById("openBtn");
const invitation = document.getElementById("invitation");
const flap = document.getElementById("flap");

let opened = false;

function openInvitation() {
  if (opened) return;
  opened = true;

  // Swing the flap open on its hinge, then fade the envelope away.
  envelope.classList.add("lifting", "opening");
  flap.classList.add("open");

  // Once faded, hide the envelope and reveal the invitation.
  setTimeout(() => {
    envelope.style.display = "none";
    invitation.hidden = false;
    invitation.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 700);
}

openBtn.addEventListener("click", openInvitation);
envelope.addEventListener("click", (e) => {
  if (e.target === openBtn) return; // the button has its own listener
  openInvitation();
});

// ---- RSVP (page 3) ----
// Posts to a Netlify function that securely writes the RSVP into Notion.
const RSVP_ENDPOINT = "/.netlify/functions/rsvp";

const rsvpBtn = document.getElementById("rsvpBtn");
const rsvpBack = document.getElementById("rsvpBack");
const rsvp = document.getElementById("rsvp");
const rsvpForm = document.getElementById("rsvpForm");
const rsvpStatus = document.getElementById("rsvpStatus");

// Invitation ➜ RSVP
rsvpBtn.addEventListener("click", () => {
  invitation.hidden = true;
  rsvp.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// RSVP ➜ back to the invitation
rsvpBack.addEventListener("click", () => {
  rsvp.hidden = true;
  invitation.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = rsvpForm.querySelector(".rsvp-submit");
  const data = new FormData(rsvpForm);
  const payload = {
    name: data.get("name"),
    attendance: data.get("attendance"),
    dietary: data.get("dietary"),
    message: data.get("message"),
  };

  submitBtn.disabled = true;
  rsvpStatus.className = "rsvp-status";
  rsvpStatus.textContent = "Sending…";

  try {
    const res = await fetch(RSVP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Request failed");

    rsvpForm.reset();
    rsvpStatus.classList.add("ok");
    rsvpStatus.textContent = "Thank you — your RSVP has been received. \u{1F490}";
  } catch {
    rsvpStatus.classList.add("err");
    rsvpStatus.textContent = "Sorry, something went wrong. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
});
