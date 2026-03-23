const TEST_NAME = "F-2 Text Resize";

function maybe(condition, message) {
  if (!condition) throw new Error(message);
}

function pxToNum(value) {
  return Number.parseInt(String(value || "").replace("px", ""), 10);
}

function click(id) {
  const button = document.getElementById(id);
  if (!button) throw new Error(`Button not found: ${id}`);
  button.click();
}

function getActivePreset() {
  const active = document.querySelector(".font-btn.active");
  return active ? active.dataset.size : null;
}

async function runTextResizeTests() {
  const results = [];
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

  await test("Text size buttons should exist", async () => {
    maybe(document.getElementById("smallText"), "smallText missing");
    maybe(document.getElementById("mediumText"), "mediumText missing");
    maybe(document.getElementById("largeText"), "largeText missing");
  });

  await test("Clicking A should set 16px + active=normal + localStorage", async () => {
    click("smallText");
    maybe(pxToNum(document.documentElement.style.fontSize) === 16, "html font size should be 16px");
    maybe(getActivePreset() === "normal", "active button should be normal");
    maybe(localStorage.getItem("fontSize") === "16", "localStorage fontSize should be 16");
  });

  await test("Clicking A+ should set 20px + active=large + localStorage", async () => {
    click("mediumText");
    maybe(pxToNum(document.documentElement.style.fontSize) === 20, "html font size should be 20px");
    maybe(pxToNum(document.body.style.fontSize) === 20, "body font size should be 20px");
    maybe(getActivePreset() === "large", "active button should be large");
    maybe(localStorage.getItem("fontSize") === "20", "localStorage fontSize should be 20");
  });

  await test("Clicking A++ should set 24px + active=xlarge + localStorage", async () => {
    click("largeText");
    maybe(pxToNum(document.documentElement.style.fontSize) === 24, "html font size should be 24px");
    maybe(pxToNum(document.body.style.fontSize) === 24, "body font size should be 24px");
    maybe(getActivePreset() === "xlarge", "active button should be xlarge");
    maybe(localStorage.getItem("fontSize") === "24", "localStorage fontSize should be 24");
  });

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log(`\n${TEST_NAME} finished: ${passed}/${results.length} passed, ${failed} failed.`);
  return { testName: TEST_NAME, passed, failed, results };
}

globalThis.runTextResizeTests = runTextResizeTests;
console.log("Loaded textResize.test.script.js. Run: await runTextResizeTests()");
