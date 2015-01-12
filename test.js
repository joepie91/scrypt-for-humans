scrypt = require("./");
Promise = require("bluebird");

/* Using Promises */

var theHash;

Promise.try(function(){
	return scrypt.hash("secretpassword");
}).then(function(hash){
	console.log("The hash is " + hash);
	theHash = hash;

	/* Now let's see if it verifies - number 1 is correct. */
	return scrypt.verifyHash("secretpassword", theHash);
}).then(function(){
	console.log("Number 1 was correct!");
}).catch(scrypt.PasswordError, function(err){
	console.log("Number 1 was wrong!");
}).then(function(){
	/* And let's see if it fails correctly - number 2 is wrong. */
	return scrypt.verifyHash("wrongpassword", theHash);
}).then(function(){
	console.log("Number 2 was correct!");
}).catch(scrypt.PasswordError, function(err){
	console.log("Number 2 was wrong!");
});

/* Using nodebacks */

scrypt.hash("secretpassword", {}, function(err, hash){
	console.log("The hash is " + hash);

	/* Now let's see if it verifies - number 1 is correct. */
	scrypt.verifyHash("secretpassword", hash, function(err, result){
		if(err) {
			console.log("Number 1 was wrong!", err);
		} else {
			console.log("Number 1 was correct!");
		}

		/* And let's see if it fails correctly - number 2 is wrong. */
		scrypt.verifyHash("wrongpassword", hash, function(err, result){
			if(err) {
				console.log("Number 2 was wrong!", err);
			} else {
				console.log("Number 2 was correct!");
			}
		});
	});
});
