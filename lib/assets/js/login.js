(function () {
  'use strict';

  var log = require('./log');

  log.info('Initialising login.');
  var form = document.getElementById('login-form');

  form.onsubmit = function (event) {
    // stop the regular form submission
    event.preventDefault();
    var button = document.getElementById('submit');
    var identityInput = document.getElementById('identity');

    button.disabled = true;
    identityInput.disabled = true;

    var statusPanel = document.getElementById('status');

    // collect the form data while iterating over the inputs
    var data = {};
    for (var i = 0, ii = form.length; i < ii; ++i) {
      var input = form[i];
      if (input.name) {
        data[input.name] = btoa(encode_utf8(input.value));
      }
    }

    // construct an HTTP request
    var xhr = new XMLHttpRequest();
    xhr.open(form.method, '/login', true, 'testadmin', 'password');
    xhr.setRequestHeader("Authorization", "Basic " + btoa('testadmin' + ":" + 'password'));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) { // `DONE`
        status = xhr.status;
        if (status == 200) {
          var response = JSON.parse(xhr.responseText);
          if ((response.error === null) || (response.error === undefined)) {
            document.getElementById('status-text').innerHTML = response.success;
            statusPanel.classList.add('message');
            window.location.replace('./topics');
          } else {
            document.getElementById('status-text').innerHTML = response.error;
            statusPanel.classList.add('error');
          }

          identityInput.disabled = false;
          button.disabled = false;

          //successHandler && successHandler(data);
        } else {
          //errorHandler && errorHandler(status);
        }
      }
    };

    var json = JSON.stringify(data);
    log.info(json);
    // send the collected data as JSON
    xhr.send(json);

    xhr.onloadend = function () {
      // done
    };
  };

  function encode_utf8( s ) {
    return unescape( encodeURIComponent( s ) );
  }

  function decode_utf8( s ) {
    return decodeURIComponent( escape( s ) );
  }
}
());
