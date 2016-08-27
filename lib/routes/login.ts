///<reference path="../../typings/index.d.ts"/>

'use strict';

import * as express from "express";

/**
 * 
 */
const getLogin = (req, res) => {
    if (typeof req.user !== 'undefined') {
        res.redirect('/topics');
    }
    else {
        req.user = false;
    }

    let message = req.flash('error');

    if (message.length < 1) {
        message = false;
    }

    res.render('login', {
        title: 'Login',
        message: message,
        user: req.user
    });
};

/**
 * 
 */
const logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

export { 
    getLogin,
    logout
};