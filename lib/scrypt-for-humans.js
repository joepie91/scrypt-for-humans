var Promise, defaultParameters, errors, getDefaultParameters, normalizePassword, scrypt, scryptErrorMap, scryptHandler;

scrypt = require("scrypt");

errors = require("errors");

Promise = require("bluebird");

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

scryptErrorMap = {
  "getrlimit or sysctl(hw.usermem) failed": 1,
  "clock_getres or clock_gettime failed": 2,
  "error computing derived key": 3,
  "could not read salt from /dev/urandom": 4,
  "error in OpenSSL": 5,
  "malloc failed": 6,
  "data is not a valid scrypt-encrypted block": 7,
  "unrecognized scrypt format": 8,
  "decrypting file would take too much memory": 9,
  "decrypting file would take too long": 10,
  "password is incorrect": 11,
  "error writing output file": 12,
  "error reading input file": 13,
  "error unkown": -1
};

defaultParameters = Promise.promisify(scrypt.params)(0.1, void 0, void 0);

getDefaultParameters = function(params) {
  if (params != null) {
    return params;
  } else {
    return defaultParameters;
  }
};

normalizePassword = function(password) {
  if (Buffer.isBuffer(password)) {
    return password;
  } else {
    return new Buffer(password);
  }
};

scryptHandler = function(resolve, reject) {
  return function(err, result) {
    var errorObj;
    if (err != null) {
      errorObj = (function() {
        var _ref;
        switch ((_ref = scryptErrorMap[err.message]) != null ? _ref : -1) {
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
          case -1:
            return errors.ScryptInternalError;
          case 7:
          case 8:
            return errors.ScryptInputError;
          case 11:
            return errors.ScryptPasswordError;
        }
      })();
      return reject(new errorObj(err.message));
    } else if (result === true) {
      return resolve(result);
    } else if (result === false) {
      return reject(new errors.ScryptPasswordError("The password did not match."));
    } else {
      return resolve(result.toString("base64"));
    }
  };
};

module.exports = {
  hash: function(password, options, callback) {
    if (options == null) {
      options = {};
    }
    return Promise["try"](function() {
      return getDefaultParameters(options.params);
    }).then(function(parameters) {
      return new Promise(function(resolve, reject) {
        return scrypt.kdf(normalizePassword(password), parameters, scryptHandler(resolve, reject));
      });
    }).nodeify(callback);
  },
  verifyHash: function(password, hash, callback) {
    return (new Promise(function(resolve, reject) {
      var hashBuffer;
      hashBuffer = new Buffer(hash, "base64");
      return scrypt.verifyKdf(hashBuffer, normalizePassword(password), scryptHandler(resolve, reject));
    })).nodeify(callback);
  },
  ScryptError: errors.ScryptError,
  InputError: errors.ScryptInputError,
  PasswordError: errors.ScryptPasswordError,
  InternalError: errors.ScryptInternalError,
  scryptLib: scrypt
};
