export function buildLanguageSpecificPopup(feature,currentLanguage){
    if(feature.properties){
        const langKey = `name_${currentLanguage}`
        const descriptionKey = `short_description_${currentLanguage}`

        const name = feature.properties[langKey] || "No available name";
        const description = feature.properties[descriptionKey] || "No available description";

        const langDisplay = new Intl.DisplayNames(['en'],{type: "language"}).of(currentLanguage);

        const popupText = `
        <b>${langDisplay} name: ${name}</b><br>
        <b>Short ${langDisplay} description: <br><br> ${description}
        </b><br><br>
        `;
        return popupText;
    }
}