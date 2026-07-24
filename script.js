const $ = (id) => document.getElementById(id);
const envelope = $("envelope");
const envelopePage = $("envelopePage");
const invitation = $("invitation");
const rsvp = $("rsvp");

let opened = false;

document.querySelectorAll("[data-typed]").forEach((el) => {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  el.textContent = "";
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = char;
    span.style.setProperty("--i", i);
    el.appendChild(span);
  });
});

function openInvitation() {
  if (opened) return;
  opened = true;

  envelope.classList.add("lifting", "opening");
  $("flap").classList.add("open");

  setTimeout(startEmerge, 450);
}

function startEmerge() {
  const card = invitation.querySelector(".card");
  const envRect = envelope.getBoundingClientRect();
  invitation.hidden = false;
  invitation.classList.add("emerging", "measuring");
  const cardRect = card.getBoundingClientRect();

  const stageRect = invitation.getBoundingClientRect();
  const tipY = envRect.top + envRect.height * (291 / 620);
  const clip = {
    "--ty": envRect.top - stageRect.top,
    "--ex1": envRect.left - stageRect.left,
    "--ex2": envRect.right - stageRect.left,
    "--tipx": envRect.left + envRect.width / 2 - stageRect.left,
    "--tipy": tipY - stageRect.top,
  };
  for (const prop in clip) invitation.style.setProperty(prop, `${clip[prop]}px`);


  const scale = (envRect.width * 0.8) / cardRect.width;
  const fromX = envRect.left + envRect.width / 2 - (cardRect.left + cardRect.width / 2);
  const fromY =
    tipY + 10 + (cardRect.height * scale) / 2 - (cardRect.top + cardRect.height / 2);
  card.style.setProperty("--fx", `${fromX}px`);
  card.style.setProperty("--fy", `${fromY}px`);
  card.style.setProperty("--fs", scale);

  invitation.classList.remove("measuring");
  envelopePage.classList.add("opening");

  setTimeout(() => {
    envelopePage.style.display = "none";
    invitation.classList.add("mouth-open");
    window.scrollTo(0, 0);
  }, 1600);

  setTimeout(() => invitation.classList.remove("emerging", "mouth-open"), 3100);
}

$("openBtn").addEventListener("click", openInvitation);
envelope.addEventListener("click", openInvitation);

function showPage(show, hide) {
  hide.hidden = true;
  show.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("rsvpBtn").addEventListener("click", () => showPage(rsvp, invitation));
$("rsvpBack").addEventListener("click", () => showPage(invitation, rsvp));

const rsvpForm = $("rsvpForm");
const rsvpStatus = $("rsvpStatus");

const attendanceReply = $("attendanceReply");
const rsvpSubmit = rsvpForm.querySelector(".rsvp-submit");
const attendanceReplies = {
  "Joyfully Accepts": "We’re so excited to celebrate with you \u{1F90D}",
  "Regretfully Declines": "Thank you for letting us know. We'll miss having you there",
};
rsvpForm.querySelectorAll('input[name="attendance"]').forEach((input) => {
  input.addEventListener("change", () => {
    attendanceReply.textContent = attendanceReplies[input.value] || "";
    attendanceReply.classList.add("show");
    rsvpSubmit.classList.add("ready");
  });
});

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = rsvpForm.querySelector(".rsvp-submit");
  const data = new FormData(rsvpForm);

  submitBtn.disabled = true;
  rsvpStatus.className = "rsvp-status";
  rsvpStatus.textContent = "Sending…";

  try {
    const res = await fetch("/.netlify/functions/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(data)),
    });
    if (!res.ok) throw new Error("Request failed");

    rsvpForm.reset();
    attendanceReply.classList.remove("show");
    rsvpSubmit.classList.remove("ready");
    rsvpStatus.classList.add("ok");
    rsvpStatus.textContent = "Thank you! your RSVP has been received. \u{1F490}";
  } catch {
    rsvpStatus.classList.add("err");
    rsvpStatus.textContent = "Sorry, something went wrong. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
});
