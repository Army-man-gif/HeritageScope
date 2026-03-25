async function testReports() {
    const baseUrl = "http://localhost:8080/api/reports";

    try {
        console.log("Test 1: GET all reports");
        let response = await fetch(baseUrl);

        if (!response.ok) {
            throw new Error(`GET failed: ${response.status} ${response.statusText}`);
        }

        let reportsBefore = await response.json();
        console.log("Reports before:", reportsBefore);

        console.log("Test 2: Submit a new report");
        const newReport = {
            latitude: 52.48,
            longitude: -1.89,
            category: "SAFETY",
            severity: "LOW",
            affectedGroups: ["wheelchair-users"],
            description: "Automated test report",
            photoPath: ""
        };

        response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newReport)
        });

        if (!response.ok) {
            throw new Error(`POST failed: ${response.status} ${response.statusText}`);
        }

        const submitResult = await response.json();
        console.log("Submit result:", submitResult);

        console.log("Test 3: Retrieve updated reports");
        response = await fetch(baseUrl);

        if (!response.ok) {
            throw new Error(`Second GET failed: ${response.status} ${response.statusText}`);
        }

        let reportsAfter = await response.json();
        console.log("Reports after submit:", reportsAfter);

        const createdReport = reportsAfter.find(
            (r) => r.description === "Automated test report"
        );

        if (!createdReport) {
            throw new Error("Created report not found");
        }

        console.log("Created report:", createdReport);

        console.log("Test 4: Upvote report");
        response = await fetch(`${baseUrl}/${createdReport.id}/upvote`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(`Upvote failed: ${response.status} ${response.statusText}`);
        }

        console.log("Test 5: Confirm upvote increased");
        response = await fetch(baseUrl);

        if (!response.ok) {
            throw new Error(`Final GET failed: ${response.status} ${response.statusText}`);
        }

        const finalReports = await response.json();
        const updatedReport = finalReports.find(
            (r) => r.id === createdReport.id
        );

        if (!updatedReport) {
            throw new Error("Updated report not found after upvote");
        }

        console.log("Updated report:", updatedReport);

        if (updatedReport.upvotes > createdReport.upvotes) {
            console.log("All automated tests passed");
        } else {
            console.log("Test failed: upvote did not increase");
        }

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testReports();