# scrypt-for-humans

A human-friendly API wrapper for the Node.js Scrypt bindings, because the default bindings kind of suck.

This module will change and do the following things for you:

* Input values (passwords, usually) are expected in utf-8.
* Output/hash values are base64-encoded, and can be stored directly in your data store of choice.
* Scrypt parameters are set to `scrypt.params(0.1)`, this can be overridden on a per-hash basis (see API documentation below).
* Scrypt errors, which are now proper Error types in the original library but still not easily distinguishable, are caught and rethrown as one of three correctly-inheriting Error types (see API documentation below). This means you can handle them like any other kind of Error.

The API supports both Promises and nodebacks.

## License

[WTFPL](http://www.wtfpl.net/txt/copying/) or [CC0](https://creativecommons.org/publicdomain/zero/1.0/), whichever you prefer.

## Donate

My income consists entirely of donations for my projects. If this module is useful to you, consider [making a donation](http://cryto.net/~joepie91/donate.html)!

You can donate using Bitcoin, PayPal, Gratipay, Flattr, cash-in-mail, SEPA transfers, and pretty much anything else.

## Contributing

Pull requests welcome. Please make sure your modifications are in line with the overall code style, and ensure that you're editing the `.coffee` files, not the `.js` files.

As this module could potentially deal with authentication, tests are needed; a pull request for those would be especially welcome.

Build tool of choice is `gulp`; simply run `gulp` while developing, and it will watch for changes.

Be aware that by making a pull request, you agree to release your modifications under the licenses stated above.

## Usage

```javascript
var scrypt = require("scrypt-for-humans");
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
```

## Upgrading to 2.0.0

Due to changes in the underlying `scrypt` library, there has been a minor indirect change in our documented API as well. Specifically, `scrypt.scryptLib.params` is now asynchronous by default, with (poor) support for ES6 Promises. The new documentation can be found [here](https://github.com/barrysteyn/node-scrypt/blob/master/Readme.md#params). Due to its inconsistent behaviour, I recommend manual promisification using [Bluebird](https://www.npmjs.com/package/bluebird) or [`es6-promisify`](https://www.npmjs.com/package/es6-promisify).

The other changes in `scrypt` do not affect the `scrypt-for-humans` API, other than introducing support for Node.js 4. If you were not using custom `params`, you can remain using `scrypt-for-humans` like you have done previously.

## API

### scrypt.hash(input, [options, [callback]])

Creates a hash.

* __input__: The input to hash, usually a password.
* __options__: *Optional.* Custom options.
	* __options.params__: Sets the Scrypt parameters to use. Defaults to `scrypt.params(0.1)`. If you want to change these, you'll probably need `scrypt.scryptLib` (documented below).
* __callback__: *Optional.* A nodeback to call upon completion. If omitted, the function will return a Promise.

If this is successful, the hash is returned as either the resolved Promise value or the second callback parameter, depending on the API you use.

If an error occurs, either the Promise will reject with it, or it will be passed as the first callback parameter, depending on the API you use. All errors correctly inherit from `Error`, and are documented below.

### scrypt.verifyHash(input, hash, [callback])

Verifies an input against a hash.

* __input__: The input to hash, usually a password.
* __hash__: The hash to verify against, in base64 encoding (the default output format of `scrypt.hash`).
* __callback__: *Optional.* A nodeback to call upon completion. If omitted, the function will return a Promise.

If the input is correct and matches the hash, the Promise will resolve or the callback will be called with `true` as the value.

__If the input does *not* match the hash, this is considered a PasswordError, *not* a `false` value!__

If an error occurs, either the Promise will reject with it, or it will be passed as the first callback parameter, depending on the API you use. All errors correctly inherit from `Error`, and are documented below.

### scrypt.PasswordError

This error is thrown if the input did not match the specified hash. The original error message is retained.

### scrypt.InputError

This error is thrown if there is a different problem with the input (either the to-be-hashed value, or the hash), such as a malformed hash. The original error message is retained.

### scrypt.InternalError

This error is thrown when an internal error of some other kind occurs in the `scrypt` library. The original error message is retained.

### scrypt.scryptLib

Provides access to the underlying `scrypt` library that is used. Useful if you want to eg. specify custom Scrypt parameters.

## Changelog

### v1.0.0

Initial release.
