scrypt = require "scrypt"
errors = require "errors"
Promise = require "bluebird"

# Scrypt input/output format configuration
# FIXME: Figure out how to isolate this, so that there is a guarantee these changes won't affect any other `scrypt` imports outside of the module.
scrypt.hash.config.keyEncoding = "utf8"
scrypt.hash.config.outputEncoding = "base64"
scrypt.verify.config.keyEncoding = "utf8"
scrypt.verify.config.hashEncoding = "base64"

# Some custom error types, since the `scrypt` library doesn't have proper error handling
errors.create name: "ScryptError"
errors.create {name: "ScryptInputError", parents: errors.ScryptError}
errors.create {name: "ScryptPasswordError", parents: errors.ScryptError}
errors.create {name: "ScryptInternalError", parents: errors.ScryptError}


scryptHandler = (resolve, reject) ->
	# This is ridiculous, but `scrypt` doesn't have proper error-handling facilities...
	return (err, result) ->
		if err?
			errorObj = switch err.scrypt_err_code
				when 1, 2, 3, 4, 5, 6, 9, 10, 12, 13 then errors.ScryptInternalError
				when 7, 8 then errors.ScryptInputError
				when 11 then errors.ScryptPasswordError
			reject new errorObj(err.scrypt_err_message)
		else
			resolve result


module.exports =
	hash: (password, options = {}, callback) ->
		(new Promise (resolve, reject) ->
			options.params ?= scrypt.params(0.1)
			scrypt.hash password, options.params, scryptHandler(resolve, reject)
		).nodeify(callback)
	verifyHash: (password, hash, callback) ->
		(new Promise (resolve, reject) ->
			scrypt.verify hash, password, scryptHandler(resolve, reject)
		).nodeify(callback)
	ScryptError: errors.ScryptError
	InputError: errors.ScryptInputError
	PasswordError: errors.ScryptPasswordError
	InternalError: errors.ScryptInternalError
	scryptLib: scrypt
