/*
* File: InfoHypertree.js
*/

Complex.prototype.moebiusTransformation = function(c) {
  var num = this.add(c);
  var den = c.$conjugate().$prod(this);
  den.x++;
  return num.$div(den);
};

Graph.Util.moebiusTransformation = function(graph, pos, prop, startPos, flags) {
  this.eachNode(graph, function(elem) {
    for ( var i = 0; i < prop.length; i++) {
      var p = pos[i].scale(-1), property = startPos ? startPos : prop[i];
      elem.getPos(prop[i]).set(elem.getPos(property).getc().moebiusTransformation(p));
    }
  }, flags);
};

$jit.InfoHypertree = new Class( {
    Implements: [ Loader, Extras, Layouts.Radial ],

    initialize: function(controller) {
        var $InfoHypertree = $jit.InfoHypertree;

        var config = {
            radius: "auto",
            offset: 0.25,
            Edge: {
                type: 'hyperline'
            },
            duration: 800,
            fps: 24,
            levelsToShow: 2
        };
        this.controller = this.config = $.merge(Options("Canvas", "Node", "Edge",
            "Fx", "Tips", "NodeStyles", "Events", "Navigation", "Controller", "Label"), config, controller);

        var canvasConfig = this.config;
        if(canvasConfig.useCanvas) {
            this.canvas = canvasConfig.useCanvas;
            this.config.labelContainer = this.canvas.id + '-label';
        } else {
            if(canvasConfig.background) {
                canvasConfig.background = $.merge({
                    type: 'Circles'
                }, canvasConfig.background);
            }
            this.canvas = new Canvas(this, canvasConfig);
            this.config.labelContainer = (typeof canvasConfig.injectInto == 'string'? canvasConfig.injectInto : canvasConfig.injectInto.id) + '-label';
        }

        this.graphOptions = {
            'klass': Polar,
            'Node': {
                'selected': false,
                'exist': true,
                'drawn': true
            }
        };
        this.graph = new Graph(this.graphOptions, this.config.Node, this.config.Edge);
        this.labels = new $InfoHypertree.Label[canvasConfig.Label.type](this);
        this.fx = new $InfoHypertree.Plot(this, $InfoHypertree);
        this.op = new $InfoHypertree.Op(this);
        this.json = null;
        this.root = null;
        this.busy = false;
        // initialize extras
        this.initializeExtras();
    },

    refresh: function(reposition) {
        if (reposition) {
            this.reposition();
            this.graph.eachNode(function(node) {
                node.startPos.rho = node.pos.rho = node.endPos.rho;
                node.startPos.theta = node.pos.theta = node.endPos.theta;
            });
        } else {
            this.compute();
        }
        this.plot();
    },

    reposition: function() {
        this.compute('end');
        var vector = this.graph.getNode(this.root).pos.getc().scale(-1);
        Graph.Util.moebiusTransformation(this.graph, [ vector ], [ 'end' ], 'end', "ignore");
        this.graph.eachNode(function(node) {
            if (node.ignore) {
                node.endPos.rho = node.pos.rho;
                node.endPos.theta = node.pos.theta;
            }
        });
    },

    createLevelDistanceFunc: function() {
        // get max viz. length.
        var r = this.getRadius();
        // get max depth.
        var depth = 0, max = Math.max, config = this.config;
        this.graph.eachNode(function(node) {
            depth = max(node._depth, depth);
        }, "ignore");
        depth++;
        // node distance generator
        var genDistFunc = function(a) {
            return function(node) {
                node.scale = r;
                var d = node._depth + 1;
                var acum = 0, pow = Math.pow;
                while (d) {
                    acum += pow(a, d--);
                }
                return acum - config.offset;
            };
        };
        // estimate better edge length.
        for ( var i = 0.51; i <= 1; i += 0.01) {
            var valSeries = (1 - Math.pow(i, depth)) / (1 - i);
            if (valSeries >= 2) { return genDistFunc(i - 0.01); }
        }
        return genDistFunc(0.75);
    },

    requestNodes: function(node, onComplete) {
        var lev = this.config.levelsToShow,
            leaves = [], d = node._depth;

        node.eachLevel(0, lev, function(n) {
            leaves.push(n);
            n._level = lev - (n._depth - d);
        });

        onComplete();
    },

    expandNodes: function() {
        //expand requested nodes
    },

    selectPath: function(node) {
        var that = this;
        this.graph.eachNode(function(n) { n.selected = false; });
        function path(node) {
            if(node == null || node.selected) return;
            node.selected = true;
            var parents = node.getParents();
            parents = (parents.length > 0)? parents[0] : null;
            path(parents);
        };
        path(node);
    },

    getRadius: function() {
        var rad = this.config.radius;
        if (rad !== "auto") { return rad; }
        var s = this.canvas.getSize();
        return Math.min(s.width, s.height) / 2;
    },

    plot: function() {
        this.fx.plot();
    },

    onClick: function(id, opt) {
        var node = this.graph.getNode(id);
        this.selectPath(node);
        var pos = node.pos.getc(true);
        this.move(pos, opt);
    },

    move: function(pos, opt) {
        var versor = $C(pos.x, pos.y);
        if (this.busy === false && versor.norm() < 1) {
            this.busy = true;
            var root = this.graph.getClosestNodeToPos(versor), that = this;
            this.graph.computeCurrentDepth(root.id, 0);
            this.controller.onBeforeCompute(root);
            opt = $.merge( {
                onComplete: $.empty
            }, opt || {});
            this.fx.animate($.merge( {
                modes: ['moebius'],
                hideLabels: true
            }, opt, {
                onComplete: function() {
                    that.busy = false;
                    opt.onComplete();
                    that.contractNodes();
                }
            }), versor);
        }
    },

    contractNodes: function() {
        var map = [];

        this.graph.eachNode(function(node){
            if (node._currentDepth > 3) {
                map.push(node.id);
            }
        });

        this.op.removeNode(map.reverse(), {
            type: 'fade:con',
            duration: 500,
            hideLabels: false
        });
    },
});

