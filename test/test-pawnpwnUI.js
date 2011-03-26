/*globals namespace console window $ */
/*jslint white: true, browser: true, devel: true */ 
/*jslint debug: true, undef: true nomen: true, regexp: true */
/*jslint newcap: true, immed: true, maxerr: 100, maxlen: 80 */


namespace.lookup('com.pageforest.pawnpwnUI.test').defineOnce(function (ns) {
    var pawnpwn = namespace.lookup('com.pageforest.pawnpwn');
    var pawnpwnUI = namespace.lookup('com.pageforest.pawnpwnUI');
    var base = namespace.lookup('org.startpad.base');
    
    function addTests(ts) {
        ts.addTest("Existance", function (ut) {
            //var qg = new pawnpwn.PawnPwnGame();
            //qg.init();
            //ut.assertEq(qg.players[0].i, 4, "white starting i coordinate");
            console.log(pawnpwnUI);
            ut.assert(pawnpwnUI);
        });
        
      /*  ts.addTest("onReady", function (ut) {
            ut.assert(pawnpwnUI.onReady());
        });*/

       /* ts.addTest("ptCell", function (ut) {
            ut.assertEq(pawnpwnUI.ptCell(49, 53), {i: 0, j: 0, k: 3});
            ut.assertEq(pawnpwnUI.ptCell(177, 87), {i: 2, j: 1, k: 2});
            ut.assertEq(pawnpwnUI.ptCell(209, 210), {i: 3, j: 3, k: 0});
            ut.assertEq(pawnpwnUI.ptCell(207, 363), {i: 3, j: 5, k: 1});
            ut.assertEq(pawnpwnUI.ptCell(518, 520), {i: 8, j: 8, k: 0});
            ut.assertEq(pawnpwnUI.ptCell(177, 176), {i: 2, j: 2, k: 3});
        });*/

        /*   ts.addTest("ptWalls", function (ut) {
            var qg = new pawnpwn.PawnPwnGame();
            qg.init();
            var wall;
            wall = pawnpwnUI.ptWalls(19, 49);
            ut.assertEq(wall, "h-a0");
            wall = pawnpwnUI.ptWalls(53, 20);
            ut.assertEq(wall, "v-a0");
            wall = pawnpwnUI.ptWalls(113, 21);
            ut.assertEq(wall, "v-b0");
            wall = pawnpwnUI.ptWalls(113, 81);
            ut.assertEq(wall, "v-b1");
        });*/

        ts.addTest("mouseToPawn123", function (ut) {
            var qg = new pawnpwn.PawnPwnGame();
            qg.init();
            ut.assertEq(pawnpwnUI.mouseToPawn(1, -10),[0, -10], "up");
            ut.assertEq(pawnpwnUI.mouseToPawn(-1, -10),[0, -10], "up");
            ut.assertEq(pawnpwnUI.mouseToPawn(10, -1),[10, 0], "right");
            ut.assertEq(pawnpwnUI.mouseToPawn(10, 1),[10, 0], "right");
            ut.assertEq(pawnpwnUI.mouseToPawn(-10, 1),[-10, 0], "left");
            ut.assertEq(pawnpwnUI.mouseToPawn(-10, -1),[-10, 0], "left");
            ut.assertEq(pawnpwnUI.mouseToPawn(1, 10),[0, 10], "down");
            ut.assertEq(pawnpwnUI.mouseToPawn(-1, 10),[0, 10], "down");
            
            ut.assertEq(pawnpwnUI.mouseToPawn(1, -90),[0, -58.375], "up overextended");
            ut.assertEq(pawnpwnUI.mouseToPawn(-1, -90),[0, -58.375], "up overextended");
            ut.assertEq(pawnpwnUI.mouseToPawn(90, -1),[58.375, 0], "right overextended");
            ut.assertEq(pawnpwnUI.mouseToPawn(90, 1),[58.375, 0], "right overextended");
            ut.assertEq(pawnpwnUI.mouseToPawn(-90, 1),[-58.375, 0], "left overextended");
            ut.assertEq(pawnpwnUI.mouseToPawn(-90, -1),[-58.375, 0], "left overextended");
            ut.assertEq(pawnpwnUI.mouseToPawn(1, 90),[0, 58.375], "down overextended");
            ut.assertEq(pawnpwnUI.mouseToPawn(-1, 90),[0, 58.375], "down overextended");
        });
        
        ts.addTest("closestTrack", function (ut) {
            var qg = new pawnpwn.PawnPwnGame();
            qg.init();
            ut.assert(qg.move("e7"));
            
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0]], -1, 5), 2, "3 track, 1");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0]], 5, -4), 0, "3 track, 2");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0]], 5, -6), 1, "3 track, 3");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0]], -5, -6), 1, "3 track, 4");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0]], -5, -4), 2, "3 track, 5");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0]], -5, 5), 2, "3 track, 6");
            ut.assert(qg.move("e1"));
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0], [0, -1]], 1, 5), 3, "4 track, 1");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0], [0, -1]], 5, 1), 0, "4 track, 2");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0], [0, -1]], 1, -5), 1, "4 track, 3");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0], [0, 1], [-1, 0], [0, -1]], -5, 1), 2, "4 track, 4");
            
            qg.init();
            ut.assert(qg.move("v-d7"));
            ut.assert(qg.move("h-e7"));
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0]], 1, 5), 0, "1 track, 1");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0]], 5, 1), 0, "1 track, 2");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0]], 1, -5), 0, "1 track, 3");
            ut.assertEq(pawnpwnUI.closestTrack([[1, 0]], -5, 1), 0, "1 track, 4");

            qg.init();
            ut.assert(qg.move("e7"), "w");
            ut.assert(qg.move("e1"), "b");
            ut.assert(qg.move("e6"), "w");
            ut.assert(qg.move("e2"), "b");
            ut.assert(qg.move("e5"), "w");
            ut.assert(qg.move("e3"), "b");
            ut.assert(qg.move("e4"), "w");
            ut.assert(qg.move("v-a0"), "b");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], 10, 10), 0, "6 track, 1");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], 11, 11), 0, "6 track, 2");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], 9, 9), 0, "6 track, 3");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], 10, 2), 1, "6 track, 4");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], 10, -2), 1, "6 track, 5");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], 2, -10), 2, "6 track, 6");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], -2, -10), 2, "6 track, 7");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], -10, -2), 3, "6 track, 8");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], -10, 2), 3, "6 track, 9");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], -10, 10), 4, "6 track, 10");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], -10, 11), 4, "6 track, 11");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], -1, 10), 5, "6 track, 12");
            ut.assertEq(pawnpwnUI.closestTrack([[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -2]], 1, 10), 5, "6 track, 13");
        });
      //canvas = {w: canvasWidth, h: canvasHeight}
        /*score = [[whites score after white's 1st move, 
         *black's score after white's 1st move],
         *[w score after b's 1st move, 
         *b score after b's 1st move],[...],...];
         */
        //function graph (score, canvas) {
        ts.addTest("graph", function (ut) {
            //within bounds, no graph stretching
            ut.assertEq(pawnpwnUI.graph([8,7,8,4], [20,10]), [[0, 2], [5, 3], [10, 2], [15, 6]], "within bounds 1");
            ut.assertEq(pawnpwnUI.graph([8,7,8], [20,10]), [[0, 2], [5, 3], [10, 2]], "within bounds 2");
            ut.assertEq(pawnpwnUI.graph([8,7], [20,10]), [[0, 2], [5, 3]], "within bounds 3");
            ut.assertEq(pawnpwnUI.graph([8], [20,10]), [[0, 2]], "within bounds 4");
            //
            ut.assertEq(pawnpwnUI.graph([8,7,8,4,5], [20,10]), [[0, 2], [4/*20/5*/, 3], [8, 2], [12, 6], [16, 5]], "with horizontal stretching score.length = 5");
            ut.assertEq(pawnpwnUI.graph([8,7,8,4,5,6], [20,10]), [[0, 2], [20/6, 3], [20/6*2, 2], [20/6*3, 6], [20/6*4, 5], [20/6*5, 4]], "with horizontal stretching score.length = 6");

            ut.assertEq(pawnpwnUI.graph([8,7,8,4,5,6,2], [20,10]), [[0, 2], [20/7, 3], [20/7*2, 2], [20/7*3, 6], [20/7*4, 5], [20/7*5, 4], [20/7*6, 8]], "with horizontal stretching score.length = 7");
            ut.assertEq(pawnpwnUI.graph([8,7,8,4,5,6,2,9], [20,10]), [[0, 2], [20/8, 3], [20/8*2, 2], [20/8*3, 6], [20/8*4, 5], [20/8*5, 4], [20/8*6, 8], [20/8*7, 1]], "with horizontal stretching score.length = 8");

            ut.assertEq(pawnpwnUI.graph([8,10,6], [20,10]), [[0, 2], [5, 0], [10, 4]], "with vert stretching 1");
            ut.assertEq(pawnpwnUI.graph([8,12,6], [20,10]), [[0, 10 - 10*8/12], [5, 10 - 10*12/12], [10, 10 - 10*6/12]], "with vert stretching 2");
            ut.assertEq(pawnpwnUI.graph([8,17,6], [20,10]), [[0, 10 - 10*8/17], [5, 10 - 10*17/17], [10, 10 - 10*6/17]], "with vert stretching 3");
            ut.assertEq(pawnpwnUI.graph([8,23,6], [20,10]), [[0, 10 - 10*8/23], [5, 10 - 10*23/23], [10, 10 - 10*6/23]], "with vert stretching 4");
            ut.assertEq(pawnpwnUI.graph([8,26,6], [20,10]), [[0, 10 - 10*8/26], [5, 10 - 10*26/26], [10, 10 - 10*6/26]], "with vert stretching 5");
            
        });
    }

    ns.addTests = addTests;
});