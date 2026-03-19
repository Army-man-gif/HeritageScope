// Population density


async function allMetrics(lat,lng){
    const key = "aa02c580-81e6-4abd-9950-9b905e2786e4";
    

    try{
        const url = `http://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lng}&key=${key}`;
        const response = await fetch(
            url,
            {
                method: 'GET',
            }
        );
        const parsed = await response.json();
        const country = parsed.data.country;
        const populationMetrics = await getPopulation(country);
        if(populationMetrics){
            // Let's caluclate how polluted the air is:
            const pollutantType = parsed.data.current.pollution.mainus;
            const airQualityIndex = parsed.data.current.pollution.aqius;
            let pollutantWeightage  = 1;
            switch(pollutantType){
                case 'p2' : {
                    // Fine particulate
                    pollutantWeightage = 1.5;
                    break;
                }
                case 'p1' : {
                    // Coarse particulate
                    pollutantWeightage = 1.2;
                    break;
                }
                case 'o3' : {
                    // Ozone
                    pollutantWeightage = 0.9;
                    break;
                }
                case 'no2' : {
                    // Nitrous oxide
                    pollutantWeightage = 1.1;
                    break;
                }
                case 'so2' : {
                    // Sulfur dioxide
                    pollutantWeightage = 1.02;
                    break;
                }
                case 'co' : {
                    // Carbon monoxide
                    pollutantWeightage = 1.3;
                    break;
                }
                case 'pm' : {
                    // General particulate
                    pollutantWeightage = 1.05;
                    break;
                }
                default : {
                    break;
                }
            }
            const pollutionFactor = airQualityIndex * pollutantWeightage;
            // How likely are the population gonna be affected by evironmental conditions
            // Calculate how many people live in urban polluted areas
            // Add more sensitivity for older people because they have weaker immune systems
            const weightedPeopleUrban = populationMetrics.popDensity * populationMetrics.urbanPopPcnt;
            // Can't be /100 because that's not enough. if we have denisty around 50-80ish and % 
            // around 50-80% ish then to make it decimal we do /1000
            const scaleDown = weightedPeopleUrban / 1000;
            const skewForOlder = populationMetrics.medianAge / 100
            const populationFactor = scaleDown + skewForOlder;
            // How weather can impact the environment
            // Less wind , more humid, more pollutants
            // More wind dissipates pollution
            const humidity = parsed.data.current.weather.hu;
            const temp = parsed.data.current.weather.tp;
            const heatIndex = parsed.data.current.weather.heatIndex;
            const pressureScaled = parsed.data.current.weather.pr / 100;
            const windSpeed = parsed.data.current.weather.ws;
            const risk = 100 - humidity;
            const reScale = risk / 10;
            const inverseSkewwindSpeed = 1 / (windSpeed);
            const weatherFactor = reScale + inverseSkewwindSpeed + (0.8 * (heatIndex - temp)) + pressureScaled;

            const environmentalSensitivity = 0.6*pollutionFactor + 0.4*populationFactor + 0.2*weatherFactor;
            // Have assigned random weightages throughout can be changed        
            const metrics = {
                ...populationMetrics,
                pollutionFactor : pollutionFactor,
                environmentalSensitivity : environmentalSensitivity,
                humidity : humidity,
                temp : temp,
                pressureScaled : pressureScaled,
                windSpeed :windSpeed,
                weightedPeopleUrban : weightedPeopleUrban
            }
            console.log(metrics);
            return metrics;
        }else{
            console.error('Error fetching air quality:', error);
            return null;
        }
    }catch(error){
        console.error('Error fetching air quality:', error);
    }


}

async function getPopulation(country) {

  const apiKey = "j8qqD6Iv0cUIIVqjsLfDKjS1tgTXhjCte0oCoLvO";
  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/population?country=${encodeURIComponent(country)}`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const mostRecentData = data.historical_population;
    const mostRecentYearData = mostRecentData.at(-1);
    const populationMetrics = {
        country : data.country_name,
        popDensity : mostRecentYearData.density,
        medianAge : mostRecentYearData.median_age,
        fertilityRate : mostRecentYearData.fertility_rate,
        population : mostRecentYearData.population,
        urbanPopPcnt : mostRecentYearData.urban_population_pct,
        urbanPop : mostRecentYearData.urban_population,
        worldPopPrcnt : mostRecentYearData.percentage_of_world_population,
        rankWorldPopulationSize : mostRecentYearData.rank

    }

    return populationMetrics;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Creating a caching functionality in localStorage on browser to reduce API calls
export async function results(lat,lng) {
    // First fetch from cache
    const cacheName = "allMetrics";
    const cache = JSON.parse(localStorage.getItem(cacheName) || '{}');

    const specificLocationKey = `${lat},${lng}`;

    if (cache[specificLocationKey]){
        console.log("Used cache for ",specificLocationKey);
        console.log(cache[specificLocationKey]);
        return cache[specificLocationKey];
    }
    const metrics = await allMetrics(lat,lng);

    if(metrics){
        cache[specificLocationKey]  = metrics;
        localStorage.setItem(cacheName,JSON.stringify(cache)); 
    }
    console.log(metrics);
    return metrics;

}
