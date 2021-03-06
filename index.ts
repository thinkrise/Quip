///<reference path="./typings/index.d.ts"/>

'use strict';

const log = require('./lib/logging');
const server = require('./lib/server');

// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const start = (options) => {
    options = options || {};

    log.info('Initiating Quip client.');
    log.debug('Starting in ' + process.env.NODE_ENV + ' mode.');

    server.start(options);
};

const stop = () => {
    log.info('Stopping Quip.');
    server.stop();
    process.exit(0);
};

if (process.platform === "win32") {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.on("SIGINT", () => {
        process.emit("SIGINT");
    });
}

process.on('SIGTERM', () => {
    log.warn('SIGTERM detected.');
    stop();
});

process.on('SIGINT', () => {
    log.warn('SIGINT detected.');
    stop();
});

start(null);

export {
    start as start,
    stop as stop
};