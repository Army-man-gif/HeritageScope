export async function loadDataset() {

    const fetchData = await fetch("dataset.geojson");

    return await fetchData.json();

}