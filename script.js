const $ = (id) => document.getElementById(id);
const envelope = $("envelope");
const envelopePage = $("envelopePage");
const invitation = $("invitation");
const rsvp = $("rsvp");

let opened = false;

// Split into per-letter spans so they can be revealed one at a time (timings live
// in the CSS). aria-label keeps each readable as one phrase to screen readers.
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

  // let the flap swing clear before the card starts to slide out
  setTimeout(startEmerge, 450);
}

// Slides the invitation card up out of the envelope, growing to full size as it
// clears. The card lives in its own stage, so its start position has to be
// measured against the envelope rather than expressed in CSS.
function startEmerge() {
  const card = invitation.querySelector(".card");
  const envRect = envelope.getBoundingClientRect();

  // lay the stage out in its emerging geometry, but invisible and inert, so the
  // rect we measure is the one the card will actually rest at
  invitation.hidden = false;
  invitation.classList.add("emerging", "measuring");
  const cardRect = card.getBoundingClientRect();

  // Clip the stage to the envelope's opening: full width down to the envelope's
  // top edge, then a V dipping to where the front folds converge — point
  // (220, 291) in the env-folds viewBox, which stretches to the envelope's box.
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

  // start scaled to sit inside the envelope, its top just below the fold tip so
  // that none of it shows through the opening yet
  const scale = (envRect.width * 0.8) / cardRect.width;
  const fromX = envRect.left + envRect.width / 2 - (cardRect.left + cardRect.width / 2);
  const fromY =
    tipY + 10 + (cardRect.height * scale) / 2 - (cardRect.top + cardRect.height / 2);
  card.style.setProperty("--fx", `${fromX}px`);
  card.style.setProperty("--fy", `${fromY}px`);
  card.style.setProperty("--fs", scale);

  invitation.classList.remove("measuring");
  envelopePage.classList.add("opening");

  // the envelope has fully faded by now — remove it and, on the very same tick,
  // release the clip so the card's lower half can never show while the envelope
  // is still on screen (the two are now driven by one clock, not two)
  setTimeout(() => {
    envelopePage.style.display = "none";
    invitation.classList.add("mouth-open");
    window.scrollTo(0, 0);
  }, 1600);

  // hand the card back to normal document flow once every beat has finished
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
    rsvpStatus.classList.add("ok");
    rsvpStatus.textContent = "Thank you! your RSVP has been received. \u{1F490}";
  } catch {
    rsvpStatus.classList.add("err");
    rsvpStatus.textContent = "Sorry, something went wrong. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
});
