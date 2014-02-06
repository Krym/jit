function init() {
    var json = {
        'id': '1-1',
        'name': 'User',
        'data': {
            'depth': 0
        },
        'children': [{
            'id': '2-1',
            'name': 'Slovakia',
            'data': {
                'depth': 1,
            },
            'children': [{
                'id': '3-1',
                'name': 'Bratislava',
                'data': {
                    'depth': 2
                },
                'children': [{
                    'id': '4-1',
                    'name': 'Lorem',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-2',
                    'name': 'Ipsum',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-3',
                    'name': 'Dolor',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                }]
            },{
                'id': '3-2',
                'name': 'Piešťany',
                'data': {
                    'depth': 2
                },
                'children': [{
                    'id': '4-4',
                    'name': 'Lorem',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-5',
                    'name': 'Ipsum',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-6',
                    'name': 'Dolor',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                }]
            },
            {
                'id': '3-3',
                'name': 'Nové Mesto nad Váhom',
                'data': {
                    'depth': 2
                },
                'children': [{
                    'id': '4-7',
                    'name': 'Lorem',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-8',
                    'name': 'Ipsum',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-9',
                    'name': 'Dolor',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                }]
            },
            {
                'id': '3-4',
                'name': 'Košice',
                'data': {
                    'depth': 2
                },
                'children': [{
                    'id': '4-10',
                    'name': 'Lorem',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-11',
                    'name': 'Ipsum',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-12',
                    'name': 'Dolor',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                }]
            },
            {
                'id': '3-5',
                'name': 'Žilina',
                'data': {
                    'depth': 2
                },
                'children': [{
                    'id': '4-13',
                    'name': 'Lorem',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-14',
                    'name': 'Ipsum',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-15',
                    'name': 'Dolor',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                }]
            },
            {
                'id': '3-6',
                'name': 'Banská Bystrica',
                'data': {
                    'depth': 2
                },
                'children': [{
                    'id': '4-16',
                    'name': 'Lorem',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-17',
                    'name': 'Ipsum',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                },{
                    'id': '4-18',
                    'name': 'Dolor',
                    'data': {
                        'depth': 3
                    },
                    'children': []
                }]
            }]
        },{
            'id': '2-2',
            'name': 'Germany',
            'data': {
                'depth': 1
            },
            'children': [
            {
                'id': '3-7',
                'name': 'Berlin',
                'data': {
                    'depth': 2
                },
                'children': []
            },
            {
                'id': '3-8',
                'name': 'Hamburg',
                'data': {
                    'depth': 2
                },
                'children': []
            },]
        },{
            'id': '2-3',
            'name': 'Czech Republic',
            'data': {
                'depth': 1
            },
            'children': [
            {
                'id': '3-9',
                'name': 'Praha',
                'data': {
                    'depth': 2
                },
                'children': []
            },
            {
                'id': '3-10',
                'name': 'Brno',
                'data': {
                    'depth': 2
                },
                'children': []
            },
            {
                'id': '3-11',
                'name': 'Český Krumlov',
                'data': {
                    'depth': 2
                },
                'children': []
            },]
        }]
    };

    var bgcolors = [
        "#f89406", 
        "#468847",
        "#b94a48",
        "#3a87ad",
        "#555555",
        "#123456",
        "#654321",
        "#3399ff",
        "#abcdef",
        "#fedcba",
        "#999999"
    ];

    var addJson = function(id){
        var childs = Math.round(Math.random()*4) + 1;
        var response = []
        for (var i=1; i <= childs; i++) {
            var gid = "" + Math.floor(Math.random()*100) + "-" + Math.floor(Math.random()*100) + "-" + Math.floor(Math.random()*100) + "-" + Math.floor(Math.random()*100);
            response.push({
                adjacencies: [id],
                name: gid,
                id: gid,
                data: {}
            });
        }
        return response;
    }

    var infovis = document.getElementById('infovis');
    var w = infovis.offsetWidth - 50, h = infovis.offsetHeight - 50;

    var iht = new $jit.InfoHypertree({
        injectInto: 'infovis',

        Node: {
            overridable: true,
            type: 'none'
        },

        Label: {

        },

        Edge: {
            overridable: true,
            lineWidth: 1.5,
            dim: 100,
            color: "#dddddd"
        },

        onCreateLabel: function(label, node) {
            label.id = node.id; 
            var that = this,
                $el = $(label);
            node.$label = $el;

            var bgcolor = bgcolors[node._originalDepth] || bgcolors[node._originalDepth % bgcolors.length];

            $el.css('background-color', bgcolor);
            
            $jit.util.addEvent(label, 'click', function () {

                var isFinalNode = node.getSubnodes().length < 2;

                iht.onClick(node.id, {
                    hideLabels: false,
                    onComplete: function() {
                        var subnodes = node.getSubnodes(1);
                        subnodes.forEach(function(n) {

                            if (n.getSubnodes(1).length < 1 && n._depth <= 2) {
                                var sum = addJson(n.id);
                                iht.op.sum(sum, {
                                    type: 'smooth',
                                    duration: 500,
                                    hideLabels: false,
                                    depth: n._originalDepth
                                });

                            }
                        });
                        iht.controller.onComplete();
                    }
                });

            });

            // $jit.util.addEvent(label, 'mouseover', function() {
            //     console.log(node);
            // })
        },

        onBeforePlotNode: function(node) {
            if (node.$label) {
                if (node.selected) {
                    node.$label.addClass('selected');
                } else {
                    node.$label.removeClass('selected');
                }
            }
        },

        onBeforePlotLine: function(adj){
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#aaa";
                adj.data.$lineWidth = 3;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }

    });

    //load JSON data.
    iht.loadJSON(json);
    //compute positions and plot.
    iht.refresh();
    //end
    iht.controller.onComplete();

}