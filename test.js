var scrypt = require("./");
var Promise = require("bluebird");

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
	console.log("Number 2 was wrong!", err);
}).then(function(){
	return scrypt.verifyHash("secretpassword", "c2NyeXB0AAwAAAAIAAAAAT8rdRZx8U1zzOnl0kor8x0MJK0SjXT277JgNYPWTzUiCchRWnTffPE23ZB8PwPDA4ckcSlDrNnrxMyH2fN2iMYbYS5sTnPHl2qLKgsiLsGr");
}).then(function(){
	console.log("Known-good hash was correct!");
}).catch(scrypt.PasswordError, function(err){
	console.log("Known-good hash was wrong!", err);
}).then(function(){
	return scrypt.verifyHash("wrongpassword", "c2NyeXB0AAwAAAAIAAAAAT8rdRZx8U1zzOnl0kor8x0MJK0SjXT277JgNYPWTzUiCchRWnTffPE23ZB8PwPDA4ckcSlDrNnrxMyH2fN2iMYbYS5sTnPHl2qLKgsiLsGr");
}).then(function(){
	console.log("Known-bad hash was correct!");
}).catch(scrypt.PasswordError, function(err){
	console.log("Known-bad hash was wrong!", err);
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
