(function() {
    require('angular/angular');

    function SheetDataService(GridSelectorService) {
        var map = {},

            getScript = function(x, y) { 
                if(x in map) {
                    if(y in map[x]) {
                        return map[x][y].src;
                    }
                }

                return null;
            },

            setScript = function(x, y, script) { 
                if(!(x in map)) {
                    map[x] = {};
                    map[x][y] = { src: script };
                }

                if(!(y in map[x])) {
                    map[x][y] = { src: script };
                } else {
                    map[x][y].src = script;
                }
            },

            getValue = function(x, y) {
                if(x in map) {
                    if(y in map[x]) {
                        return map[x][y].val;
                    }
                }

                return null;
            },

            mapFromCoordSet = function(set, f) {
                console.log(map);
                var results = [];
                for(var i = 0; i < set.length; i++) {

                    if(set[i].type == 'row') {
                        for(var y = set[i].start; y <= set[i].end; y++) {
                            for(x in map) {
                                var r = f(x, y);
                                if(r) {
                                    results.push(r);
                                }
                            }
                        }
                    } else if(set[i].type == 'col') {
                        for(var x = set[i].start; x <= set[i].end; x++) {
                            for(y in map[x]) {
                                var r = f(x, y);
                                if(r) {
                                    results.push(r);
                                }
                            }
                        }
                    } else if(set[i].type == 'cell') {
                        for(var y = set[i].start.y; y <= set[i].end.y; y++) {
                            for(var x = set[i].start.x; x <= set[i].end.x; x++) {
                                var r = f(x, y);
                                console.log(x, y, r);
                                if(r) {
                                    results.push(r);
                                }
                            }
                        }
                    }

                }

                return results;
            },

            mapValuesFromCoordSet = function(set) {
                return mapFromCoordSet(set, getValue);
            };

        return {
            getScript: function(x, y) {
                return getScript(x, y);
            },

            getScriptBySel: function(sel) {
                var coordSet = GridSelectorService.toCoordSet(sel);
                if(coordSet.count == 1) {
                    var x = coordSet.col,
                        y = coordSet.rowStart;

                    return getScript(x, y);
                } else if(coordSet.count > 1) {

                }
            },

            getValue: function(x, y) {
                return getValue(x, y);
            },

            getValueBySel: function(sel) {
                var coordSet = GridSelectorService.toCoordSet(sel);

                return mapValuesFromCoordSet(coordSet);
            },

            setScript: function(x, y, script) {
                setScript(x, y, script);
            },

            setScriptBySel: function(sel, script) {
                var coordSet = GridSelectorService.toCoordSet(sel);
                if(coordSet.count == 1) {
                    var x = coordSet.col,
                        y = coordSet.rowStart;

                    return setScript(x, y, script);
                }

            },

            computeValues: function() {
                var that = this;

                angular.forEach(map, function(x) {
                    angular.forEach(x, function(y) {
                        var f   = new Function('G', 'R', y.src);
                        var val = f(that.getValue, that.getValueBySel);

                        if(val instanceof Promise) {
                            val.then((v) => y.val = v).catch((e) => console.error(e));
                        } else {
                            y.val = val;
                        }
                    });
                });
            },

            saveToLocalStorage: function() {
                window.localStorage.setItem('sheet1', JSON.stringify(map));
            },

            loadFromLocalStorage: function() {
                var savedMap = window.localStorage.getItem('sheet1');
                if (savedMap !== null) {
                    console.log(savedMap);
                    map = JSON.parse(savedMap);
                }
            }
        };
    }

    angular
        .module('jGrid')
        .factory('SheetDataService', SheetDataService);

})();