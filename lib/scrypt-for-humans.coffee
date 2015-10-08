scrypt = require "scrypt"
errors = require "errors"
Promise = require "bluebird"

# Some custom error types, since the `scrypt` library doesn't have proper error handling
errors.create name: "ScryptError"
errors.create {name: "ScryptInputError", parents: errors.ScryptError}
errors.create {name: "ScryptPasswordError", parents: errors.ScryptError}
errors.create {name: "ScryptInternalError", parents: errors.ScryptError}

scryptErrorMap = {
	"getrlimit or sysctl(hw.usermem) failed": 1
	"clock_getres or clock_gettime failed": 2
	"error computing derived key": 3
	"could not read salt from /dev/urandom": 4
	"error in OpenSSL": 5
	"malloc failed": 6
	"data is not a valid scrypt-encrypted block": 7
	"unrecognized scrypt format": 8
	"decrypting file would take too much memory": 9
	"decrypting file would take too long": 10
	"password is incorrect": 11
	"error writing output file": 12
	"error reading input file": 13
	"error unkown": -1
}

defaultParameters = Promise.promisify(scrypt.params)(0.1, undefined, undefined)

getDefaultParameters = (params) ->
	# This wrapper function is to ensure that we only calculate the parameters once, but can still skip waiting for that if custom parameters were passed in anyway.
	if params?
		return params
	else
		return defaultParameters

normalizePassword = (password) ->
	if Buffer.isBuffer(password)
		return password
	else
		return new Buffer(password)

scryptHandler = (resolve, reject) ->
	# Well, `scrypt` now returns real Error objects. Except now they don't have error codes anymore...
	return (err, result) ->
		if err?
			errorObj = switch (scryptErrorMap[err.message] ? -1)
				when 1, 2, 3, 4, 5, 6, 9, 10, 12, 13, -1 then errors.ScryptInternalError
				when 7, 8 then errors.ScryptInputError
				when 11 then errors.ScryptPasswordError
			reject new errorObj(err.message)
		else if result == true
			resolve result
		else if result == false
			reject new errors.ScryptPasswordError("The password did not match.")
		else
			resolve result.toString("base64")

module.exports =
	hash: (password, options = {}, callback) ->
		# We will still manually promisify, because the behaviour of `scrypt` is not predictable. It may either synchronously throw an error or return a Promise, depending on available ECMAScript features...
		Promise.try ->
			getDefaultParameters(options.params)
		.then (parameters) ->
			new Promise (resolve, reject) ->
				scrypt.kdf normalizePassword(password), parameters, scryptHandler(resolve, reject)
		.nodeify(callback)

	verifyHash: (password, hash, callback) ->
		(new Promise (resolve, reject) ->
			hashBuffer = new Buffer(hash, "base64")
			scrypt.verifyKdf hashBuffer, normalizePassword(password), scryptHandler(resolve, reject)
		).nodeify(callback)

	ScryptError: errors.ScryptError
	InputError: errors.ScryptInputError
	PasswordError: errors.ScryptPasswordError
	InternalError: errors.ScryptInternalError

	scryptLib: scrypt
