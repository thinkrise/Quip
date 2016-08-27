///<reference path="../../typings/index.d.ts"/>

'use strict';

import * as db from "../db";
import * as log from "../logging";

import { User } from "../models/user";

const bcrypt = require('bcrypt');

const getProfile = (req, res) => {
    res.render('profile', { user: req.user, title: 'My account' });
};

const getProfileByIdentity = (req, res) => {
    let identity = req.params.identity;

    db.findPlayerByIdentity(identity, (err, user) => {
        // TODO: log.debug("[DEBUG][/profile/identity] %s -> {%j, %j}", identity, err, user);

        if (err) {
            res.send(500);
            
            return;
        }

        if (user === null) {
            res.send(404);
        }
        else {
            res.render('profile', { seeUser: user, title: user.identity, user: req.user });
        }
    });
};

const getRegister = (req, res) => {
    if (typeof req.user !== 'undefined') {
        res.redirect('/profile');
    }
    else {
        req.user = false;
    }

    let message = req.flash('error');

    if (message.length < 1) {
        message = false;
    }

    res.render('register', { title: 'Register', message: message, user: req.user });
};

const postRegister = (req, res) => {
    if (typeof req.user !== 'undefined') {
        res.redirect('/account');
        return;
    }

    if (!validateEmail(req.param('email'))) {
        req.flash('error', 'Not a valid email address!');
        res.redirect('/register');

        return;
    }

    if (req.param('password') !== req.param('password2')) {
        req.flash('error', 'Passwords do not match!');
        res.redirect('/register');

        return;
    }

    db.saveUser({
        identity: req.param('email'),
        name: req.param('name'),
        secret: bcrypt.hashSync(req.param('password'), 8)
    }, (err, saved) => {
        // TODO: log.debug("[DEBUG][/register][saveUser] %s", saved);

        if (err) {
            req.flash('error', 'There was an error creating the account. Please try again later.');
            res.redirect('/register');

            return;
        }

        if (saved) {
            log.debug("[DEBUG][/register][saveUser] /topics");
            res.redirect('/topics');
        }
        else {
            req.flash('error', 'The account wasn\'t created');
            res.redirect('/register');
            log.debug("[DEBUG][/register][saveUser] /register");
        }

        return;
    });
};

const validateEmail = (email) => {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
}

export {
    getProfile,
    getProfileByIdentity,
    getRegister,
    postRegister
}