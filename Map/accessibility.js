function applyFontSize(size){
    const size = {normal: '16px', large: '20px', xlarge: '24px'};
    document.documentElement.style.fontSize = sizes[size];
    localStorage.setItem('fontSize', size);

}

const saved = localStorage.getItem('fontSize') || 'normal';
applyFontSize(saved);
