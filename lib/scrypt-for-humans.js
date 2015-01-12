var Promise, errors, scrypt, scryptHandler;

scrypt = require("scrypt");

errors = require("errors");

Promise = require("bluebird");

scrypt.hash.config.keyEncoding = "utf8";

scrypt.hash.config.outputEncoding = "base64";

scrypt.verify.config.keyEncoding = "utf8";

scrypt.verify.config.hashEncoding = "base64";

errors.create({
  name: "ScryptError"
});

errors.create({
  name: "ScryptInputError",
  parents: errors.ScryptError
});

errors.create({
  name: "ScryptPasswordError",
  parents: errors.ScryptError
});

errors.create({
  name: "ScryptInternalError",
  parents: errors.ScryptError
});

scryptHandler = function(resolve, reject) {
  return function(err, result) {
    var errorObj;
    if (err != null) {
      errorObj = (function() {
        switch (err.scrypt_err_code) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 9:
          case 10:
          case 12:
          case 13:
            return errors.ScryptInternalError;
          case 7:
          case 8:
            return errors.ScryptInputError;
          case 11:
            return errors.ScryptPasswordError;
        }
      })();
      return reject(new errorObj(err.scrypt_err_message));
    } else {
      return resolve(result);
    }
  };
};

module.exports = {
  hash: function(password, options, callback) {
    if (options == null) {
      options = {};
    }
    return (new Promise(function(resolve, reject) {
      if (options.params == null) {
        options.params = scrypt.params(0.1);
      }
      return scrypt.hash(password, options.params, scryptHandler(resolve, reject));
    })).nodeify(callback);
  },
  verifyHash: function(password, hash, callback) {
    return (new Promise(function(resolve, reject) {
      return scrypt.verify(hash, password, scryptHandler(resolve, reject));
    })).nodeify(callback);
  },
  ScryptError: errors.ScryptError,
  InputError: errors.ScryptInputError,
  PasswordError: errors.ScryptPasswordError,
  InternalError: errors.ScryptInternalError,
  scryptLib: scrypt
};
