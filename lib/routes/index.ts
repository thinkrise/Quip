///<reference path="../../typings/index.d.ts"/>

'use strict';

import * as express from "express";

import * as login from "./login";
import * as profiles from "./profiles";

const router = express.Router();

/**
 * # getLanding
 * 
 * Retrieves the landing page for the app.
 * 
 * @param: req Request object.
 * @param: res Response object.
 */
const getLanding = (req, res) => {
  if (typeof req.user == 'undefined') {
    req.user = false;
  }

  res.render('home', {
    bodyClass: 'home',
    title: 'Quip',
    header: false,
    footer: false
  });
};

router.get('/', getLanding);

router.get('/login', login.getLogin);

router.get('/register', profiles.getRegister);
router.post('/register', profiles.postRegister);

export = router;