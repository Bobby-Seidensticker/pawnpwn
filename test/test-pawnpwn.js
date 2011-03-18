/*globals namespace console window $ */
/*jslint white: true, browser: true, devel: true */ 
/*jslint debug: true, undef: true nomen: true, regexp: true */
/*jslint newcap: true, immed: true, maxerr: 100, maxlen: 80 */


namespace.lookup('com.pageforest.pawnpwn.test').defineOnce(function (ns) {
    var pawnpwn = namespace.lookup('com.pageforest.pawnpwn');
    var base = namespace.lookup('org.startpad.base');

    function addTests(ts) {
        ts.addTest("Players at start", function (ut) {
            console.log(pawnpwn);
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assertEq(pp.players[0].i, 4, "white starting i coordinate");
            ut.assertEq(pp.players[1].i, 4, "black starting i coordinate");
            ut.assertEq(pp.players[0].j, 8, "white starting j coordinate");
            ut.assertEq(pp.players[1].j, 0, "black starting j coordinate");
        });

        ts.addTest("Player score", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assertEq(pp.players[0].score, 8, 
                "white's initial score correct");
            ut.assertEq(pp.players[1].score, 8, 
                "black's initial score correct");
        });

        ts.addTest("Basic movement", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assert(pp.move('e8', 'e9'), "The move was valid");
            ut.assertEq(pp.players[0].i, 4, "white up i coordinate correct");
            ut.assertEq(pp.players[0].j, 7, "j coordinate correct");
            ut.assertEq(pp.history.list.length, 1);
            ut.assertEq(pp.history.pos, 1);
            ut.assert(pp.move('e2', 'e1'), "The move was valid");
            ut.assertEq(pp.players[1].i, 4, "black down i coordinate correct");
            ut.assertEq(pp.players[1].j, 1, "j coordinate correct");
            ut.assertEq(pp.history.list.length, 2);
            ut.assertEq(pp.history.pos, 2);
            ut.assert(pp.move('d8', 'e8'), "The move was valid");
            ut.assertEq(pp.players[0].i, 3, "white left i coordinate correct");
            ut.assertEq(pp.players[0].j, 7, "j coordinate correct");
            ut.assertEq(pp.history.list.length, 3);
            ut.assertEq(pp.history.pos, 3);
            ut.assert(pp.move('f2', 'e2'), "The move was valid");
            ut.assertEq(pp.players[1].i, 5, "black right i coordinate correct");
            ut.assertEq(pp.players[1].j, 1, "j coordinate correct");
            ut.assertEq(pp.history.list.length, 4);
            ut.assertEq(pp.history.pos, 4);
        });

        ts.addTest("Adjacent jumps and score checking", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assertEq(pp.getScore(), [8, 8]);
            ut.assert(pp.move('e8', 'e9'), "The move was valid");
            ut.assert(pp.move('e2', 'e1'), "The move was valid");
            ut.assertEq(pp.getScore(), [7, 7], "first score check, should be 7's");
            ut.assert(pp.move('e7', 'e8'), "move");//w
            ut.assertEq(pp.getScore(), [6, 7]);
            ut.assert(pp.move('e3', 'e2'), "move");
            ut.assertEq(pp.getScore(), [6, 6]);
            ut.assert(pp.move('e6', 'e7'), "move");//w
            ut.assertEq(pp.getScore(), [5, 6]);
            ut.assert(pp.move('e4', 'e3'), "move");
            ut.assertEq(pp.getScore(), [5, 5]);
            ut.assert(pp.move('e5', 'e6'), "move");//w
            ut.assertEq(pp.getScore(), [4, 5]);
            ut.assert(pp.move('e6', 'e4'), "move");
            ut.assertEq(pp.getScore(), [4, 3]);
            ut.assertEq(pp.players[0].j, 4, "white's j coord");
            ut.assertEq(pp.players[0].i, 4, "white's i coord");
            ut.assertEq(pp.players[1].j, 5, "black's j coord");
            ut.assertEq(pp.players[1].i, 4, "black's i coord");
            pp.init();
            ut.assert(pp.move('e8', 'e9'), "The move was valid");
            ut.assert(pp.move('e2', 'e1'), "The move was valid");
            ut.assert(pp.move('e7', 'e8'), "move");//w
            ut.assert(pp.move('e3', 'e2'), "move");
            ut.assert(pp.move('e6', 'e7'), "move");//w
            ut.assert(pp.move('e4', 'e3'), "move");
            ut.assert(pp.move('e5', 'e6'), "move");//w
            ut.assert(pp.move('d5', 'e4'));
            ut.assertEq(pp.players[1].j, 4, "black's j coord");
            ut.assertEq(pp.players[1].i, 3, "black's i coord");
            pp.init();
            ut.assert(pp.move('e8', 'e9'), "The move was valid");
            ut.assert(pp.move('e2', 'e1'), "The move was valid");
            ut.assert(pp.move('e7', 'e8'), "move");//w
            ut.assert(pp.move('e3', 'e2'), "move");
            ut.assert(pp.move('e6', 'e7'), "move");//w
            ut.assert(pp.move('e4', 'e3'), "move");
            ut.assert(pp.move('e5', 'e6'), "move");//w
            ut.assert(pp.move('f5', 'e4'));
            ut.assertEq(pp.players[1].j, 4, "black's j coord");
            ut.assertEq(pp.players[1].i, 5, "black's i coord");
        });

        ts.addTest("Adjacent pawn jumps with walls", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assert(pp.move('e8', 'e9'), "move");//w
            ut.assert(pp.move('e2', 'e1'), "move");
            ut.assert(pp.move('e7', 'e8'), "move");//w
            ut.assert(pp.move('e3', 'e2'), "move");
            ut.assert(pp.move('e6', 'e7'), "move");//w
            pp.move('h-e4', 'w1_0');//black's wall
            ut.assert(pp.move('e5', 'e6'), "white moving after black placed wall");
            ut.assert(pp.move('e4', 'e3'), "black moving to behind its own wall");
            ut.assert(!pp.move('e3', 'e5'), "white attempt to jump");
            ut.assertEq(pp.players[0].j, 4, "white is still in same spot");
            ut.assertEq(pp.history.pos % 2, 0, "still white's turn");
        });

        ts.addTest("moving through walls", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            pp.move('h-e1', 'w0_0');//white wall
            ut.assert(!pp.move('e2', 'e1'), "black attempt to move through wall");
            ut.assertEq(pp.history.pos, 1);
        });

        ts.addTest("Walls Placing", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            pp.move('v-a1', 'w0_0');
            ut.assert(!pp.move('v-a2', 'w1_0'));
            pp.move('h-d1', 'w1_0');
            ut.assert(!pp.move('h-e1', 'w0_1'));
            ut.assert(pp.walls['v-a1']);
            ut.assert(pp.walls['h-d1']);
            ut.assert(!pp.isValidMove('v-a2'));
            ut.assert(!pp.isValidMove('h-e1'));
            ut.assert(!pp.walls['v-a2']);
            ut.assert(!pp.walls['h-e1']);
        });

        ts.addTest("Same Wall", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            pp.move('v-a2', 'w0_1');
            ut.assert(!pp.isValidMove('v-a1'));
            ut.assert(!pp.isValidMove('v-a2'));
            ut.assert(!pp.isValidMove('v-a3'));
            pp.move('h-e5', 'w1_1');
            ut.assert(!pp.isValidMove('d5'));
            ut.assert(!pp.isValidMove('e5'));
            ut.assert(!pp.isValidMove('f5'));
        });

        ts.addTest("Crossing Walls", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            pp.move('v-a1', 'w0_0');
            ut.assert(!pp.isValidMove('h-a1'));
        });

        ts.addTest("Complete Block Off", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            pp.move('h-a6', 'w0_0');//w
            pp.move('h-c6', 'w1_0');
            pp.move('h-e6', 'w0_1');//w
            pp.move('h-g6', 'w1_1');
            pp.move('v-h6', 'w0_2');//w
            ut.assert(!pp.isValidMove('h-h7'));
            ut.assert(!pp.isValidMove('h-h5'));
        });

        ts.addTest("Encypher & Decypher", function (ut) {
            var action = pawnpwn.decode('v-a2');
            ut.assertEq(action.i, 0);
            ut.assertEq(action.j, 1);
            var str = pawnpwn.encode(action);
            ut.assertEq(str, 'v-a2');
            action = {i: 0, j: 0, wall: 'v'};
            ut.assertEq(action, pawnpwn.decode('v-a1'));
            ut.assertEq('v-a1', pawnpwn.encode(action));
            action = pawnpwn.decode('a1');
            str = pawnpwn.encode(action);
            ut.assertEq(action, pawnpwn.decode('a1'));
            ut.assertEq('a1', pawnpwn.encode(action));
        });

        ts.addTest("Change History Walls", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assert(pp.move('v-a1', 'w0_0'));
            pp.changeHistoryPos(0);
            ut.assert(!pp.walls['v-a1']);
            pp.changeHistoryPos(1);
            ut.assert(pp.walls['v-a1']);
            ut.assert(pp.history.list[0].from == 'w0_0');
        });

        ts.addTest("Change History", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            var testHistory = {pos: 0, list: []};
            ut.assert(pp.move('e8', 'e9'));
            testHistory.list[0] = {move: 'e8', from: 'e9', score: [7, 8]};
            testHistory.pos = 1;
            pp.changeHistoryPos(0);
            testHistory.pos = 0;
            ut.assertEq(pp.currentPlayer(), 0);
            ut.assertEq(pp.players[0].j, 8);
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(1);
            testHistory.pos = 1;
            ut.assertEq(pp.currentPlayer(), 1);
            ut.assertEq(pp.players[0].j, 7, "White's position");
            ut.assertEq(pp.history, testHistory);
            ut.assert(pp.move('e2', 'e1'));
            testHistory.list[1] = {move: 'e2', from: 'e1', score: [7, 7]};
            testHistory.pos = 2;
            ut.assertEq(pp.currentPlayer(), 0);
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(1);
            testHistory.pos = 1;
            ut.assertEq(pp.players[1].j, 0);
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(2);
            testHistory.pos = 2;
            ut.assertEq(pp.players[1].j, 1);
            ut.assertEq(pp.players[0].j, 7);
            ut.assertEq(pp.history, testHistory);
            ut.assert(pp.move('e7', 'e8'));
            testHistory.list[2] = {move: 'e7', from: 'e8', score: [6, 7]};
            testHistory.pos = 3;
            ut.assertEq(pp.players[0].j, 6);
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(2);
            testHistory.pos = 2;
            ut.assertEq(pp.players[1].j, 1);
            ut.assertEq(pp.players[0].j, 7);
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(3);
            testHistory.pos = 3;
            ut.assertEq(pp.players[0].j, 6);
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(0);
            testHistory.pos = 0;
            ut.assertEq(pp.players[0].j, 8);
            ut.assertEq(pp.players[1].j, 0);
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(3);
            testHistory.pos = 3;
            ut.assertEq(pp.history, testHistory);
            ut.assert(pp.move('e3', 'e2'));
            testHistory.list[3] = {move: 'e3', from: 'e2', score: [6, 6]};
            testHistory.pos = 4;
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(3);
            testHistory.pos = 3;
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(4);
            testHistory.pos = 4;
            ut.assertEq(pp.players[1].j, 2);
            ut.assertEq(pp.history, testHistory);
            ut.assert(pp.move('v-c4', 'w0_0'));
            testHistory.pos = 5;
            testHistory.list[4] = {move: 'v-c4', from: 'w0_0', score: [6, 6]};
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(4);
            testHistory.pos = 4;
            ut.assert(!pp.walls['v-c4']);
            ut.assertEq(pp.history, testHistory);
            pp.changeHistoryPos(5);
            testHistory.pos = 5;
            ut.assert(pp.walls['v-c4']);
            ut.assertEq(pp.history, testHistory);
        });

        ts.addTest("Go back in history, overwrite moves", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            var tempHistory = {pos: 0, list: []};
            pp.move('e8', 'e9');
            tempHistory.pos = 1;
            tempHistory.list[0] = {move: 'e8', from: 'e9', score: [7, 8]};
            ut.assertEq(pp.history, tempHistory);
            pp.changeHistoryPos(0);
            tempHistory.pos = 0;
            ut.assertEq(pp.history, tempHistory);
            pp.move('d9', 'e9');
            tempHistory.pos = 1;
            tempHistory.list[0] = {move: 'd9', from: 'e9', score: [8, 8]};
            ut.assertEq(pp.history, tempHistory);
            pp.move('v-c4', 'w1_0');
            tempHistory.pos = 2;
            tempHistory.list[1] = {move: 'v-c4', from: 'w1_0', score: [8, 8]};
            ut.assertEq(pp.history, tempHistory);
            pp.move('d8', 'd9');
            tempHistory.pos = 3;
            tempHistory.list[2] = {move: 'd8', from: 'd9', score: [7, 8]};
            ut.assertEq(pp.history, tempHistory);
            pp.changeHistoryPos(1);
            tempHistory.pos = 1;
            ut.assertEq(pp.history, tempHistory);
            pp.move('e2', 'e1');
            tempHistory.pos = 2;
            tempHistory.list = tempHistory.list.slice(0,1);
            tempHistory.list[1] = {move: 'e2', from: 'e1', score: [8, 7]};
        });

        ts.addTest("get/setState", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            pp.move('e8', 'e9');//w
            pp.move('e2', 'e1');
            pp.move('e7', 'e8');//w
            pp.move('e3', 'e2');
            pp.move('v-e4', 'w0_0');//w
            pp.move('e4', 'e3');
            pp.move('v-f4', 'w0_1');//w
            pp.move('e5', 'e4');
            pp.move('v-d4', 'w0_2');//w
            var json = pp.getState();
            pp.setState(json);
            ut.assertEq(json, pp.getState());
            ut.assert(pp.walls['v-d4']);
            ut.assertEq(pp.players[0].i, 4);
            ut.assertEq(pp.players[0].j, 6);
        });

        ts.addTest("getReachableMove", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            var moves;
            
            moves = pp.getReachableMoves('e9');
            ut.assertEq(moves.indexOf('e9'), -1);
            ut.assert(moves.indexOf('d9') >= 0);
            ut.assert(moves.indexOf('f9') >= 0);
            ut.assert(moves.indexOf('e8') >= 0);

            ut.assert(pp.move('h-e5', 'w0_0'), "move");
            moves = pp.getReachableMoves('e5');
            ut.assertEq(moves.indexOf('e6'), -1);
            ut.assert(moves.indexOf('d5') >= 0);
            ut.assert(moves.indexOf('f5') >= 0);
            ut.assert(moves.indexOf('e4') >= 0);
            ut.assertEq(moves.length, 3, '1');

            pp.changeHistoryPos(0);
            ut.assert(pp.move('h-d5', 'w0_0'), "move");
            moves = pp.getReachableMoves('e5');
            ut.assertEq(moves.indexOf('e6'), -1);
            ut.assert(moves.indexOf('d5') >= 0);
            ut.assert(moves.indexOf('f5') >= 0);
            ut.assert(moves.indexOf('e4') >= 0);
            ut.assertEq(moves.length, 3, '2');

            pp.changeHistoryPos(0);
            ut.assert(pp.move('v-e5', 'w0_1'), "move");
            moves = pp.getReachableMoves('e5');
            ut.assert(moves.indexOf('f5') == -1);
            ut.assert(moves.indexOf('d5') >= 0);
            ut.assert(moves.indexOf('e6') >= 0);
            ut.assert(moves.indexOf('e4') >= 0);
            ut.assertEq(moves.length, 3, '3');

            pp.changeHistoryPos(0);
            ut.assert(pp.move('v-e4', 'w0_1'), "move");
            moves = pp.getReachableMoves("e5");
            ut.assert(moves.indexOf("f5") == -1);
            ut.assert(moves.indexOf("d5") >= 0);
            ut.assert(moves.indexOf("e6") >= 0);
            ut.assert(moves.indexOf("e4") >= 0);
            ut.assertEq(moves.length, 3, '4');

            pp.changeHistoryPos(0);
            ut.assert(pp.move('h-d4', 'w0_2'), "move");
            moves = pp.getReachableMoves("e5");
            ut.assert(moves.indexOf("f5") >= 0);
            ut.assert(moves.indexOf("d5") >= 0);
            ut.assert(moves.indexOf("e6") >= 0);
            ut.assert(moves.indexOf("e4") == -1);
            ut.assertEq(moves.length, 3, '5');

            pp.changeHistoryPos(0);
            ut.assert(pp.move('h-e4', 'w0_2'), "move");
            moves = pp.getReachableMoves("e5");
            ut.assert(moves.indexOf("f5") >= 0);
            ut.assert(moves.indexOf("d5") >= 0);
            ut.assert(moves.indexOf("e6") >= 0);
            ut.assert(moves.indexOf("e4") == -1);
            ut.assertEq(moves.length, 3, '6');

            pp.changeHistoryPos(0);
            ut.assert(pp.move('v-d4', 'w0_3'), "move");
            moves = pp.getReachableMoves("e5");
            ut.assert(moves.indexOf("f5") >= 0);
            ut.assert(moves.indexOf("d5") == -1);
            ut.assert(moves.indexOf("e6") >= 0);
            ut.assert(moves.indexOf("e4") >= 0);
            ut.assertEq(moves.length, 3, '7');            
            console.log("here8");
            pp.changeHistoryPos(0);
            ut.assert(pp.move('v-d5', 'w0_3'), "move");
            moves = pp.getReachableMoves("e5");
            ut.assert(moves.indexOf("f5") >= 0);
            ut.assert(moves.indexOf("d5") == -1);
            ut.assert(moves.indexOf("e6") >= 0);
            ut.assert(moves.indexOf("e4") >= 0);
            ut.assertEq(moves.length, 3, "3");            
            console.log("here9");
        });

        ts.addTest("score change with history change", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assert(pp.move('e8', 'e9'));
            ut.assert(pp.move('e2', 'e1'));
            ut.assert(pp.move('e7', 'e8'));
            ut.assert(pp.move('e3', 'e2'));
            ut.assertEq(pp.getScore(), [6, 6]);
            pp.changeHistoryPos(0);
            ut.assertEq(pp.getScore(), [8, 8]);
            pp.changeHistoryPos(4);
            ut.assertEq(pp.getScore(), [6, 6]);
        });

        ts.addTest("build track", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            pp.buildTrack();
            ut.assertEq(pp.track, [[1, 0], [-1, 0], [0, -1]], "white's first track");
            ut.assert(pp.move('e8', 'e9'), "w");
            ut.assertEq(pp.track,[[1, 0], [0, 1], [-1, 0]], "black's first track");
            ut.assert(pp.move('e2', 'e1'), "b");
            ut.assertEq(pp.track,[[1, 0], [0, 1], [-1, 0], [0, -1]], "white's second track");
            ut.assert(pp.move('e7', 'e8'), "w");
            ut.assertEq(pp.track,[[1, 0], [0, 1], [-1, 0], [0, -1]], "black's second track");
            ut.assert(pp.move('e3', 'e2'), "b");
            ut.assertEq(pp.track,[[1, 0], [0, 1], [-1, 0], [0, -1]], "white's third track");
            ut.assert(pp.move('e6', 'e7'), "w");
            ut.assertEq(pp.track,[[1, 0], [0, 1], [-1, 0], [0, -1]], "black's third track");
            ut.assert(pp.move('e4', 'e3'), "b");
            ut.assertEq(pp.track,[[1, 0], [0, 1], [-1, 0], [0, -1]], "white's fourth track");
            ut.assert(pp.move('e5', 'e6'), "w");
            ut.assertEq(pp.track,[[1, 0], [1, 1], [0, 2], [-1, 1], [-1, 0], [0, -1]], "black's adjacent moves, white is below");
            ut.assert(pp.move('f5', 'e4'), "b");
            ut.assertEq(pp.track,[[1, -1], [2, 0], [1, 1], [0, 1], [-1, 0], [0, -1]], "white's adjacent moves, black is to the right");
            ut.assert(pp.move('f4', 'e5'), "w");
            ut.assertEq(pp.track,[[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], "black's adjacent moves, white is above");
            ut.assert(pp.move('e4', 'f5'), "b");
            ut.assertEq(pp.track,[[1, 0], [0, 1], [-1, 1], [-2, 0], [-1, -1], [0, -1]], "white's adjacent moves, black is to the left");
        });

        ts.addTest("build track with walls", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assertEq(pp.track, [[1, 0], [-1, 0], [0, -1]], "white's first track");
            ut.assert(pp.move('h-e1', 'w0_0'), "w1");
            ut.assertEq(pp.track,[[1, 0], [-1, 0]], "black's first track");
            ut.assert(pp.move('v-d8', 'w1_0'), "b1");
            ut.assertEq(pp.track, [[1, 0], [0, -1]], "white's first track");
            ut.assert(pp.move('v-d1', 'w0_1'), "w2");
            ut.assertEq(pp.track,[[1, 0]], "black's first track");
            ut.assert(pp.move('v-e8', 'w1_1'), "b2");
            ut.assertEq(pp.track, [[0, -1]], "white's first track");
        });

        ts.addTest("wall history", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assert(pp.move('v-a1', 'w0_0'));
            ut.assert(pp.move('v-b1', 'w1_0'));
            ut.assert(pp.move('v-c1', 'w0_1'));
            ut.assert(pp.move('v-d1', 'w1_1'));
            ut.assert(pp.move('v-e1', 'w0_2'));
            ut.assert(pp.move('v-f1', 'w1_2'));
            var n = 0;
            for (n = 0; n < 6; n++) {
                ut.assertEq(pp.history.list[n].from, 'w' + (n % 2) + "_" + Math.floor(n / 2));
            }
        });

        ts.addTest("isGameOver()", function (ut) {
            var pp = new pawnpwn.PawnPwnGame();
            pp.init();
            ut.assert(pp.move('e8', 'e9'));//w
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e2', 'e1'));
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e7', 'e8'));//w
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e3', 'e2'));
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e6', 'e7'));//w
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e4', 'e3'));
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e5', 'e6'));//w
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e6', 'e4'));
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e4', 'e5'));//w
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e7', 'e6'));
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e3', 'e4'));//w
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e8', 'e7'));
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e2', 'e3'));//w
            ut.assert(!pp.isGameOver());
            ut.assert(pp.move('e9', 'e8'));
            ut.assert(pp.isGameOver());
        });
    }
    ns.addTests = addTests;
});