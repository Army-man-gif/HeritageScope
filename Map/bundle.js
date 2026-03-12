(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // constants.js
  var init_constants = __esm({
    "constants.js"() {
    }
  });

  // createMap.js
  function createMap() {
    const map = L.map("map");
    map.locate({ setView: true, maxZoom: 16 });
    const streetView = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      minZoom: 2,
      maxZoom: 19
    });
    streetView.addTo(map);
    return map;
  }
  var init_createMap = __esm({
    "createMap.js"() {
      init_constants();
    }
  });

  // siteStatusOverlay.js
  async function toggleStatusOverlay(map) {
    if (overlayVisible) {
      statusCircles.forEach((c) => map.removeLayer(c));
      statusCircles = [];
      overlayVisible = false;
      document.getElementById("status-btn").textContent = "Show At-Risk Sites";
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/api/status");
      const sites = await response.json();
      sites.forEach((site) => {
        const style = RISK_COLOURS[site.riskLevel] || RISK_COLOURS.GREEN;
        const circle = L.circle([site.latitude, site.longitude], {
          radius: 300,
          ...style
        }).bindPopup(`
                <b>${site.siteName}</b><br>
                Risk: <b style="color:${style.color}">${site.riskLevel}</b><br>
                Visitors: ${site.visitorPressure}<br>
                Weather: ${site.weatherCondition}
            `);
        circle.addTo(map);
        statusCircles.push(circle);
      });
      overlayVisible = true;
      document.getElementById("status-btn").textContent = "Hide At-Risk Sites";
    } catch (error) {
      console.error("Failed to fetch site status:", error);
      alert("Cant connect to backend..");
    }
  }
  var RISK_COLOURS, statusCircles, overlayVisible;
  var init_siteStatusOverlay = __esm({
    "siteStatusOverlay.js"() {
      RISK_COLOURS = {
        RED: { color: "#cc0000", fillColor: "#ff4444", fillOpacity: 0.7 },
        AMBER: { color: "#cc7700", fillColor: "#ffaa00", fillOpacity: 0.5 },
        GREEN: { color: "#007700", fillColor: "#44cc44", fillOpacity: 0.4 }
      };
      statusCircles = [];
      overlayVisible = false;
    }
  });

  // riskLevelOverlay.js
  var require_riskLevelOverlay = __commonJS({
    "riskLevelOverlay.js"() {
      init_siteStatusOverlay();
      globalThis.handleStatusToggle = function() {
        const map = globalThis.hsMap;
        if (map) toggleStatusOverlay(map);
      };
    }
  });

  // collapsibleToolbar.js
  var require_collapsibleToolbar = __commonJS({
    "collapsibleToolbar.js"() {
      globalThis.addEventListener("DOMContentLoaded", () => {
        const toolbarContainer = document.querySelector(".toolbarContainer");
        const toolbarToggle = document.getElementById("toolbarToggle");
        if (!toolbarContainer || !toolbarToggle) {
          return;
        }
        toolbarToggle.addEventListener("click", () => {
          const isCollapsed = toolbarContainer.classList.toggle("is-collapsed");
          toolbarToggle.textContent = isCollapsed ? "\u{1F528}" : "\u274E";
          toolbarToggle.setAttribute(
            "aria-label",
            isCollapsed ? "Open toolbar" : "Close toolbar"
          );
        });
      });
    }
  });

  // ../Accessibility/accessibility.js
  var RescaleText, HighContrast;
  var init_accessibility = __esm({
    "../Accessibility/accessibility.js"() {
      RescaleText = class {
        constructor(className) {
          this.min = 10;
          this.max = 40;
          this.step = 2;
          this.sizeLabelId = "sizeLabel";
          if (localStorage.getItem("fontSize")) {
            const savedSize = parseInt(localStorage.getItem("fontSize"), 10);
            this.fontSize = savedSize;
          } else {
            this.fontSize = 16;
          }
          this.updateLabel();
          if (className === void 0) {
            this.f_init();
          } else {
            this.c_init(className);
          }
        }
        storageFontSize(size) {
          localStorage.setItem("fontSize", size);
        }
        /* f means focus */
        f_increaseFont() {
          this.fontSize = Math.min(this.max, this.fontSize + this.step);
          document.body.style.fontSize = this.fontSize + "px";
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
        f_decreaseFont() {
          this.fontSize = Math.max(this.min, this.fontSize - this.step);
          document.body.style.fontSize = this.fontSize + "px";
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
        f_resetFont() {
          this.fontSize = 16;
          document.body.style.fontSize = "16px";
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
        f_init() {
          document.body.style.fontSize = this.fontSize + "px";
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
        /* Kelly writes this function */
        f_applyFontSize(size) {
          const sizes = { normal: "16px", large: "20px", xlarge: "24px" };
          if (!sizes[size]) {
            console.error(`Unsupported font size: ${size}`);
            return;
          }
          document.documentElement.style.fontSize = sizes[size];
          document.querySelectorAll(".font-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.size === size);
          });
          this.fontSize = parseInt(sizes[size], 10);
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
        updateLabel() {
          const sizeLabel = document.getElementById(this.sizeLabelId);
          if (sizeLabel) {
            sizeLabel.textContent = this.fontSize + "px";
          }
        }
        /* c means by class */
        c_init(className) {
          if (!className) {
            if (!this.className) {
              console.error("Class name is required to initialize RescaleText.");
              return;
            }
            this.c_init(this.className);
            return;
          }
          this.className = className;
          this.elements = document.querySelectorAll(className);
          this.elements.forEach((element) => {
            element.style.fontSize = this.fontSize + "px";
          });
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
        c_increaseFont() {
          this.fontSize = Math.min(this.max, this.fontSize + this.step);
          this.elements.forEach((element) => {
            element.style.fontSize = this.fontSize + "px";
          });
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
        c_decreaseFont() {
          this.fontSize = Math.max(this.min, this.fontSize - this.step);
          this.elements.forEach((element) => {
            element.style.fontSize = this.fontSize + "px";
          });
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
        c_resetFont() {
          this.fontSize = 16;
          this.elements.forEach((element) => {
            element.style.fontSize = "16px";
          });
          this.updateLabel();
          this.storageFontSize(this.fontSize);
        }
      };
      HighContrast = class {
        constructor(className) {
          this.HighContrast = false;
          if (localStorage.getItem("highContrast") === "true") {
            this.HighContrast = true;
          }
          if (className) {
            this.c_init(className);
          } else {
            this.f_init();
          }
        }
        storageContrast(isOn) {
          localStorage.setItem("highContrast", isOn);
        }
        f_toggleHighContrast() {
          const isOn = document.body.classList.toggle("high-contrast");
          this.storageContrast(isOn);
          this.HighContrast = isOn;
          this.updateLabel();
        }
        f_init() {
          document.body.classList.toggle("high-contrast", this.HighContrast);
          this.updateLabel();
        }
        c_init(className) {
          if (!className) {
            if (!this.className) {
              console.error("Class name is required to initialize HighContrast.");
              return;
            }
            this.c_init(this.className);
            return;
          }
          this.className = className;
          this.elements = document.querySelectorAll(className);
          if (this.HighContrast) {
            this.elements.forEach((element) => {
              element.classList.add("high-contrast");
            });
          } else {
            this.elements.forEach((element) => {
              element.classList.remove("high-contrast");
            });
          }
          this.updateLabel();
        }
        updateLabel() {
          const btn = document.getElementById("contrast-btn");
          if (btn) {
            btn.textContent = this.HighContrast ? "Normal View" : "High Contrast";
          }
        }
      };
    }
  });

  // highlight.js
  function createHighlightIcon() {
    return L.divIcon({
      className: "",
      html: `<div style="
            width: 20px;
            height: 20px;
            background: #FFD700;
            border: 2px solid #FF8C00;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(255,215,0,0.8);
        "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }
  function createDefaultIcon() {
    return L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
  }
  var MarkerHighlight, AreaHighlight;
  var init_highlight = __esm({
    "highlight.js"() {
      MarkerHighlight = class {
        constructor(map) {
          this.map = map;
          this.currentMarker = null;
          this.currentCircle = null;
        }
        highlight(marker, latlng) {
          if (this.currentMarker) {
            this.currentMarker.setIcon(createDefaultIcon());
          }
          if (this.currentCircle) {
            this.map.removeLayer(this.currentCircle);
          }
          marker.setIcon(createHighlightIcon());
          this.currentCircle = L.circle(latlng, {
            radius: 200,
            color: "#FFD700",
            fillColor: "#FFD700",
            fillOpacity: 0.2,
            weight: 2
          }).addTo(this.map);
          this.currentMarker = marker;
        }
        clear() {
          if (this.currentMarker) {
            this.currentMarker.setIcon(createDefaultIcon());
            this.currentMarker = null;
          }
          if (this.currentCircle) {
            this.map.removeLayer(this.currentCircle);
            this.currentCircle = null;
          }
        }
      };
      AreaHighlight = class {
        constructor(map, defaultStyle = {}) {
          this.map = map;
          this.highlightLayer = L.layerGroup().addTo(map);
          this.layerTable = {};
          this.m_data = null;
          this.defaultStyle = {
            color: "#FFD700",
            fillColor: "#FFD700",
            fillOpacity: 0.35,
            weight: 2,
            ...defaultStyle
          };
        }
        /* locationID -> polygon coords */
        async fetchMockingData(path) {
          try {
            const response = await fetch(path);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data || typeof data !== "object") {
              throw new Error("Mocking data must be a JSON object");
            }
            this.m_data = data;
            return { code: 0, message: "Mocking data loaded successfully" };
          } catch (error) {
            console.error("Error fetching mocking data:", error);
            this.m_data = null;
            return { code: -1, message: error.message };
          }
        }
        /* this only reads mocking data for demonstration */
        lid2poly(lid, styleOverride = {}) {
          if (!this.m_data) {
            return { code: -1, message: "Data not loaded. Call fetchMockingData() first." };
          }
          const key = String(lid);
          const polyData = this.m_data[key];
          if (!Array.isArray(polyData) || polyData.length < 3) {
            return { code: -1, message: `No valid polygon data for lid: ${lid}` };
          }
          const isValid = polyData.every(
            (coord) => Array.isArray(coord) && coord.length === 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1])
          );
          if (!isValid) {
            return { code: -1, message: `Invalid coordinate format for lid: ${lid}` };
          }
          const polygon = L.polygon(polyData, { ...this.defaultStyle, ...styleOverride });
          return { code: 0, message: "Polygon created successfully", data: polygon };
        }
        add(lid, styleOverride = {}) {
          const key = String(lid);
          if (this.layerTable[key]) {
            return { code: 1, message: `Polygon for lid ${lid} already exists`, data: this.layerTable[key] };
          }
          const result = this.lid2poly(key, styleOverride);
          if (result.code !== 0) {
            console.warn(`Failed to create polygon for lid ${lid}. Reason: ${result.message}`);
            return result;
          }
          this.highlightLayer.addLayer(result.data);
          this.layerTable[key] = result.data;
          return { code: 0, message: `Polygon added for lid ${lid}`, data: result.data };
        }
        remove(lid) {
          const key = String(lid);
          const poly = this.layerTable[key];
          if (!poly) {
            return { code: 1, message: `No polygon found for lid: ${lid}` };
          }
          this.highlightLayer.removeLayer(poly);
          delete this.layerTable[key];
          return { code: 0, message: `Polygon removed for lid ${lid}` };
        }
        style(lid, styleOverride) {
          const key = String(lid);
          const poly = this.layerTable[key];
          if (!poly) {
            return { code: -1, message: `No polygon found for lid: ${lid}` };
          }
          if (!styleOverride || typeof styleOverride !== "object") {
            return { code: -1, message: "styleOverride must be an object" };
          }
          poly.setStyle(styleOverride);
          return { code: 0, message: `Style updated for lid ${lid}`, data: poly };
        }
        clearHighlight() {
          this.highlightLayer.clearLayers();
          this.layerTable = {};
          return { code: 0, message: "All area highlights cleared" };
        }
      };
    }
  });

  // init/highlight-init.js
  var require_highlight_init = __commonJS({
    "init/highlight-init.js"() {
      init_highlight();
      var areaHighlighter = null;
      var activeMap = null;
      function ensureStatusNode() {
        const toolbar = document.getElementById("areaHighlightToolbar");
        if (!toolbar) return null;
        let status = document.getElementById("lidCurrent");
        if (!status) {
          status = document.createElement("span");
          status.id = "lidCurrent";
          status.style.marginLeft = "10px";
          status.textContent = "Current LID: none";
          toolbar.appendChild(status);
        }
        return status;
      }
      function bindToolbar() {
        const input = document.getElementById("lidInput");
        const runButton = document.getElementById("areaMarkRun");
        const status = ensureStatusNode();
        if (!input || !runButton || !status) {
          console.warn("Area highlight toolbar components are missing.");
          return;
        }
        const run = () => {
          const raw = input.value.trim();
          const lid = Number.parseInt(raw, 10);
          if (!Number.isInteger(lid)) {
            status.textContent = "Current LID: invalid input";
            return;
          }
          areaHighlighter.clearHighlight();
          const result = areaHighlighter.add(lid, {
            color: "#ff4d00",
            fillColor: "#ffcc00",
            fillOpacity: 0.45,
            weight: 3
          });
          if (result.code === 0 || result.code === 1) {
            status.textContent = `Current LID: ${lid}`;
            if (result.data && activeMap) {
              const bounds = result.data.getBounds();
              if (bounds && bounds.isValid()) {
                activeMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
              }
            }
            if (result.data) {
              result.data.bringToFront();
            }
          } else {
            status.textContent = `Current LID: not found (${lid})`;
          }
        };
        runButton.addEventListener("click", run);
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") run();
        });
      }
      async function initAreaHighlight(map) {
        activeMap = map;
        areaHighlighter = new AreaHighlight(map);
        const loadResult = await areaHighlighter.fetchMockingData("init/mocking_HighLightArea.json");
        if (loadResult.code !== 0) {
          console.error("Failed to initialize AreaHighlight:", loadResult.message);
          return;
        }
        bindToolbar();
      }
      function bootstrap() {
        if (window.hsMap) {
          initAreaHighlight(window.hsMap);
          return;
        }
        window.addEventListener(
          "heritage:map-ready",
          (event) => {
            initAreaHighlight(event.detail.map);
          },
          { once: true }
        );
      }
      bootstrap();
    }
  });

  // init/accessibility-init.js
  var require_accessibility_init = __commonJS({
    "init/accessibility-init.js"() {
      init_accessibility();
      var fontSizeToPreset = {
        16: "normal",
        20: "large",
        24: "xlarge"
      };
      function initAccessibility() {
        const textScaler = new RescaleText();
        const contrastController = new HighContrast();
        document.querySelectorAll(".font-btn").forEach((button) => {
          button.addEventListener("click", () => {
            textScaler.f_applyFontSize(button.dataset.size);
          });
        });
        const contrastButton = document.getElementById("contrast-btn");
        if (contrastButton) {
          contrastButton.addEventListener("click", () => {
            contrastController.f_toggleHighContrast();
          });
        }
        const savedFontSize = Number.parseInt(localStorage.getItem("fontSize"), 10);
        const preset = fontSizeToPreset[savedFontSize];
        if (preset) {
          textScaler.f_applyFontSize(preset);
        } else {
          textScaler.f_init();
        }
      }
      window.addEventListener("DOMContentLoaded", initAccessibility);
    }
  });

  // loadData.js
  async function loadDataset() {
    const fetchData = await fetch("dataset.geojson");
    return await fetchData.json();
  }
  var init_loadData = __esm({
    "loadData.js"() {
    }
  });

  // createPopup.js
  function buildLanguageSpecificPopup(feature, currentLanguage) {
    if (feature.properties) {
      const langKey = `name_${currentLanguage}`;
      const descriptionKey = `short_description_${currentLanguage}`;
      const name = feature.properties[langKey] || "No available name";
      const description = feature.properties[descriptionKey] || "No available description";
      const langDisplay = new Intl.DisplayNames(["en"], { type: "language" }).of(currentLanguage);
      const popupText = `
        <b>${langDisplay} name: ${name}</b><br>
        <b>Short ${langDisplay} description: <br><br> ${description}
        </b><br><br>
        `;
      return popupText;
    }
  }
  var init_createPopup = __esm({
    "createPopup.js"() {
    }
  });

  // createMarkers.js
  function convPointToLayer(highlighter) {
    return function(feature, latlng) {
      const marker = L.marker(latlng, { icon: createDefaultIcon() });
      marker.on("click", function() {
        highlighter.highlight(marker, latlng);
      });
      return marker;
    };
  }
  function onEachFeature(currentLanguage) {
    return function(feature, layer) {
      if (feature.properties) {
        layer.bindPopup(buildLanguageSpecificPopup(feature, currentLanguage), {
          maxWidth: 300,
          maxHeight: 200,
          autoPan: true
        });
      }
    };
  }
  function convertDatasetToLayers(jsonData, markers, highlighter, currentLanguage) {
    L.geoJson(jsonData, {
      pointToLayer: convPointToLayer(highlighter),
      onEachFeature: onEachFeature(currentLanguage)
    }).eachLayer((layer) => markers.addLayer(layer));
  }
  var init_createMarkers = __esm({
    "createMarkers.js"() {
      init_highlight();
      init_createPopup();
    }
  });

  // languageChangeController.js
  function dynamicallyBuildLanguageSelection(codeValuePairs, currentLanguage, markers, setLanguage) {
    const languageControlArea = L.DomUtil.create("div", "toolbar");
    const optionBox = L.DomUtil.create("div", "language-control", languageControlArea);
    const title = L.DomUtil.create("div", "language-control__title", optionBox);
    title.textContent = "Language";
    L.DomEvent.disableClickPropagation(optionBox);
    codeValuePairs.forEach((pair) => {
      const label = L.DomUtil.create("label", "Langlabel", optionBox);
      label.append(`${pair.label}`);
      const select = L.DomUtil.create("input", "selection", label);
      select.type = "radio";
      select.name = "language";
      select.value = pair.code;
      if (pair.code === currentLanguage) {
        select.checked = true;
      }
      select.addEventListener("change", function() {
        setLanguage(select.value);
        updateLanguage(select.value, markers);
      });
    });
    return languageControlArea;
  }
  function updateLanguage(currentLanguage, markers) {
    markers.eachLayer((layer) => {
      if (layer.feature) {
        layer.setPopupContent(buildLanguageSpecificPopup(layer.feature, currentLanguage));
      }
    });
    return currentLanguage;
  }
  var init_languageChangeController = __esm({
    "languageChangeController.js"() {
      init_createPopup();
    }
  });

  // main.js
  var require_main = __commonJS({
    "main.js"() {
      init_createMap();
      var import_riskLevelOverlay = __toESM(require_riskLevelOverlay());
      var import_collapsibleToolbar = __toESM(require_collapsibleToolbar());
      init_accessibility();
      var import_highlight_init = __toESM(require_highlight_init());
      var import_accessibility_init = __toESM(require_accessibility_init());
      init_highlight();
      init_loadData();
      init_createMarkers();
      init_languageChangeController();
      var currentLanguage = "en";
      var markers = L.markerClusterGroup();
      var highlighter;
      var codeValuePairs = [];
      function setLanguage(lang) {
        currentLanguage = lang;
      }
      async function startMain() {
        let jsonData;
        try {
          jsonData = await loadDataset();
          console.log("Dataset loaded successfully");
        } catch (err) {
          console.error("Error loading dataset", err);
          return;
        }
        const map = createMap();
        globalThis.hsMap = map;
        globalThis.dispatchEvent(
          new CustomEvent("heritage:map-ready", { detail: { map } })
        );
        highlighter = new MarkerHighlight(map);
        const initialFeature = jsonData.features[0];
        const languages = Object.keys(initialFeature.properties).filter((key) => key.startsWith("name_")).map((key) => key.slice("name_".length));
        const converter = new Intl.DisplayNames(["en"], { type: "language" });
        codeValuePairs = languages.map((code) => ({
          code,
          label: converter.of(code)
        }));
        convertDatasetToLayers(jsonData, markers, highlighter, currentLanguage);
        map.addLayer(markers);
        map.fitBounds(markers.getBounds());
        map.setZoom(2);
        map.setMaxBounds([
          [-90, -200],
          [90, 200]
        ]);
        const LanguageControl = L.Control.extend({
          onAdd: function() {
            return dynamicallyBuildLanguageSelection(
              codeValuePairs,
              currentLanguage,
              markers,
              setLanguage
            );
          }
        });
        const languageController = new LanguageControl({ position: "topright" });
        map.addControl(languageController);
      }
      startMain().catch((err) => console.error("running main failed:", err));
    }
  });
  require_main();
})();
//# sourceMappingURL=bundle.js.map
