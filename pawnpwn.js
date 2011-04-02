/*globals namespace console window $ */
/*jslint white: true, browser: true, devel: true
  debug: true, undef: true nomen: true, regexp: true
  newcap: true, immed: true, maxerr: 100, maxlen: 100 */


// A PawnPwnGame object is a purely abstract Pawn Pwn board.
// It controls all game data for the user interface

namespace.lookup('com.pageforest.pawnpwn').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client');
    var util = namespace.util;

    var vCode = 118;
    var hCode = 104;
    var letterOffset = 97;
    var numberOffset = 49;

    function newAction(i, j, wall) {
        return {
            i: i,
            j: j,
            wall: wall
        };
    }
    // color: 0 for white 1 for black
    function newPlayer(player) {
        var homeRow;
        var goalRow;
        if (player === 0) {
            homeRow = 8;
            goalRow = 0;

        }
        if (player === 1) {
            homeRow = 0;
            goalRow = 8;
        }
        return {
            i: 4,
            j: homeRow,
            walls: 10,
            score: 8,
            goalRow: goalRow
        };
    }

    function decode(str) { //converts a move string to a action object
        var i, j;
        var wall = false;
        if (str.length === 4) {
            if (str.charCodeAt(0) === vCode) {
                wall = "v";
            } else if (str.charCodeAt(0) === hCode) {
                wall = "h";
            }
            i = str.charCodeAt(2) - letterOffset;
            j = str.charCodeAt(3) - numberOffset;
        } else if (str.length === 2) {
            i = str.charCodeAt(0) - letterOffset;
            j = str.charCodeAt(1) - numberOffset;
        }
        return {
            i: i,
            j: j,
            wall: wall
        };
    }

    function encode(action) { //converts action object to a move string
        var str = '';
        if (action.wall) {
            str = action.wall + '-';
        }
        str += String.fromCharCode((action.i + letterOffset), (action.j + numberOffset));
        return str;
    }

    function Queue() {
        this.rg = [];
        this.iIn = 0;
        this.iOut = 0;
    }

    Queue.methods({
        push: function (item) {
            this.rg[this.iIn++] = item;
        },

        pop: function () {
            if (this.iIn === this.iOut) {
                return null;
            }
            return this.rg[this.iOut++];
        },

        fEmpty: function () {
            return this.iIn === this.iOut;
        }
    });

    function PawnPwnGame() {
        this.walls = {};
        this.players = [];
        this.history = {pos: 0, list: []};
        this.memo = {};
        this.track = [[1, 0], [-1, 0], [0, -1]];
    }

    PawnPwnGame.methods({
        init: function () {
            this.vWalls = [];
            this.hWalls = [];
            var i, j;
            for (i = 0; i < 9; i++) {
                this.vWalls[i] = [];
                this.hWalls[i] = [];
                for (j = 0; j < 9; j++) {
                    this.vWalls[i][j] = false;
                    this.hWalls[i][j] = false;
                }
            }
            this.players[0] = newPlayer(0);
            this.players[1] = newPlayer(1);
            this.history = {pos: 0, list: []};
            this.buildTrack();
        },

        getState: function () {
            return {
                players: this.players,
                walls: this.walls,
                history: this.history
            };
        },

        setState: function (json) {
            this.players = json.players;
            this.walls = json.walls;
            this.history = json.history;
        },

        // "e3" is a player move to the e3 square.
        // "v-e4" is a vertical wall with top section directly
        // to the right of the e4 square.
        // "h-d6" is a horizontal wall with left section directly below the d6 square.
        // bypass is a bool used by the changeHistoryPos fn to skip over isValidMove.
        move: function (str, from, bypass) {
            var p = this.history.pos % 2;
            var n;
            if (from) {
                if (from[0] === 'w') {
                    if (p !== parseInt(from[1], 10)) {
                        throw new Error("wall chosen from wrong side");
                    }
                    for (n = 0; n < this.history.pos; n++) {
                        if (this.history.list[n].from === from) {
                            throw new Error("wall already claimed");
                        }
                    }
                } else {
                    var f = decode(from);
                    var player = this.players[p];
                    if (player.i !== f.i || player.j !== f.j) {
                        throw new Error("move given a 'from' that is not the previous position");
                    }
                }
            } else {
                throw new Error("no 'from' var in qg.move call");
            }

            var action = decode(str);
            if (!bypass && !this.isValidMove(str)) {
                return false;
            }
            if (!bypass && !this.historyCurrent()) {
                this.history.list = this.history.list.slice(0, this.history.pos);
            }
            var turn = this.history.pos % 2;
            if (action.wall) {
                this.walls[str] = true;
                this.players[turn].walls--;
                this.memo = {};
            } else {
                this.players[turn].i = action.i;
                this.players[turn].j = action.j;
            }
            var score = this.breadthFirstSearch();
            for (n = 0; n < 2; n++) {
                this.players[n].score = score[n];
            }
            this.history.list[this.history.pos] = {
                move: str,
                score: this.getScore(),
                from: from
            };
            this.history.pos++;
            this.buildTrack();
            return true;
        },

        buildTrack: function () {
            var onPawn, moves, n;
            var turn = this.history.pos % 2;
            var opTurn = (this.history.pos + 1) % 2;
            var i = this.players[turn].i;
            var j = this.players[turn].j;
            var oi = this.players[opTurn].i;
            var oj = this.players[opTurn].j;
            moves = this.getReachableMoves(encode({i: i, j: j, walls: false}));
            onPawn = moves.indexOf(encode({i: oi, j: oj, wall: false}));
            if (onPawn !== -1) {
                moves = moves.concat(this.getReachableMoves(moves[onPawn]));
                delete moves[onPawn];
                delete moves[moves.indexOf(encode({i: i, j: j, wall: false}))];
            }
            this.track = [];
            var list = [], move, index, angles = [], c;
            var player = this.players[this.history.pos % 2];
            for (n = 0; n < moves.length; n++) {
                if (moves[n] === undefined) {
                    continue;
                }
                move = decode(moves[n]);
                list[list.length] = [move.i - player.i, move.j - player.j];
                angles[angles.length] = Math.atan2(-list[list.length - 1][1],
                    list[list.length - 1][0]) - Math.PI / 2;
                if (angles[angles.length - 1] >= 0) {
                    angles[angles.length - 1] -= Math.PI * 2;
                }
            }
            var highIndex, high;
            for (c = 0; c < angles.length; c++) {
                high = -99;
                for (n = 0; n < angles.length; n++) {
                    if (angles[n] > high) {
                        high = angles[n];
                        highIndex = n;
                    }
                }
                angles[highIndex] = -100;
                this.track[c] = list[highIndex];
            }
        },

        //is input string a valid move?  Returns true/false
        isValidMove: function (str) {
            if (this.memo[str]) {
                return true;
            }
            if (this.memo[str] === false) {
                return false;
            }
            var action = decode(str);
            var wallType = ["v", "h"];
            var wallArrayI = [];
            var wallArrayJ = [];
            wallArrayI[0] = [0, 0, 0];
            wallArrayJ[0] = [1, -1, 0];
            wallArrayI[1] = [1, -1, 0];
            wallArrayJ[1] = [0, 0, 0];
            var turn = this.history.pos % 2;
            var opTurn = (this.history.pos + 1) % 2;
            var i = this.players[turn].i;
            var j = this.players[turn].j;
            var oi = this.players[opTurn].i;
            var oj = this.players[opTurn].j;
            var k, n, moves, move, adjMoves;
            var onPawn;
            if (action.wall === false) {
                moves = this.getReachableMoves(encode({i: i, j: j, walls: false}));
                onPawn = moves.indexOf(encode({i: oi, j: oj, wall: false}));
                if (onPawn !== -1) {
                    moves = moves.concat(this.getReachableMoves(moves[onPawn]));
                    delete moves[onPawn];
                    delete moves[moves.indexOf(encode({i: i,
                        j: j, wall: false}))];
                }
                if (moves.indexOf(str) !== -1) {
                    return true;
                }
                return false;
            }
            if (this.players[turn].walls === 0) {
                return false;
            }
            for (k = 0; k < 2; k++) {
                if (action.wall === wallType[k]) {
                    if (this.walls[encode({i: action.i, j: action.j, 
                        wall: wallType[(k + 1) % 2]})]) {
                        this.memo[str] = false;
                        return false;
                    }
                    for (n = 0; n < 3; n++) {
                        if (this.walls[encode({i: (action.i + wallArrayI[k][n]),
                            j: (action.j + wallArrayJ[k][n]),
                            wall: wallType[k]})]) {
                            this.memo[str] = false;
                            return false;
                        }
                    }
                    this.walls[str] = true;
                    if (this.breadthFirstSearch() !== false) {
                        delete this.walls[str];
                        this.memo[str] = true;
                        return true;
                    } else {
                        delete this.walls[str];
                        this.memo[str] = false;
                        return false;
                    }
                }
            }
        },

        //accepts a string position and returns a list of valid pawn moves
        //checks if the move is off the board and if walls are in the way
        //does not check if the other pawn is in the way
        getReachableMoves: function (str, dirOnly)
        {
            //dir: 0 up 1 right 2 down 3 left
            //if pos + dir is off the board then return false
            var start = decode(str);
            var letter = ['h', 'v', 'h', 'v'];
            var diWall = [[-1, 0], [0, 0], [-1, 0], [-1, -1]];
            var djWall = [[-1, -1], [-1, 0], [0, 0], [-1, 0]];
            var di = [0, 1, 0, -1];
            var dj = [-1, 0, 1, 0];
            var w, i, j;
            var moves = [];
            var direction; //0: up, 1: right, 2: down, 3: left
            for (direction = 0; direction < 4; direction++) {
                i = start.i + di[direction];
                j = start.j + dj[direction];
                if (i > 8 || i < 0 || j > 8 || j < 0) {
                    continue;
                }
                if (this.walls[encode({i: start.i + diWall[direction][0],
                    j: start.j + djWall[direction][0], wall: letter[direction]})] ||
                    this.walls[encode({i: start.i + diWall[direction][1],
                    j: start.j + djWall[direction][1], wall: letter[direction]})]) {
                    continue;
                }
                if (dirOnly == undefined) {
                    moves[moves.length] = encode({i: i, j: j, wall: false});
                } else {
                    moves[moves.length] = direction;
                }
            }
            return moves;
        },

        //takes in a string move position ex: "e4" and returns
        //whether or not both players can reach their goal rows
        //returns the players current scores
        breadthFirstSearch: function () {
            var i, k, win, score, pos, moves, start, queue, scoreMap;
            var valid = [false, false];
            var bestScore = [100, 100];
            for (k = 0; k < 2; k++) {
                scoreMap = {};
                start = encode({i: this.players[k].i, j: this.players[k].j, wall: false});
                queue = new Queue();
                queue.push([start, 0]);
                scoreMap[start] = 0;
                while (!queue.fEmpty()) {
                    pos = queue.pop();
                    moves = this.getReachableMoves(pos[0]);
                    score = pos[1];
                    for (i = 0; i < moves.length; i++) {
                        if (scoreMap[moves[i]] || scoreMap[moves[i]] === 0) {
                            continue;
                        }
                        queue.push([moves[i], score + 1]);
                        scoreMap[moves[i]] = score + 1;
                    }
                }
                for (i = 0; i < 9; i++) {
                    win = encode({i: i, j: this.players[k].goalRow, wall: false});
                    if (scoreMap[win] >= 0 && scoreMap[win] < bestScore[k]) {
                        bestScore[k] = scoreMap[win];
                    }
                }
            }
            if (bestScore[0] == 100 || bestScore[1] == 100) {
                return false;
            }
            return bestScore;
        },

        // changes the history to where pos specifies
        changeHistoryPos: function (pos) {
            var count, move, i, from;
            var totalLength = this.history.list.length;
            if (pos === this.history.pos) {
                return false;
            }
            if (pos < this.history.pos) {
                count = this.history.pos - pos;
                for (i = 0; i < count; i++) {
                    this.unMove();
                }
            }
            if (pos > this.history.pos) {
                count = pos - this.history.pos;
                for (i = 0; i < count; i++) {
                    move = this.history.list[this.history.pos].move;
                    from = this.history.list[this.history.pos].from;
                    this.move(move, from, true);
                }
            }
            this.buildTrack();
            return this.history;
        },

        unMove: function () {
            this.history.pos--;
            var action = this.history.list[this.history.pos];
            var move = decode(action.move);
            var from = decode(action.from);
            var turn = this.history.pos % 2;
            if (move.wall) {
                delete this.walls[encode(move)];
                this.players[turn].walls++;
                return;
            }
            this.players[turn].i = from.i;
            this.players[turn].j = from.j;
            if (this.history.pos === 0) {
                this.players[0].score = 8;
                this.players[1].score = 8;
            } else {
                this.players[0].score = this.history.list[this.history.pos - 1].score[0];
                this.players[1].score = this.history.list[this.history.pos - 1].score[1];
            }
        },

        historyCurrent: function () {
            if (this.history.list.length === this.history.pos) {
                return true;
            } else {
                return false;
            }
        },

        getScore: function () {
            return [this.players[0].score, this.players[1].score];
        },

        currentPlayer: function () {
            return (this.history.pos % 2);
        },

        isGameOver: function () {
            var s = this.getScore();
            if (s[0] === 0 || s[1] === 0) {
                return true;
            }
            return false;
        }

    });
    ns.extend({
        'PawnPwnGame': PawnPwnGame,
        'encode': encode,
        'decode': decode,
        'newPlayer': newPlayer
    });
});



