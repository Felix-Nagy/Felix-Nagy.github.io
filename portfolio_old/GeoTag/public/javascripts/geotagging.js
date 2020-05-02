/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "YOUR_API_KEY_HERE";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function() {
            var lonInput = document.getElementById("lon-input");
            var latInput = document.getElementById("lat-input");

            var onSuccessCallback = function(position) {

                var lonHidden = document.getElementById("lon-hidden");
                var latHidden = document.getElementById("lat-hidden");

                var longitude = getLongitude(position);
                var latitude = getLatitude(position);

                lonInput.value = longitude;
                latInput.value = latitude;

                lonHidden.value = longitude;
                latHidden.value = latitude;
            };

            if (lonInput.value === '' || latInput.value === '')
                tryLocate(onSuccessCallback, function(msg) { alert(msg) });
        }
    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

function GeoTag(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}

/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(document).ready(function() {
    var applyBtn = document.getElementById("apply-btn");
    var removeBtn = document.getElementById("remove-btn");
    var submitBtn = document.getElementById("submit-btn");

    var getGeoTags = function () {
        var searchInput = document.getElementById("search-input");

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                document.getElementById("results").innerHTML = '';
                
                var geoTagArray = JSON.parse(this.responseText);
                geoTagArray.forEach(function(geoTag) {
                    document.getElementById("results").innerHTML +=
                        '<li>' +
                        geoTag.name +
                        " (" + geoTag.latitude + ", " + geoTag.longitude + ") " +
                        geoTag.hashtag +
                        '</li>'
                });
            }
        };
        var queryParameter = searchInput.value.trim() !== '' ? "/?name=" + searchInput.value.trim() : "";
        xhttp.open("GET", "/geotags" + queryParameter, true);
        xhttp.send();
    };

    applyBtn.addEventListener("click", function() {
        getGeoTags();
    });

    removeBtn.addEventListener("click", function() {
        var searchInput = document.getElementById("search-input");
        searchInput.value = '';

        getGeoTags();
    });

    submitBtn.addEventListener("click", function() {
        var lonInput = document.getElementById("lon-input");
        var latInput = document.getElementById("lat-input");
        var nameInput = document.getElementById("name-input");
        var hashtagInput = document.getElementById("hashtag-input");

        var geoTag = new GeoTag(lonInput.value, latInput.value,
            nameInput.value, hashtagInput.value);

        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/geotags", true);
        xhttp.setRequestHeader('Content-type', 'application/json')
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 201) {
                nameInput.value = '';
                hashtagInput.value = '';

                getGeoTags();
            }
        };
        xhttp.send(JSON.stringify(geoTag));
    });

    gtaLocator.updateLocation();
});