$jit.InfoHypertree.$extend = true;

(function(InfoHypertree) {

    InfoHypertree.Op = new Class( {
        Implements: Graph.Op
    });

    InfoHypertree.Plot = new Class( {
        Implements: Graph.Plot
    });

    InfoHypertree.Label = {};

    InfoHypertree.Label.HTML = new Class( {
        Implements: Graph.Label.HTML,

        initialize: function(viz) {
            this.viz = viz;
        },

        placeLabel: function(tag, node, controller) {
            var pos = node.pos.getc(true), 
            canvas = this.viz.canvas,
            ox = canvas.translateOffsetX,
            oy = canvas.translateOffsetY,
            sx = canvas.scaleOffsetX,
            sy = canvas.scaleOffsetY,
            radius = canvas.getSize(),
            r = this.viz.getRadius();
            var labelPos = {
                x: Math.round((pos.x * sx) * r + ox + radius.width / 2),
                y: Math.round((pos.y * sy) * r + oy + radius.height / 2)
            };
            var style = tag.style;
            style.left = labelPos.x + 'px';
            style.top = labelPos.y + 'px';
            style.display = this.fitsInCanvas(labelPos, canvas) ? '' : 'none';

            controller.onPlaceLabel(tag, node);
        }
    });

    InfoHypertree.Plot.NodeTypes = new Class({
        'none': {
            'render': $.empty,
            'contains': $.lambda(false)
        },
        'circle': {
            'render': function(node, canvas) {
                var nconfig = this.node,
                dim = node.getData('dim'),
                p = node.pos.getc();
                dim = nconfig.transform? dim * (1 - p.squaredNorm()) : dim;
                p.$scale(node.scale);
                if (dim > 0.2) {
                    this.nodeHelper.circle.render('fill', p, dim, canvas);
                }
            },
            'contains': function(node, pos) {
                var dim = node.getData('dim'),
                npos = node.pos.getc().$scale(node.scale);
                return this.nodeHelper.circle.contains(npos, pos, dim);
            }
        },
        'ellipse': {
            'render': function(node, canvas) {
                var pos = node.pos.getc().$scale(node.scale),
                width = node.getData('width'),
                height = node.getData('height');
                this.nodeHelper.ellipse.render('fill', pos, width, height, canvas);
            },
            'contains': function(node, pos) {
                var width = node.getData('width'),
                height = node.getData('height'),
                npos = node.pos.getc().$scale(node.scale);
                return this.nodeHelper.circle.contains(npos, pos, width, height);
            }
        },
        'square': {
            'render': function(node, canvas) {
                var nconfig = this.node,
                dim = node.getData('dim'),
                p = node.pos.getc();
                dim = nconfig.transform? dim * (1 - p.squaredNorm()) : dim;
                p.$scale(node.scale);
                if (dim > 0.2) {
                    this.nodeHelper.square.render('fill', p, dim, canvas);
                }
            },
            'contains': function(node, pos) {
                var dim = node.getData('dim'),
                npos = node.pos.getc().$scale(node.scale);
                return this.nodeHelper.square.contains(npos, pos, dim);
            }
        },
        'rectangle': {
            'render': function(node, canvas) {
                var nconfig = this.node,
                width = node.getData('width'),
                height = node.getData('height'),
                pos = node.pos.getc();
                width = nconfig.transform? width * (1 - pos.squaredNorm()) : width;
                height = nconfig.transform? height * (1 - pos.squaredNorm()) : height;
                pos.$scale(node.scale);
                if (width > 0.2 && height > 0.2) {
                    this.nodeHelper.rectangle.render('fill', pos, width, height, canvas);
                }
            },
            'contains': function(node, pos) {
                var width = node.getData('width'),
                height = node.getData('height'),
                npos = node.pos.getc().$scale(node.scale);
                return this.nodeHelper.rectangle.contains(npos, pos, width, height);
            }
        },
        'triangle': {
            'render': function(node, canvas) {
                var nconfig = this.node,
                dim = node.getData('dim'),
                p = node.pos.getc();
                dim = nconfig.transform? dim * (1 - p.squaredNorm()) : dim;
                p.$scale(node.scale);
                if (dim > 0.2) {
                    this.nodeHelper.triangle.render('fill', p, dim, canvas);
                }
            },
            'contains': function(node, pos) {
                var dim = node.getData('dim'),
                npos = node.pos.getc().$scale(node.scale);
                return this.nodeHelper.triangle.contains(npos, pos, dim);
            }
        },
        'star': {
            'render': function(node, canvas) {
                var nconfig = this.node,
                dim = node.getData('dim'),
                p = node.pos.getc();
                dim = nconfig.transform? dim * (1 - p.squaredNorm()) : dim;
                p.$scale(node.scale);
                if (dim > 0.2) {
                    this.nodeHelper.star.render('fill', p, dim, canvas);
                }
            },
            'contains': function(node, pos) {
                var dim = node.getData('dim'),
                npos = node.pos.getc().$scale(node.scale);
                return this.nodeHelper.star.contains(npos, pos, dim);
            }
        }
    });

    InfoHypertree.Plot.EdgeTypes = new Class({
        'none': $.empty,
        'line': {
            'render': function(adj, canvas) {
                var from = adj.nodeFrom.pos.getc(true),
                to = adj.nodeTo.pos.getc(true),
                r = adj.nodeFrom.scale;
                this.edgeHelper.line.render({x:from.x*r, y:from.y*r}, {x:to.x*r, y:to.y*r}, canvas);
            },
            'contains': function(adj, pos) {
                var from = adj.nodeFrom.pos.getc(true),
                to = adj.nodeTo.pos.getc(true),
                r = adj.nodeFrom.scale;
                this.edgeHelper.line.contains({x:from.x*r, y:from.y*r}, {x:to.x*r, y:to.y*r}, pos, this.edge.epsilon);
            }
        },
        'arrow': {
            'render': function(adj, canvas) {
                var from = adj.nodeFrom.pos.getc(true),
                to = adj.nodeTo.pos.getc(true),
                r = adj.nodeFrom.scale,
                dim = adj.getData('dim'),
                direction = adj.data.$direction,
                inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id);
                this.edgeHelper.arrow.render({x:from.x*r, y:from.y*r}, {x:to.x*r, y:to.y*r}, dim, inv, canvas);
            },
            'contains': function(adj, pos) {
                var from = adj.nodeFrom.pos.getc(true),
                to = adj.nodeTo.pos.getc(true),
                r = adj.nodeFrom.scale;
                this.edgeHelper.arrow.contains({x:from.x*r, y:from.y*r}, {x:to.x*r, y:to.y*r}, pos, this.edge.epsilon);
            }
        },
        'hyperline': {
            'render': function(adj, canvas) {
                var from = adj.nodeFrom.pos.getc(),
                to = adj.nodeTo.pos.getc(),
                dim = this.viz.getRadius();
                this.edgeHelper.hyperline.render(from, to, dim, canvas);
            },
            'contains': $.lambda(false)
        }
    });

})($jit.InfoHypertree)