var ws = new WebSocket("ws://localhost:8888/leapsocket");

ws.onmessage = function (evt) {
    if (evt.data) {
        var leap_msg = JSON.parse(evt.data);
        // console.log(leap_msg);
        window.processingInstance.handle_frame(leap_msg);
    }
};

function scale(val, min, max, newrange) {
    return ((Math.abs(min)+val)/(Math.abs(min)+max)) * newrange;
}

function scale_x_to_sketch(processing, x) {
    return scale(x, -250, 250, processing.width);
}

function scale_y_to_sketch(processing, x) {
    return processing.height-scale(x, 0, 600, processing.height);
}

function scale_z_to_sketch(processing, x) {
    return 50-scale(x, -200, 200, 50);
}

function Fingertip(ftip_id, initial_x, initial_y, initial_z) {
    this.id = ftip_id;
    this.x = initial_x;
    this.y = initial_y;
    this.z = initial_z;

    this.update = function(new_x, new_y, new_z) {
        this.x = new_x;
        this.y = new_y;
        this.z = new_z;
    };

    this.draw = function (processing) {
        this.radius = this.z + Math.sin( processing.frameCount / 4 );
        
        // Set fill-color to blue
        processing.fill( 0, 121, 184 );

        // Set stroke-color white
        processing.stroke(255);

        // Draw circle
        processing.ellipse( scale_x_to_sketch(processing, this.x),
                            scale_y_to_sketch(processing, this.y),
                            scale_z_to_sketch(processing, this.radius),
                            scale_z_to_sketch(processing, this.radius)
                        );
    };

}

function sketchProc(processing) {
    var active_fingertips = {};
    var active_fingertip_ids;
    var last_fingertip_ids = new Array();
    var current_fingertip;

    processing.handle_frame = function(frame_object) {
        if (frame_object['state'] == 'frame') {
            var frame = frame_object['frame'];
            active_fingertip_ids = new Array();
            if (frame) {
                var hands = frame_object['frame']['hands'];
                if (hands.length > 0) {
                    for (var h = 0; h < hands.length; h++) {
                        var fingers = hands[h]['fingers'];
                        for (var f = 0; f < fingers.length; f++) {
                            var finger_id = fingers[f]['id'];
                            var position = fingers[f]['tip']['position'];
                            active_fingertip_ids.push(finger_id);
                            if (finger_id in active_fingertips) {
                                active_fingertips[finger_id].update(position.x, position.y, position.z);
                            } else {
                                active_fingertips[finger_id] = new Fingertip(finger_id, position.x, position.y, position.z)
                            }
                        }
                        for (var f=0; f < last_fingertip_ids.length; f++) {
                            if (active_fingertip_ids.indexOf(last_fingertip_ids[f]) == -1) {
                                delete active_fingertips[last_fingertip_ids[f]];
                            }
                        }
                        last_fingertip_ids = active_fingertip_ids;
                    }
                }
            }
        }
    }
    // Override draw function, by default it will be called 60 times per second
    processing.draw = function() {
        // Fill canvas grey
        processing.background( 100 );

        active_fingertip_ids = Object.keys(active_fingertips);
        for (var fingertip_index = 0; fingertip_index < active_fingertip_ids.length; fingertip_index++) {
            current_fingertip = active_fingertips[active_fingertip_ids[fingertip_index]];
            current_fingertip.draw(processing);
        }
    };

    processing.setup = function() {
        processing.frameRate( 0 );
        processing.size(800, 600);
        // test sketch
        // active_fingertips[0] = new Fingertip(0, 200, 200, 50);
        // active_fingertips[1] = new Fingertip(0, 300, 300, 50);
    }
}



/*
 * here is what a frame looks like:
 *
 {'frame:': {'hands': [{'ball': {'position': {'x': 22.71733637161995,
                                              'y': 115.99162345748401,
                                              'z': 64.50758543285055},
                                 'radius': 71.37008156658723},
                        'fingers': [{'id': 9,
                                     'isTool': False,
                                     'length': 52.964647113315,
                                     'tip': {'direction': {'x': 0.4059596340095603,
                                                           'y': -0.07345826739060557,
                                                           'z': 0.910933948487372},
                                             'position': {'x': 58.286546883759364,
                                                          'y': 152.8845882392409,
                                                          'z': 26.75554610324615}},
                                     'velocity': {'x': 24.171925795548603,
                                                  'y': -34.733371071296204,
                                                  'z': 29.490362225243494},
                                     'width': 18.818729336397684},
                                    {'id': 7,
                                     'isTool': False,
                                     'length': 68.07442650239554,
                                     'tip': {'direction': {'x': 0.4887227447575534,
                                                           'y': -0.31345687839772873,
                                                           'z': 0.8141835567866713},
                                             'position': {'x': 26.692411168742755,
                                                          'y': 184.60810795685376,
                                                          'z': 29.51924435648845}},
                                     'velocity': {'x': 68.95620886030555,
                                                  'y': 26.20973709660228,
                                                  'z': -0.7252201610989181},
                                     'width': 20.003295926634777},
                                    {'id': 11,
                                     'isTool': False,
                                     'length': 72.90874796925297,
                                     'tip': {'direction': {'x': 0.6190567008866198,
                                                           'y': -0.4602612469750887,
                                                           'z': 0.6363398350098087},
                                             'position': {'x': -7.498542962562899,
                                                          'y': 202.08670229280577,
                                                          'z': 62.38037849873577}},
                                     'velocity': {'x': 99.85007735839056,
                                                  'y': 138.88384536380298,
                                                  'z': 50.52531378261618},
                                     'width': 19.065572536366393},
                                    {'id': 4,
                                     'isTool': False,
                                     'length': 56.93301333594154,
                                     'tip': {'direction': {'x': 0.7042777358587443,
                                                           'y': -0.3091416674777065,
                                                           'z': 0.6390808244680667},
                                             'position': {'x': -24.76360907192442,
                                                          'y': 171.17902563184475,
                                                          'z': 84.04124353366929}},
                                     'velocity': {'x': 79.70819134829823,
                                                  'y': 120.19343886818633,
                                                  'z': 23.157672693564678},
                                     'width': 19.020009385056106}],
                        'id': 3,
                        'normal': {'x': -0.4263015731593105,
                                   'y': -0.7084138971045406,
                                   'z': -0.5316666563574375},
                        'palm': {'direction': {'x': 0.439561910156307,
                                               'y': -0.6377136440660444,
                                               'z': 0.5955047546280996},
                                 'position': {'x': 48.439201977291745,
                                              'y': 145.78843422112192,
                                              'z': 87.20149981432914}},
                        'velocity': {'x': -48.790513171761,
                                     'y': -132.33014338148314,
                                     'z': -30.765736144594197}}],
             'id': 515188,
             'timestamp': 6587327641},
  'state': 'frame'}
 */
