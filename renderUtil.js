function createRayRenderer (output, vertCode, fragCode){
    //get the output res
    var width = output.width;
    var height = output.height;

    var res = [width, height];

    //get the webgl context
    var gl = output.getContext("webgl", {preserveDrawingBuffer: true});

    if(!gl) alert("Your browser doesn't support WEBGL");

    //create a webgl program
    var program = gl.createProgram();

    //create the vertex shader
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);
    gl.attachShader(program, vertShader);

    //create fragment shader
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);
    gl.attachShader(program, fragShader);

    //link the program
    gl.linkProgram(program);

    //find the uniform and attribute positions
    var posLoc = gl.getAttribLocation(program, "a_position");
    var timeLoc = gl.getUniformLocation(program, "u_time");
    var resLoc = gl.getUniformLocation(program, "u_res");

    //create a position buffer
    var posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    //coords define two triangles that cover the screen
    var positions = [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1];

    gl.bufferData(
        gl.ARRAY_BUFFER, 
        new Float32Array(positions), gl.STATIC_DRAW
    );

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);

    gl.uniform2fv(resLoc, res);

    var renderId = window.parent.renderId + 1 || 0;
    window.parent.renderId = renderId;

    var render = time => {
        //clear the scene
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        //draw the scene
        gl.uniform1f(timeLoc, time);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    var loop = time => {
        render(time);
        if(loop.id === window.parent.renderId){
            requestAnimationFrame(loop)
        } else {
            console.log("Loop stoped", loop.id)
        }
    };
    loop.id = renderId;

    return {
        render: render,
        loop: loop,
        gl: gl,
        shader: fragShader,
        program: program
    };
}