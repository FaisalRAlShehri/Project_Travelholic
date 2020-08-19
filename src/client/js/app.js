/* Global Variables */
const geonamesAPIURL = "http://api.geonames.org/searchJSON?q=";
const weatherbitAPIURL = "http://api.weatherbit.io/v2.0/history/energy";
const pixabayAPIURL = "https://pixabay.com/api/";
const localServerURL = "http://localhost:3000/";
let check = false;

// Personal API Keys for all the used APIs
const geonamesUsername = "faisalralshehri";
const weatherbitAPIKey = "6224fa4fd54a48ae85704ebac2aa26d2";
const pixabayAPIKey = "17757490-001a7a5930db9d1a31bd96c17";

// Create a new date instance dynamically with JS
let d = new Date();
d = createDateFormat(d);

/* Helper functions*/
export function removeQuotations(inputJSON) {
    return JSON.stringify(inputJSON).replace(/['"]+/g, '');
}

export function createDateFormat(d) {
    let dd = d.getDate();
    let mm = d.getMonth()+1;
    let yyyy = d.getFullYear();
    if(dd<10)
    {
        dd='0'+dd;
    }

    if(mm<10)
    {
        mm='0'+mm;
    }

    return yyyy + "-" + mm + "-" + dd;
}

// Event listener to add function to existing HTML DOM element
const button = document.getElementById("generate");
button.addEventListener("click", (f) =>{
    /* Function called by event listener */
    f.preventDefault();
    const city = document.getElementById("city").value;
    const startDate = document.getElementById("startdate").value;
    const endDate = document.getElementById("enddate").value;
    if (city === ""){
        alert("Error: City name cannot be empty, please enter a city name.")
    } else if (startDate === ""){
        alert("Error: Arrival date cannot be empty, please enter an arrival date.")
    } else if (endDate === ""){
        alert("Error: Departure date cannot be empty, please enter a departure date.")
    } else if (Date.parse(startDate) < Date.parse(d)){
        alert("Error: Arrival date cannot be in the past, please enter a valid arrival date")
    } else if (endDate <= startDate){
        alert("Error: Departure date cannot be before or equal to arrival date.")
    } else {
        getAPIData(city, startDate, endDate);
    }
});

/* Function to GET Web API Data*/
async function getAPIData(city, startDate, endDate) {
    const geonamesres = await fetch(geonamesAPIURL + city + "&maxRows=10&username=" + geonamesUsername);
    const weatherbitres = await fetch(weatherbitAPIURL + "?city=" + city + "&start_date=" + startDate
        + "&end_date=" + endDate + "&key=" + weatherbitAPIKey, {
        credentials: "same-origin"
    });
    const geonamesOutcome = await geonamesres.json();
    let pixabayres = await fetch(pixabayAPIURL + "?key=" + pixabayAPIKey + "&q=" + city);
    let pixabayOutcome = await pixabayres.json();
    if (weatherbitres.status === 204) {
        check = false;
        if (geonamesOutcome.totalResultsCount > 0 && pixabayOutcome.total === 0) {
            pixabayres = await fetch(pixabayAPIURL + "?key=" + pixabayAPIKey + "&q=" + geonamesOutcome.geonames[0].countryName);
            pixabayOutcome = await pixabayres.json();
            const weatherbitOutcome = null;
            postData(geonamesOutcome, pixabayOutcome, weatherbitOutcome);
        } else if (pixabayOutcome > 0){
            const weatherbitOutcome = null;
            postData(geonamesOutcome, pixabayOutcome, weatherbitOutcome);
        } else {
            alert("Error: The entered city name is incorrect. Please enter a correct city name.");
            return;
        }
    } else {
        check = true;
        const weatherbitOutcome = await weatherbitres.json();
        postData(geonamesOutcome, pixabayOutcome, weatherbitOutcome)
    }
}

/* Function to POST data */
export async function postData(geonamesOutcome, pixabayOutcome, weatherbitOutcome) {
    let startDate = document.getElementById("startdate").value;
    let endDate = document.getElementById("enddate").value;
    let tripLength = (Date.parse(endDate) - Date.parse(startDate)) / (1000*60*60*24);
    let temp, imageIndex, timezone;
    for (imageIndex = 0; imageIndex < pixabayOutcome.hits.length ; imageIndex++) {
        if (pixabayOutcome.hits[imageIndex].imageWidth > pixabayOutcome.hits[imageIndex].imageHeight){
            break;
        }
    }
    console.log(weatherbitOutcome);
    try {
        temp = weatherbitOutcome.data[0].temp;
    } catch (e) {
        temp = null;
    }

    try{
        timezone = weatherbitOutcome.timezone;
    } catch (e) {
        timezone = null;
    }

    let values = {
        lat: geonamesOutcome.geonames[0].lat,
        lng: geonamesOutcome.geonames[0].lng,
        city: geonamesOutcome.geonames[0].name,
        country: geonamesOutcome.geonames[0].countryName,
        countryCode: geonamesOutcome.geonames[0].countryCode,
        timezone: timezone,
        temp: temp,
        image: pixabayOutcome.hits[imageIndex].largeImageURL,
        arrivalDate: startDate,
        departureDate: endDate,
        tripLength: tripLength
    };

    let options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values),
    };

    fetch(localServerURL + 'projectData', options).then((response) => {
        return response.json();
    }).then((result) => {
        getData();
    });
}

/* Function to GET Project Data */
function getData() {
    fetch(localServerURL + 'all').then((response) => {
        return response.json();
    }).then((result) => {
        document.getElementById("image").setAttribute("src", result.image);
        document.getElementById("destination").innerHTML = "Destination: " + removeQuotations(result.city) + ", "
            + removeQuotations(result.country);
        document.getElementById("arrivaldate").innerHTML = "Arrival Date: " + result.arrivalDate;
        document.getElementById("departuredate").innerHTML = "Departure Date: " + result.departureDate;
        document.getElementById("triplength").innerHTML = "Length of trip: " + result.tripLength + " Nights";
        if (result.temp !== null){
            document.getElementById("temp").innerHTML = "Average temperature: " + JSON.stringify(result.temp) + "° C";
        }
        if (!check){
            alert("Note: The image provided below is not necessarily from the entered city, but it is rather from the " +
                "same country of the entered city. That is due to us being unable to find an image of it. Sorry for " +
                "the inconvenience.")
        }
    });
}

export{
    getAPIData,
    getData
};
