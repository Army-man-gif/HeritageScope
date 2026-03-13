
export async function loadDataset() {

    try{
        const response = await fetch("./dataset.geojson");
        const geoJson = await response.json();
        return geoJson;
    }catch (error){
        console.error("Error:",error);
    }
    
}