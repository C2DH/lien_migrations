let slides = [];
let currentLang = "en";
let currentSlideIndex = 0;
let zoomLevel = 0.75;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

const params = new URLSearchParams(window.location.search);
const deck = params.get("deck") || "presences-capverdiennes";

function loadSlides(lang) {
  currentLang = lang;
  const deckPath = deck === "." ? "" : deck;
  const filePath = deckPath
    ? `${deckPath}/slides-${lang}.json`
    : `slides-${lang}.json`;

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
  currentSlideIndex = index;
  const viewer = document.getElementById("viewer");
  viewer.innerHTML = "";
  viewer.scrollTop = 0;

  const img = document.createElement("img");
  const deckPath = deck === "." ? "" : deck;
  const filePath = deckPath
    ? `${deckPath}/${slides[index].file}`
    : slides[index].file;
  img.src = filePath;
  img.alt = `Slide ${slides[index].id}`;
  img.className = "slide-image";

  // Only add wheel event listener for non-touch devices
  if (!("ontouchstart" in window)) {
    img.addEventListener(
      "wheel",
      (event) => {
        viewer.scrollTop += event.deltaY;
        viewer.scrollLeft += event.deltaX;
        event.preventDefault();
      },
      { passive: false },
    );
  }

  viewer.appendChild(img);
  applyZoom();

  createNavigation(index);
}

function applyZoom() {
  const img = document.querySelector("#viewer .slide-image");
  if (!img) {
    return;
  }

  const zoomPercent = Math.round(zoomLevel * 100);
  img.style.width = `${zoomPercent}%`;

  const zoomLabel = document.getElementById("zoom-level");
  if (zoomLabel) {
    zoomLabel.innerText = `${zoomPercent}%`;
  }
}

function zoomIn() {
  zoomLevel = Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP);
  applyZoom();
}

function zoomOut() {
  zoomLevel = Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP);
  applyZoom();
}

function resetZoom() {
  zoomLevel = 1;
  applyZoom();
}

function createNavigation(index) {
  const navHeader = document.getElementById("header-nav");
  const nav = document.getElementById("nav");
  navHeader.innerHTML = "";
  nav.innerHTML = "";

  const headerControls = document.createElement("div");
  headerControls.className = "header-controls";

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

  const zoomControls = document.createElement("div");
  zoomControls.className = "zoom-controls";

  const zoomOutBtn = document.createElement("button");
  zoomOutBtn.type = "button";
  zoomOutBtn.className = "zoom-btn";
  zoomOutBtn.innerText = "−";
  zoomOutBtn.setAttribute("aria-label", "Zoom out");
  zoomOutBtn.addEventListener("click", zoomOut);

  const zoomLabel = document.createElement("span");
  zoomLabel.id = "zoom-level";
  zoomLabel.className = "zoom-level";

  const zoomInBtn = document.createElement("button");
  zoomInBtn.type = "button";
  zoomInBtn.className = "zoom-btn";
  zoomInBtn.innerText = "+";
  zoomInBtn.setAttribute("aria-label", "Zoom in");
  zoomInBtn.addEventListener("click", zoomIn);

  const zoomResetBtn = document.createElement("button");
  zoomResetBtn.type = "button";
  zoomResetBtn.className = "zoom-btn zoom-reset";
  zoomResetBtn.innerText = "100%";
  zoomResetBtn.setAttribute("aria-label", "Reset zoom");
  zoomResetBtn.addEventListener("click", resetZoom);

  zoomControls.appendChild(zoomOutBtn);
  zoomControls.appendChild(zoomLabel);
  zoomControls.appendChild(zoomInBtn);
  zoomControls.appendChild(zoomResetBtn);

  headerControls.appendChild(langSwitcher);
  headerControls.appendChild(zoomControls);
  navHeader.appendChild(headerControls);

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

  applyZoom();
}

loadSlides("en");
