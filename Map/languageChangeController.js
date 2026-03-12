import { buildLanguageSpecificPopup } from './createPopup.js';

export function dynamicallyBuildLanguageSelection(codeValuePairs, currentLanguage, markers, setLanguage){
    const languageControlArea = L.DomUtil.create('div','toolbar');
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
    return languageControlArea;
}

export function updateLanguage(currentLanguage,markers){
    markers.eachLayer(layer => {
        if(layer.feature){
            layer.setPopupContent(buildLanguageSpecificPopup(layer.feature,currentLanguage));
        }
    });
    return currentLanguage;

}