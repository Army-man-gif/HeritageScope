async function testReports() {
    const baseUrl = "http://localhost:8080/api/reports";

    try {
        console.log("Test 1: GET all reports");
        let response = await fetch(baseUrl);
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReport)
        });

        const submitResult = await response.json();
        console.log("Submit result:", submitResult);

        console.log("Test 3: Retrieve updated reports");
        response = await fetch(baseUrl);
        let reportsAfter = await response.json();
        console.log("Reports after:", reportsAfter);

        const createdReport = reportsAfter[reportsAfter.length - 1];

        console.log("Test 4: Upvote report");
        await fetch(`${baseUrl}/${createdReport.id}/upvote`, {
            method: "POST"
        });

        console.log("Test 5: Confirm upvote increased");
        response = await fetch(baseUrl);
        let updatedReports = await response.json();
        let updatedReport = updatedReports.find(
            (r) => r.id === createdReport.id
        );

        console.log("Updated report:", updatedReport);

        if (updatedReport.upvotes > createdReport.upvotes) {
            console.log("All automated tests passed");
        } else {
            console.log("Upvote test failed");
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testReports();