///<reference path="../../typings/index.d.ts"/>

'use strict';

interface Player {
    identity: string;
    name: string;
    games: {
        wins: number;
        draws: number;
        losses: number;
    }
}

export {
    Player
}