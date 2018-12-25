// https://www.w3schools.com/html/html5_geolocation.asp
function getLocation() {
	console.log("hit");
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(findCloseByClinics);
	} else {
		console.log("Geolocation is not supported by this browser.");
	}
}

function findCloseByClinics(position) {
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			// Typical action to be performed when the document is ready:
			res = JSON.parse(xhr.responseText);
			console.log(res);
			dests = res.destination_addresses;
			dists = res.rows[0].elements.map(e => e && e.distance && e.distance.value);
			tuple = []
			for (i = 0; i < dests.length; i++) {
				tuple.push({dist: dists[i], dest: dests[i]})
			}
			tuple.sort((a, b) => a.dist < b.dist);

			for (i = 1; i <= dests.length; i++) {
				console.log(i);
				document.getElementById("demo-" + i).innerHTML = JSON.stringify(tuple[i-1]);
			}
	    }
	};

	coords = "lat=" + position.coords.latitude + '&lon=' + position.coords.longitude;
	xhr.open("GET", "/api/findClinic?" + coords, true);
	xhr.send();
}

function clear_res() {
	document.getElementById("demo").innerHTML = '';	
}
