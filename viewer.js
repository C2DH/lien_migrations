let slides = [];
let currentLang = "en";

const params = new URLSearchParams(window.location.search);
const deck = params.get("deck") || "presences-capverdiennes";

function loadSlides(lang) {
  currentLang = lang;
  const deckPath = deck === "." ? "" : deck;
  const filePath = deckPath ? `${deckPath}/slides-${lang}.json` : `slides-${lang}.json`;
  
  fetch(filePath)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      slides = data;
      loadFromPath();
    })
    .catch((err) => {
      console.error(`Failed to load ${filePath}:`, err);
      if (lang !== "en") {
        loadSlides("en");
      }
    });
}

window.addEventListener("hashchange", loadFromPath);

function loadFromPath() {
  const hash = window.location.hash.slice(1);

  let lang = "en";
  let slideId = hash;

  if (hash.includes("/")) {
    const parts = hash.split("/");
    lang = parts[0] || "en";
    slideId = parts[1] || "";
  }

  if (lang !== currentLang) {
    loadSlides(lang);
    return;
  }

  const index = slideId ? slides.findIndex((s) => s.id === slideId) : 0;

  if (index >= 0) {
    renderSlide(index);
  } else {
    renderSlide(0);
  }
}

function renderSlide(index) {
  const viewer = document.getElementById("viewer");
  viewer.innerHTML = "";

  const obj = document.createElement("object");
  const deckPath = deck === "." ? "" : deck;
  const filePath = deckPath ? `${deckPath}/${slides[index].file}` : slides[index].file;
  obj.data = filePath;
  obj.type = "image/svg+xml";

  viewer.appendChild(obj);

  createNavigation(index);
}

function createNavigation(index) {
  const navHeader = document.getElementById("header-nav");
  const nav = document.getElementById("nav");
  navHeader.innerHTML = "";
  nav.innerHTML = "";

  const langSwitcher = document.createElement("div");
  langSwitcher.className = "lang-switcher";

  const enBtn = document.createElement("a");
  enBtn.href = `#en/${slides[index].id}`;
  enBtn.innerText = "EN";
  enBtn.className = currentLang === "en" ? "active" : "";

  const frBtn = document.createElement("a");
  frBtn.href = `#fr/${slides[index].id}`;
  frBtn.innerText = "FR";
  frBtn.className = currentLang === "fr" ? "active" : "";

  langSwitcher.appendChild(enBtn);
  langSwitcher.appendChild(frBtn);

  navHeader.appendChild(langSwitcher);

  const navButtons = document.createElement("div");
  navButtons.className = "nav-buttons";

  if (index > 0) {
    const prev = document.createElement("a");
    prev.href = `#${currentLang}/${slides[index - 1].id}`;
    prev.innerText = "← Prev";
    navButtons.appendChild(prev);
  }

  if (index < slides.length - 1) {
    const next = document.createElement("a");
    next.href = `#${currentLang}/${slides[index + 1].id}`;
    next.innerText = "Next →";
    navButtons.appendChild(next);
  }

  nav.appendChild(navButtons);
}

loadSlides("en");
