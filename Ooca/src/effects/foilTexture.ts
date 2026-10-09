import fragmentSource from './foil-texture.frag?raw';

// Port of the approved silver-foil-motion-4x preview (9 Oct 2026).
// 4x is already included here: 0.09 * 4, never multiplied again.
export const FOIL_MOTION = { speed: .36, strength: .85, fps: 30, maxDpr: 1.5, maxPixels: 1_400_000 } as const;

export function createFoilTexture(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: true,
  });
  if (!gl || gl.isContextLost()) throw new Error('Foil WebGL unavailable');
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  const dispose = () => {
    shaders.splice(0).forEach(shader => gl.deleteShader(shader));
    if (texture) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    texture = buffer = program = null;
  };
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Foil shader unavailable');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Foil shader could not compile');
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, 'attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}');
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    if (!program) throw new Error('Foil program unavailable');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Foil program could not link');
    gl.useProgram(program);
    shaders.splice(0).forEach(shader => gl.deleteShader(shader));
    buffer = gl.createBuffer();
    texture = gl.createTexture();
    if (!buffer || !texture) throw new Error('Foil resources unavailable');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // Upload failures (e.g. texture size/memory limits) should leave the CSS image intact.
    if (gl.getError() !== gl.NO_ERROR) throw new Error('Foil texture upload failed');
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    gl.uniform1f(gl.getUniformLocation(program, 'u_imageAspect'), image.naturalWidth / image.naturalHeight);
    gl.uniform1f(gl.getUniformLocation(program, 'u_strength'), FOIL_MOTION.strength);
    const locations = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      position: gl.getUniformLocation(program, 'u_position'),
      time: gl.getUniformLocation(program, 'u_time'),
    };
    return {
      draw(time: number, x: number, y: number) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);
        gl.uniform2f(locations.resolution, canvas.width, canvas.height);
        gl.uniform2f(locations.position, x, y);
        gl.uniform1f(locations.time, time);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose,
    };
  } catch (error) { dispose(); throw error; }
}
