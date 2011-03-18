/*globals namespace console window $ */
/*jslint white: true, browser: true, devel: true */ 
/*jslint debug: true, undef: true nomen: true, regexp: true */
/*jslint newcap: true, immed: true, maxerr: 100, maxlen: 80 */

namespace.lookup('com.pageforest.move-controller.test').defineOnce(function (ns) {
    var moveController = namespace.lookup('com.pageforest.move-controller');
    var quoridor = namespace.lookup('com.pageforest.quoridor');
    var base = namespace.lookup('org.startpad.base');

    function addTests(ts) {
        ts.addTest("Move-controller.merge newHistory situations", function (ut) {
            var qg = new quoridor.QuoridorGame();
            qg.init();
            var newHistory = {
                pos: 0,
                list: []
            };

            function setMovePos (pos, animate, fnComplete) {
                qg.history.pos = pos;
                fnComplete();
            }
            function appendMoves () {
                qg.history.list = newHistory.list;
            }
            var ui = {setMovePos: setMovePos, appendMoves: appendMoves};
            var mc = new moveController.MoveController(ui, qg.history);
            qg.history.list = ['0', '1', '2', '3'];
            qg.history.pos = 4;
            newHistory.list = ['0', '1', '2', '6'];
            newHistory.pos = 4;
            mc.merge(newHistory, function () {return;});
            ut.assertEq(qg.history, {pos: 4, list: ['0', '1', '2', '6']},
                "Step back and new move; pos is in same place");

            qg.history.list = ['0', '1', '2'];
            qg.history.pos = 3;
            newHistory.list = ['0', '1', '2', '3'];
            newHistory.pos = 4;
            mc.merge(newHistory, function () {return;});
            ut.assertEq(qg.history, {pos: 4, list: ['0', '1', '2', '3']},
                "Load 1 new move");

            qg.history.list = ['0', '1', '2'];
            qg.history.pos = 3;
            newHistory.list = ['0', '1', '2', '3'];
            newHistory.pos = 3;
            mc.merge(newHistory, function () {return;});
            ut.assertEq(qg.history, {pos: 3, list: ['0', '1', '2', '3']},
                "Load 1 new move and step back");

            qg.history.list = ['0', '1', '2'];
            qg.history.pos = 3;
            newHistory.list = ['0', '1', '2'];
            newHistory.pos = 2;
            mc.merge(newHistory, function () {return;});
            ut.assertEq(qg.history, {pos: 2, list: ['0', '1', '2']},
                "Load no moves and step back once");

            qg.history.list = ['0', '1', '2', '3'];
            qg.history.pos = 4;
            newHistory.list = ['0', '1'];
            newHistory.pos = 2;
            mc.merge(newHistory, function () {return;});
            ut.assertEq(qg.history, {pos: 2, list: ['0', '1']},
                "Step back 3 do same move");

            qg.history.list = ['0', '1'];
            qg.history.pos = 1;
            newHistory.list = ['0', '1', '2', '3'];
            newHistory.pos = 4;
            mc.merge(newHistory, function () {return;});
            ut.assertEq(qg.history, {pos: 4, list: ['0', '1', '2', '3']},
                "back in history one, move forward 3");
        });
    }
    ns.addTests = addTests;
});