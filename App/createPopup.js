export function buildLanguageSpecificPopup(feature,currentLanguage){
    // There's some phantom api call that noone has called so just blocking it for cleanliness
    const originalFetch = globalThis.fetch;
    globalThis.fetch = function(input, init) {
        if (typeof input === "string" && input.includes("217.154.38.248:8080/api/areas/by-marker")) {
            console.log("Blocked phantom 404 call to:", input);
            return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
        }
        return originalFetch(input, init);
    };
    
    if(feature.properties){
        const langKey = `name_${currentLanguage}`
        const descriptionKey = `short_description_${currentLanguage}`

        const name = feature.properties[langKey] || "No available name";
        const description = feature.properties[descriptionKey] || "No available description";

        const langDisplay = new Intl.DisplayNames(['en'],{type: "language"}).of(currentLanguage);

        const popupText = `
        <b>${langDisplay} name: ${name}</b>
        <br>
        <b>Short ${langDisplay} description: <br><br> ${description}
        </b>
        <br><br>
        <div id="extraMetrics" hidden>
        </div>
        `;
        return popupText;
    }
}