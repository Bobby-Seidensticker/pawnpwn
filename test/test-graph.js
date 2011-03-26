/*globals namespace console window $ */
/*jslint white: true, browser: true, devel: true 
  debug: true, undef: true nomen: true, regexp: true
  newcap: true, immed: true, maxerr: 100, maxlen: 100*/

namespace.lookup('com.pageforest.graph.test').defineOnce(function (ns) {
    var graph = namespace.lookup('com.pageforest.graph');
    var base = namespace.lookup('org.startpad.base');

    function addTests(ts) {
        ts.addTest("graphin'", function (ut) {
            var graph = new graph.GraphLines();
            
        });
    }
    ns.addTests = addTests;
});