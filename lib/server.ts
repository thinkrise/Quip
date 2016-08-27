/// <reference path="../typings/index.d.ts"/>

"use strict";

import * as http from "http";
import * as url from "url";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";

import { User } from "./models/user";

let app = express();

const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const server = require('http').createServer(app);
const passport = require('passport');
const flash = require('connect-flash');
const hbs = require('express-hbs');
const local = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const io = require('socket.io').listen(server);
const util = require('util');
const errorHandler = require('errorhandler');

//const User = require('../models/user').User;

const db = require('./db');
const log = require('./logging');

// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 6393;

if (process.env.NODE_ENV == 'development') {
    process.env.DEBUG = 'express:*';
    app.use(errorHandler());
}
else {
    // TODO: handle middleware for error handling. i.e.: app.use(errorHandler());
}

const start = () => {
    app.use('/resources', express.static(path.join(__dirname, '../.static')));
    app.use(cookieParser());
    app.engine('svg', hbs.express4({}));
    app.engine('xhtml', hbs.express4({
        partialsDir: path.join(__dirname, '/views/parts'),
        layoutsDir: path.join(__dirname, '/views/layouts'),
        defaultLayout: path.join(__dirname, '/views/layouts/master.xhtml'),
        extname: 'xhtml'
    }));
    app.set('port', process.env.PORT);
    app.set('view engine', 'xhtml');
    app.set('views', __dirname + '/views');
    app.set('x-powered-by', 'Coffee');
    app.set('Content-Type', 'application/xhtml+xml; charset=utf-8');

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.use(expressSession({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    passport.use(new local(
        (username, password, done) => {
            // asynchronous verification, for effect...
            process.nextTick(() => {
                let validateUser = (err, user) => {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false, { message: 'Unknown user: ' + username }) }

                    if (bcrypt.compareSync(password, user.password)) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, { message: 'Invalid username or password' });
                    }
                };

                db.findUserByEmail(username, validateUser);
            });
        }
    ));

    passport.serializeUser((user, done) => {
        log.debug("[DEBUG][passport][serializeUser] %j", user);
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        db.findUserById(id, done);
    });

    /**
    * Standard middleware to set the correct Content Type of the documents rendered
    *
    * Use res.setHeader for JSON-specific end-points
    */
    app.use((req, res, next) => {
        res.setHeader('Content-Type', 'application/xhtml+xml; charset=utf-8');
        next();
    });

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
        function (req, res) {
            res.redirect('/topics');
        }
    );

    app.use('/', require("./routes"));

    let usersonline = <User>{};

    io.sockets.on('connection', (socket) => {
        let connected_user: User;

        let i = setInterval(() => {
            socket.emit('whoshere', { 'users': usersonline });
        }, 3000);

        log.debug("[DEBUG][io.sockets][connection]");

        socket.on('iamhere', (data) => {
            log.debug("[DEBUG][io.sockets][iamhere] %s", data);

            db.findUserByIdentity(data, (err, user) => {
                log.debug("[DEBUG][iamhere] %s -> {%j, %j}", data, err, user);

                if (user !== null) {
                    connected_user = user;

                    usersonline[connected_user.identity] = {
                        identity: connected_user.identity,
                        name: connected_user.name
                    };
                }
            })
        });

        socket.on('message', (data) => {
            if (connected_user.identity === undefined) {
                log.warn("[WARN][io.sockets][message] Got message before iamehere {%s}", util.inspect(data));
                socket.emit('new message', { message: '<em>You must log in before chatting. That\'s the rule</em>' });

                return;
            }

            let msg = {
                message: data.message,
                from: connected_user.name,
                timestamp: new Date().getTime()
            };

            log.debug("[DEBUG][io.sockets][message] New message '%j' from user %s(@%s)", msg, connected_user.identity, connected_user.name);

            db.saveMessage(msg, (err, saved) => {
                if (err || !saved) {
                    socket.emit('new message', { message: util.format("<em>There was an error saving your message (%s)</em>", msg.message), from: msg.from, timestamp: msg.timestamp });

                    return;
                }
                socket.emit('new message', msg);

                socket.broadcast.emit('new message', msg);
            });
        });

        db.findMessages(10, (err, messages) => {
            if (!err && messages.length > 0) {
                socket.emit('history', messages);
            }
        });

        socket.on('disconnect', () => {
            if (connected_user.identity !== undefined) {
                delete usersonline[connected_user.identity];

                log.debug("[DEBUG][io.sockets][disconnect] user: %s(@%s) disconnected", connected_user.identity, connected_user.name);
            }
            else {
                log.debug("[WARN][io.sockets][disconnect] Received disconnect message from another univers");
            }
        });
    });

    server.listen(app.get('port'), () => {
        log.info("Quip started on port: " + app.get('port'));
    });
};

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
};

const validateEmail = (email) => {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
};

const stop = () => {
    server.close(() => {
        log.info("Quip stopped.");
    });

    return {
        ok: true
    };
};

export {
    start,
    stop
};