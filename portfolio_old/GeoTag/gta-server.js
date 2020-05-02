/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

app.use(express.static('public'));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

function GeoTag(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

var geoTagMemory = (function GeoTagMemory() {

    var geoTags = [];

    return {
        lastSubmittedLatitude : 0,
        lastSubmittedLongitude: 0,
        getById: function (id) {
            return geoTags[id];
        },
        addGeoTag: function (geoTag) {
            geoTags.push(geoTag);
        },
        deleteById: function (id) {
            return geoTags.splice(id, 1);
        },
        searchByName:  function (name) {
            return geoTags.filter(geoTag => geoTag.name === name);
        },
        searchInArea: function (lat, lon, radius) {
            var result = [];

            geoTags.forEach(function(geoTag) {
                    var distance = Math.sqrt(
                        Math.pow(lat - geoTag.latitude, 2) +
                        Math.pow(lon - geoTag.longitude, 2)
                    );

                    if (distance <= radius)
                        result.push(geoTag);
                }
            );

            return result;
        },
        toString: function() {
            return JSON.stringify(geoTags);
        }
    }
})();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: [],
        coords: {
            latitude: '',
            longitude: ''
        }
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

const STANDARD_RADIUS = 100;
app.post('/tagging', function(req, res) {
    var lat = req.body.latitude;
    var lon = req.body.longitude;

    var geoTag = new GeoTag(
        lat,
        lon,
        req.body.name,
        req.body.hashtag
    );
    geoTagMemory.addGeoTag(geoTag);

    res.render('gta', {
        taglist: geoTagMemory.searchInArea(lat, lon, STANDARD_RADIUS),
        coords: {
            latitude: lat,
            longitude: lon
        }
    });
});

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

app.post('/discovery', function(req, res) {
    var lat = req.body.latitude;
    var lon = req.body.longitude;
    var term = req.body.search;

    var resultTagList;
    if (term)
        resultTagList = geoTagMemory.searchByName(term);
    else
        resultTagList = geoTagMemory.searchInArea(lat, lon, STANDARD_RADIUS);

    res.render('gta', {
        taglist: resultTagList,
        coords: {
            latitude: lat,
            longitude: lon
        }
    });
});


/***
 * REST-API
 */
app.use(bodyParser.json());
var url = require('url');

var geoTagSearch = function(req, res) {
    var query = url.parse(req.url, true).query;
    var name = (query["name"] !== undefined) ? query["name"] : '';
    var radius = (query["radius"] !== undefined) ? query["radius"] : STANDARD_RADIUS;

    var resultTagList;
    if (name) {
        resultTagList = geoTagMemory.searchByName(name);
    }
    else {
        resultTagList = geoTagMemory.searchInArea(
            geoTagMemory.lastSubmittedLatitude,
            geoTagMemory.lastSubmittedLongitude,
            radius
        );
    }
    res.send(JSON.stringify(resultTagList));
};

var addGeoTag = function (req, res) {
    var lat = req.body.latitude;
    var lon = req.body.longitude;

    geoTagMemory.lastSubmittedLatitude = lat;
    geoTagMemory.lastSubmittedLongitude = lon;

    var geoTag = new GeoTag(
        lat,
        lon,
        req.body.name,
        req.body.hashtag
    );
    geoTagMemory.addGeoTag(geoTag);
    res.sendStatus(201);
};

var getGeoTag = function (req, res) {
    var geoTag = geoTagMemory.getById(req.params.id);
    res.send(JSON.stringify(geoTag));
};

var putGeoTag = function (req, res) {
    var geoTag = geoTagMemory.getById(req.params.id);

    geoTag.name = req.body.name;
    geoTag.hashtag = req.body.hashtag;
    geoTag.longitude = req.body.longitude;
    geoTag.latitude = req.body.latitude;

    // zur Demonstration alle GeoTags ausgeben
    res.send(geoTagMemory.toString());
};

var deleteGeoTag = function (req, res) {
    geoTagMemory.deleteById(req.params.id);

    // zur Demonstration alle GeoTags ausgeben
    res.send(geoTagMemory.toString());
};

app.route('/geotags')
    .get(geoTagSearch)
    .post(addGeoTag);

app.route('/geotags/:id')
    .get(getGeoTag)
    .put(putGeoTag)
    .delete(deleteGeoTag);


/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
