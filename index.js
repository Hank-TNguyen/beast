
const db = require(__dirname + '/db/db_util.js');
const express = require('express');
const app = express();
const path = require('path');
const request = require('request');
const https = require('https');
const fs = require('fs');

// readFileSync function must use __dirname get current directory
// require use ./ refer to current directory.

const key = path.join(__dirname, '/ssl/server.key');
const cert = path.join(__dirname, '/ssl/server.crt');
const ca = path.join(__dirname, '/ssl/server.csr');

const options = {
	key: fs.readFileSync(key, 'utf8'),
	cert: fs.readFileSync(cert, 'utf8'),
	ca: fs.readFileSync(ca, 'utf8')
};


// Create HTTPs server.

var server = https.createServer(options, app);

const port = 3000;
var server = https.createServer(options, app).listen(port, function(){
  	console.log("Express server listening on port " + port);
});

app.use(express.static(__dirname + '/app'))
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/beast', (req, res) => {
	res.sendFile(path.join(__dirname + '/app/index.html'));
});

app.get('/api/findClinic', (req, res) => {
	coords = {latitude: req.query.lat, longitude: req.query.lon};
	findClinic(coords).then(s_req => {
	 	s_req.pipe(res);
		// res.end(body);
	}).catch(err => {
		res.status(500, {
            error: err
        });
	});
});

// the one task ------- 
const findClinic = ((coords) => {
	console.log("FIND CLINIC: HIT");
	coords = coords || {latitude: 43.803559899999, longitude: -79.2114642};
	// query clinics from database 
	
	const service = new Promise((resolve, reject) => {
		db.serialize(() => {
			db.all("SELECT id, lat, lon from clinic_location;", (err, rows) => {
				if (err) {
					reject(err);
				}
				resolve(rows);
			});
		});
	}).then((rows) => {
		var options_google_request = {
		    url: 'https://maps.googleapis.com/maps/api/distancematrix/json?key=',
		    options
		};

		options_google_request.url += process.env.google_api_key;
		options_google_request.url += "&origins=" + coords.latitude + ',' + coords.longitude + '&destinations=';
		let dest = '';
		rows.forEach(row => {
			dest += row.lat + ',' + row.lon + '|';
		});
		dest = dest.substr(0, dest.length - 1);
		options_google_request.url += dest;
		console.log(options_google_request.url);
		return request.get(options_google_request);
	}).catch(err => {
		console.log(err);
		return err;
	});
	
	return service;
});
 