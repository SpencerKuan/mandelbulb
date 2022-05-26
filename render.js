
(function(){
    let output = document.querySelector("#output");
    let driftX = 0.4, driftY = 0.3;
    let mouseIsPressed = false;
    let animate = 0;
    
    // rotation matrix for camera
    var rotation = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    let zoom = 1.0;
    
    // utility rotation matrix functions
    var rotX = x => math.matrix([
        [1, 0, 0], 
        [0, Math.cos(x), -Math.sin(x)], 
        [0, Math.sin(x), Math.cos(x)]
    ]);
    var rotY = x => math.matrix([
        [Math.cos(x), 0, Math.sin(x)], 
        [0, 1, 0], 
        [-Math.sin(x), 0, Math.cos(x)]
    ]);
    
    // utility mixing function
    let lerp = (a, b, x) => a * (1 - x) + b * x;

    // creates a new rendering context
    var init = (oid, vid, fid) => {
        var output = document.querySelector(oid);
        var vertex = document.querySelector(vid).innerHTML;
        var fragment = document.querySelector(fid).innerHTML;
        
        var outputStyle = getComputedStyle(output);
        output.width = (parseInt(outputStyle.width)*2);
        output.height = (parseInt(outputStyle.height)*2);
        
        return createRayRenderer(output, vertex, fragment);
    };
    
    // rendering object
    var run = init("#output", "#vertex", "#fragment");
    
    // location for rotation uniform
    let rotLoc = run.gl.getUniformLocation(run.program, "u_rot");
    let zoomLoc = run.gl.getUniformLocation(run.program, "u_zoom");
    let animLoc = run.gl.getUniformLocation(run.program, "u_animate");
    
    // rendering loop
    var id = (parent.id = Math.random());
    parent.render = function (){
        // update rotation
        rotation = math.multiply(rotX(driftX /= 1.1), rotation);
        rotation = math.multiply(rotY(driftY /= 1.1), rotation);
        
        // send rotation to shader
        let rot = rotation._data.flat();
        run.gl.uniformMatrix3fv(rotLoc, false, rot);
        run.gl.uniform1f(zoomLoc, zoom);
        run.gl.uniform1f(animLoc, animate);
        
        // render the shader
        run.render(Date.now() % 1000000);
        
        // loop
        if(id === parent.id) requestAnimationFrame(parent.render);
    };
    
    // output events
    Object.assign(output, {
        onmousedown: () => mouseIsPressed = true,
        onmouseup: () => mouseIsPressed = false,
        onmousemove: function(event) {
            if(!mouseIsPressed) return;
            driftX = event.movementY * 0.01 * zoom;
            driftY = event.movementX * 0.01 * zoom;
        },
        onwheel: function(event) {
            event.preventDefault();

            zoom = Math.min(Math.max(zoom - event.deltaY * -0.01, 0.5), 1.5);
        }
    });
    
    // setting events
    Object.assign(document.querySelector("#shouldAnimate"), {
        onchange: function(){
            animate = +this.checked;
        }
    });
    
    // initiate rendering
    parent.render();
})(); 