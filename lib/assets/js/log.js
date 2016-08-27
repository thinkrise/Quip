(function () {
  'use strict';
  var info = function(content) {
    console.log('INFO: ' + content);
  };

  var warn = function(content) {
    console.log('WARNING: ' + content);
  };

  var error = function(content) {
    console.log('ERROR: ' + content);
  };

  module.exports = {
    info: info,
    warn: warn,
    error: error
  };
}());
