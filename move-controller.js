/*globals namespace console window $*/
/*jslint white: true, browser: true, devel: true, onevar: false
  debug: true, undef: true nomen: true, regexp: true 
  newcap: true, immed: true, maxerr: 100, maxlen: 100*/

  /* history must be in the format {
   *    pos: 0;
   *    list: [{'game specific move data'}, {'...'}, ...];
   * }
   */

namespace.lookup('com.pageforest.move-controller').defineOnce(function (ns) {
    var base = namespace.lookup('org.startpad.base');

    function MoveController(ui, history) {
        this.ui = ui;
        this.history = history;
    }

    MoveController.methods({
        merge: function (newHistory, fnComplete) {
            var self = this;
            var n, shortestList;
            var longestPrefix = 0;
            shortestList = Math.min(this.history.list.length, newHistory.list.length);
            if (this.history.pos < shortestList) {
                shortestList = this.history.pos;
            }
            for (n = 0; n < shortestList; n++) {
                if (base.isEqual(this.history.list[n], newHistory.list[n])) {
                    longestPrefix = n + 1;
                } else {
                    break;
                }
            }
            console.log("longestPrefix: " + longestPrefix + " this.history.pos: " + this.history.pos +
                " this.history.list.length: " + this.history.list.length +  " newHistory.pos: " + newHistory.pos +
                " newHistory.list.length: " + newHistory.list.length);
            this.ui.setMovePos(longestPrefix, true, function () {
                self.ui.appendMoves(newHistory);
                self.ui.setMovePos(newHistory.pos, true, fnComplete);
            });
        }
    });
    ns.extend({
        'MoveController': MoveController
    });
});