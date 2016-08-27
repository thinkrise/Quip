///<reference path="../../typings/index.d.ts"/>

'use strict';

const getTopics = (req, res) => {
    res.render('topics', { user: req.user, title: 'Topics' });
};

export {
    getTopics
};