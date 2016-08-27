///<reference path="../typings/index.d.ts"/>

"use strict";

declare module 'request' {
    import express = require('express');

    interface Request extends express.Request {
        user: string;
    }
}