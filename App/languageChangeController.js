import { buildLanguageSpecificPopup } from './createPopup.js';

export function dynamicallyBuildLanguageSelection(codeValuePairs, currentLanguage, markers, setLanguage){
    console.log("building language control");
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
        select.addEventListener('change',function(){
            setLanguage(select.value);
            updateLanguage(select.value,markers);
        });
        
    })
    const toggleCloseOpen = L.DomUtil.create('button','floatingToggle',biggerContainer);
    toggleCloseOpen.id = "languageToggle";
    toggleCloseOpen.type = "button";
    toggleCloseOpen.setAttribute("aria-label", "Close language control");
    toggleCloseOpen.textContent = "❎";

    toggleCloseOpen.addEventListener("click", () => {
        const isCollapsed = biggerContainer.classList.toggle("is-collapsed");

        toggleCloseOpen.textContent = isCollapsed ? "🔨" : "❎";

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