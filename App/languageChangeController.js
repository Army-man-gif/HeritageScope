import { buildLanguageSpecificPopup } from './createPopup.js';

export function dynamicallyBuildLanguageSelection(codeValuePairs, currentLanguage, markers, setLanguage){
    const biggerContainer = L.DomUtil.create('div','biggerContainer');
    const languageControlArea = L.DomUtil.create('div','lang',biggerContainer);
    const optionBox = L.DomUtil.create('div','language-control',languageControlArea);
    const title = L.DomUtil.create('div', 'language-control__title', optionBox);
    title.textContent = 'Language';
    L.DomEvent.disableClickPropagation(optionBox);
    codeValuePairs.forEach(pair => {
        const label = L.DomUtil.create('label','Langlabel',optionBox);
        label.append(`${pair.label }`)
        const select =  L.DomUtil.create('input','selection',label);
        select.type  = "radio";
        select.name = "language";
        select.value = pair.code;

        if(pair.code === currentLanguage){
            select.checked = true;
        }
        // read aloud when language has changed
        select.addEventListener('change',function(){
            setLanguage(select.value);
            updateLanguage(select.value,markers);
            speak("You have clicked to change the language to " + pair.label);
        });

        // so title reads aloud when clicked
        title.addEventListener("click", function () {
            speak(title.textContent);
        });
        
    })
    const toggleCloseOpen = L.DomUtil.create('button','floatingToggle',biggerContainer);
    toggleCloseOpen.id = "languageToggle";
    toggleCloseOpen.type = "button";
    toggleCloseOpen.setAttribute("aria-label", "Close language control");
    toggleCloseOpen.innerHTML = '\u274E';

    toggleCloseOpen.addEventListener("click", () => {
        const isCollapsed = biggerContainer.classList.toggle("is-collapsed");

        toggleCloseOpen.innerHTML = isCollapsed ? '\u{1F528}' : '\u274E';

        toggleCloseOpen.setAttribute(
            "aria-label",
            isCollapsed ? "Open language control" : "Close language control"
        );
    });
    return biggerContainer;
}

export function updateLanguage(currentLanguage,markers){
    markers.eachLayer(layer => {
        if(layer.feature){
            layer.setPopupContent(buildLanguageSpecificPopup(layer.feature,currentLanguage));
        }
    });
    return currentLanguage;

}