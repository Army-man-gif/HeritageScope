
//javascript
// Test Script for Karlie's Features
// (Copy and paste this snippet into the console) Run in browser CONSOLE on http://localhost:8000/App/Map.html (cd DigitalDreamTeam)
// Requires Spring Boot running on localhost:8080


async function runTests() {
    let passed = 0;
    let failed = 0;

    function assert(description, condition) {
        if (condition) {
            console.log(`PASS: ${description}`);
            passed++;
        } else {
            console.error(`FAIL: ${description}`);
            failed++;
        }
    }

    console.log("*-* Accessibility Feature Tests *-*");

    // F-7 Font Size Tests
    console.log("\n**F-7: Font Size Toggle");
    
    document.documentElement.style.fontSize = '';
    localStorage.removeItem('fontSize');
    
    // UT-1: Normal
    document.querySelector('[data-size="normal"]').click();
    await new Promise(r => setTimeout(r, 100));
    assert("UT-01: Normal font size = 16px", 
        document.documentElement.style.fontSize === '16px');

    // UT-2: Large
    document.querySelector('[data-size="large"]').click();
    await new Promise(r => setTimeout(r, 100));
    assert("UT-02: Large font size = 20px", 
        document.documentElement.style.fontSize === '20px');

    // UT-3: XLarge
    document.querySelector('[data-size="xlarge"]').click();
    await new Promise(r => setTimeout(r, 100));
    assert("UT-03: XLarge font size = 24px", 
        document.documentElement.style.fontSize === '24px');

    // UT-4: localStorage persistence
    assert("UT-04: Font size saved to localStorage", 
        localStorage.getItem('fontSize') === '24');

    // F6 High Contrast Tests
    console.log("\n** F-6: High Contrast");

    // Reset
    document.body.classList.remove('high-contrast');
    localStorage.removeItem('highContrast');

    // UT-5: Enable
    document.getElementById('contrast-btn').click();
    await new Promise(r => setTimeout(r, 100));
    assert("UT-05: High contrast enabled - class added", 
        document.body.classList.contains('high-contrast'));
    assert("UT-05: Button text changes to Normal View", 
        document.getElementById('contrast-btn').textContent === 'Normal View');

    // UT-6: Disable
    document.getElementById('contrast-btn').click();
    await new Promise(r => setTimeout(r, 100));
    assert("UT-06: High contrast disabled - class removed", 
        !document.body.classList.contains('high-contrast'));
    assert("UT-06: Button text changes to High Contrast", 
        document.getElementById('contrast-btn').textContent === 'High Contrast');

    // UT-7: localStorage
    document.getElementById('contrast-btn').click();
    await new Promise(r => setTimeout(r, 100));
    assert("UT-07: High contrast saved to localStorage", 
        localStorage.getItem('highContrast') === 'true');

    // Spring Boot API Tests
    console.log("\n**Spring Boot API");

    try {
        // UT-14: GET all status
        const response = await fetch('http://localhost:8080/api/status');
        const sites = await response.json();
        assert("UT-14: GET /api/status returns array", Array.isArray(sites));
        assert("UT-14: GET /api/status returns 6 sites", sites.length === 6);

        // UT-15: GET at-risk sites
        const atRiskResponse = await fetch('http://localhost:8080/api/status/at-risk');
        const atRiskSites = await atRiskResponse.json();
        assert("UT-15: GET /api/status/at-risk returns array", Array.isArray(atRiskSites));
        assert("UT-15: at-risk sites only contain RED/AMBER", 
            atRiskSites.every(s => s.riskLevel === 'RED' || s.riskLevel === 'AMBER'));
        assert("UT-15: No GREEN sites in at-risk", 
            !atRiskSites.some(s => s.riskLevel === 'GREEN'));

    } catch (error) {
        console.error("Spring Boot API not available:", error.message);
        failed += 3;
    }

    console.log(`\n*-* Results: ${passed} passed, ${failed} failed *-8`);
}

runTests();
