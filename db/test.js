const db = require("./db_util.js");

db.serialize(function() {
	db.each("SELECT * from clinic_location;", function(err, row) {
		console.log(row);
	});
});
 
db.close(); 