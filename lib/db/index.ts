/// <reference path="../../typings/index.d.ts"/>

'use strict';

const rethinkdb = require('./rethinkdb');

import { User } from "../models/user";

const setup = () => {

};

const findPlayerByIdentity = (identity, callback) => {

};

const saveUser = (user: User, callback) => {

};

export {
    setup,
    findPlayerByIdentity,
    saveUser
};