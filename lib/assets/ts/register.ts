///<reference path="../../../typings/index.d.ts"/>

'use strict';

import * as log from './logging';

import * as Socket from './socket';

let socket;

namespace Register {
    class Registration {
        constructor() {
            log.info('Initialising registration.');
            socket = new Socket.Socket();

            let form = document.getElementById('register-form');

            form.onsubmit = (event) => {
                // stop the regular form submission.
                event.preventDefault();
                let button = <HTMLInputElement>document.getElementById('submit');
                let identityInput = <HTMLInputElement>document.getElementById('identity');

                button.disabled = true;
                identityInput.disabled = true;

                let statusPanel = document.getElementById('status');

                // collect the form data while iterating over the inputs.
                let data = {};

                for (let i = 0, ii = (<HTMLFormElement>form).length; i < ii; ++i) {
                    let input = <HTMLInputElement>form[i];

                    if (input.name) {
                        data[input.name] = btoa(this.encode_utf8(input.value));
                    }
                }

                // construct an HTTP request.
                let xhr = new XMLHttpRequest();
                xhr.open((<HTMLFormElement>form).method, '/register', true, 'testadmin', 'password');
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa('testadmin' + ":" + 'password'));
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onreadystatechange = () => {
                    
                    if (xhr.readyState == 4) {
                        let status = xhr.status;

                        if (status == 200) {
                            let response = JSON.parse(xhr.responseText);

                            if ((response.error === null) || (response.error === undefined)) {
                                document.getElementById('status-text').innerHTML = response.success;
                                statusPanel.classList.add('message');
                                this.getLoginView();
                            }
                            else {
                                document.getElementById('status-text').innerHTML = response.error;
                                statusPanel.classList.add('error');
                            }

                            identityInput.disabled = false;
                            button.disabled = false;
                        }
                        else {

                        }
                    }
                };

                let json = JSON.stringify(data);
                log.info(json);

                xhr.send(json);

                xhr.onloadend = () => {
                    // done.
                };
            };
        }

        getLoginView() {
            let xhr = new XMLHttpRequest();

            xhr.open('GET', '/login', true, 'testadmin', 'password');
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa('testadmin' + ':' + 'password'));
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    let status = xhr.status;

                    if (status == 200) {
                        let bodyElement = document.querySelector('body');
                        let xmlDoc = xhr.responseXML;
                        let containerElement = xmlDoc.querySelector('body');
                        let title = xmlDoc.title;

                        window.history.pushState({ 'html': document.body.outerHTML, 'pageTitle': xmlDoc.title }, '', '/login');
                        (<HTMLElement>bodyElement).outerHTML = containerElement.outerHTML;
                        document.title = xmlDoc.title;
                    }
                    else {

                    }
                }
            };

            xhr.send();
        };

        encode_utf8(s) {
            return decodeURI(encodeURIComponent(s));
        }

        decode_utf8(s) {
            return decodeURIComponent(encodeURI(s));
        }
    }

    let regist = new Registration();
}