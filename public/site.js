// The nav's account link: "Sign in" until this browser is signed in to Otter, then the
// account page (or, on an app's pages, the app). Local development never asks production.
(() => {
  const link = document.querySelector(".nav .account");
  if (!link || location.hostname !== "otterware.app") return;
  fetch("https://accounts.otterware.app/otter/session", { credentials: "include" })
    .then((response) => (response.ok ? response.json() : null))
    .then((session) => {
      if (!session?.signedIn) return;
      link.textContent = link.dataset.signedIn;
      if (link.dataset.signedInHref) link.href = link.dataset.signedInHref;
    })
    .catch(() => {});
})();
