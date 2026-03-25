let reportMap = null;

function getAffectedGroups() {
const checkboxes = document.querySelectorAll("fieldset input[type='checkbox']");
const selectedGroups = [];

for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
        selectedGroups.push(checkboxes[i].value);
    }
}

return selectedGroups;

}

async function reportSubmission(event) {
    event.preventDefault();

    const category = document.getElementById("category").value;
    const severity = document.getElementById("severity").value;
    const description = document.getElementById("description").value;
    const affectedgroups = getAffectedGroups();

    const reportData = {
        latitude: parseFloat(selectedLat),
        longitude: parseFloat(selectedLng),
        category: category.toUpperCase(),
        severity: severity.toUpperCase(),
        affectedGroups: affectedgroups,
        description: description,
        photoPath: ""
    };

    try {

    const response = await fetch("http://localhost:8080/api/reports", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(reportData)
    });

    const result = await response.json();
    console.log("POST result:", result);

    if (!response.ok) {
        alert("Server error");
        return;
    }

    if (Array.isArray(result) && result.length > 0) {
        alert("Validation failed: " + result.join(", "));
        return;
    }

    alert("Report submitted successfully");
    await loadReports();

    } catch (error){
    console.error("Error:", error);
    alert("Failed to connect to backend");
    };

}

let selectedLat = null;
let selectedLng = null;

function mapClickHandler(map) {
    map.on('click', function (e) {
        selectedLat = e.latlng.lat.toFixed(5);
        selectedLng = e.latlng.lng.toFixed(5);

        const iframe = document.getElementById("reportDialogFrame");

        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: "report-location", lat: selectedLat, lng: selectedLng
            }, "*");
        }
    })
}



async function loadReports() {
    try {
    const response = await fetch("http://localhost:8080/api/reports");
    const reports = await response.json();

    console.log("num = ", reports.length);
    console.log(reports);

    const reportsList = document.getElementById("reportsList");
    reportsList.innerHTML = ""

    for (let i=0; i < reports.length; i++){
        const report = reports[i];

        const reportsSec = document.createElement("div");
        reportsSec.innerHTML = "<strong>" + report.category + "</strong><br>" +
        "Severity" + report.severity + "<br>" + "Location: (" + 
        report.latitude + ", " + report.longitude + ")<br>" +
        "Affected:" + report.affectedGroups.join(", ") + "<br>" + 
        "Description:" + report.description + "<br>" + "Upvotes:" +
        report.upvotes + " " + "<button onclick='upvoteReport(" + report.id + ")'>Upvote</button<hr>";

        reportsList.appendChild(reportsSec);

        if (typeof map != "undefined" && map) {
            L.marker([report.latitude, report.longitude]).addTo(map).bindPopup(
                "<b>" + report.category + "</b><br>" +  "Severity: " +report.severity + "<br>" + report.description + 
                "<br>Upvotes: " + report.upvotes
            );
        }

    }
    } catch (error) {
    console.error("Error loading reports:", error);
    }
}

async function upvoteReport(id) {
    console.log("Upvote Clicked");
    try {
    const response = await fetch("http://localhost:8080/api/reports/" + id + "/upvote", {
        method: "POST"
    });

    const result = await response.json();

    if (result) {
        await loadReports();
    } else { 
        alert("Upvote Failed");

    }

    } catch (error) {
        console.error("Error while upvoting:", error);
    }
}


function setUpReportForm() {

    const form = document.getElementById("reportForm");

    if (!form) {
        return;

    }

    form.addEventListener("submit", reportSubmission);

}

function setUpReportDialog() {
    const dialog = document.getElementById("reportDialog");
    const openBtn = document.getElementById("openReportDialog");
    const closeBtn = document.getElementById("closeReportDialog");

    openBtn.addEventListener("click", () => dialog.showModal());
    closeBtn.addEventListener("click", () => dialog.close());
}

export function initUserReports(map) {
    reportMap = map;
    if (reportMap) {
        mapClickHandler(reportMap);
    }
    setUpReportForm();
    if (document.getElementById("reportDialog")) {
        setUpReportDialog();
    }
    loadReports();

    window.upvoteReport = upvoteReport;
}