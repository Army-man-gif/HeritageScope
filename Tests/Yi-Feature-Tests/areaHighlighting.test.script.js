/*
  Area Highlighting test script
  Usage:
  1) Open App/Map.html in browser
  2) Open DevTools Console
  3) Paste:
     await import('/Test%20script/F-1Highlighting%20Heritage%20and%20cultural%20sites/areaHighlighting.test.script.js')
*/

const TEST_NAME = "F-1 Area Highlighting";
const TIMEOUT_MS = 20000;
let restoreFetch = null;

function ok(condition, message) {
  if (!condition) throw new Error(message);
}

function waitFor(predicate, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (predicate()) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error(`Timeout waiting for: ${label}`));
      }
    }, 150);
  });
}

function getLayerCount(highlighter) {
  return Object.keys(highlighter.layerTable || {}).length;
}

function mockAreaApiCalls() {
  const originalFetch = globalThis.fetch;
  if (typeof originalFetch !== "function") {
    return () => {};
  }

  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (url.includes("/api/areas/by-marker") || /\/api\/areas\/\d+/.test(url)) {
      return new Response(JSON.stringify({ message: "mocked 404 from test script" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return originalFetch(input, init);
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
}

async function runAreaHighlightTests() {
  const results = [];
  const lid = 1;
  const latlng = { lat: 51.5074, lng: -0.1278 };

  const test = async (name, fn) => {
    try {
      await fn();
      results.push({ name, pass: true });
      console.log(`PASS: ${name}`);
    } catch (error) {
      results.push({ name, pass: false, detail: error.message });
      console.error(`FAIL: ${name} -> ${error.message}`);
    }
  };

  restoreFetch = mockAreaApiCalls();

  await test("Global API should be ready", async () => {
    await waitFor(
      () => typeof globalThis.hsFocusAreaHighlight === "function" && globalThis.hsAreaHighlighter,
      TIMEOUT_MS,
      "hsFocusAreaHighlight + hsAreaHighlighter"
    );
  });

  await test("Clear should remove all polygons", async () => {
    const highlighter = globalThis.hsAreaHighlighter;
    const cleared = globalThis.hsClearAreaHighlight?.();
    ok(cleared && cleared.code === 0, "hsClearAreaHighlight should return code 0");
    ok(getLayerCount(highlighter) === 0, "layerTable should be empty after clear");
  });

  await test("Focus with marker should create one highlighted area", async () => {
    const highlighter = globalThis.hsAreaHighlighter;
    const result = await globalThis.hsFocusAreaHighlight(lid, {
      latlng,
      databaseOnly: false,
      notifyFallback: false
    });
    ok(result && (result.code === 0 || result.code === 1), "focus result should be success or already exists");
    ok(getLayerCount(highlighter) === 1, "exactly one area should be highlighted");
    ok(highlighter.layerTable[String(lid)], "layerTable should contain the focused LID");
  });

  await test("Toolbar invalid input should show validation text", async () => {
    const input = document.getElementById("lidInput");
    const runBtn = document.getElementById("areaMarkRun");
    const status = document.getElementById("lidCurrent");

    ok(input && runBtn && status, "toolbar elements must exist");
    input.value = "abc";
    runBtn.click();

    await waitFor(
      () => status.textContent && status.textContent.toLowerCase().includes("invalid input"),
      2000,
      "invalid input status"
    );
  });

  await test("Remove should delete polygon by LID", async () => {
    const highlighter = globalThis.hsAreaHighlighter;
    const result = highlighter.remove(lid);
    ok(result.code === 0, "remove() should return code 0");
    ok(!highlighter.layerTable[String(lid)], "layer should be removed from layerTable");
  });

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  if (typeof restoreFetch === "function") {
    restoreFetch();
    restoreFetch = null;
  }
  console.log(`\n${TEST_NAME} finished: ${passed}/${results.length} passed, ${failed} failed.`);
  return { testName: TEST_NAME, passed, failed, results };
}

globalThis.runAreaHighlightTests = runAreaHighlightTests;
console.log("Loaded areaHighlighting.test.script.js. Run: await runAreaHighlightTests()");
