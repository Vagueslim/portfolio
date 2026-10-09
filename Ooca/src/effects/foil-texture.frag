precision highp float;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_imageAspect;
uniform vec2 u_position;
uniform float u_time;
uniform float u_strength;

void main() {
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float viewAspect=u_resolution.x/u_resolution.y;
  vec2 fit=vec2(min(1.0,viewAspect/u_imageAspect),min(1.0,u_imageAspect/viewAspect));
  // Broad, continuous deformation. At time zero the reference image is intact.
  float t=u_time;
  float dy=(sin(uv.x*4.8+uv.y*2.3+t)-sin(uv.x*4.8+uv.y*2.3))*0.030;
  dy+=(sin(uv.x*2.4-uv.y*3.1-t*0.63)-sin(uv.x*2.4-uv.y*3.1))*0.012;
  float dx=(sin(uv.y*5.2-uv.x*1.6+t*0.72)-sin(uv.y*5.2-uv.x*1.6))*0.016;
  dx+=sin(t*0.42)*0.008;
  // Fade deformation at image boundaries so no empty or stretched edges appear.
  vec2 edge=smoothstep(vec2(0.0),vec2(0.12),uv)*smoothstep(vec2(0.0),vec2(0.12),1.0-uv);
  vec2 displaced=uv+vec2(dx,dy)*edge*u_strength;
  // Equivalent to centered cover in the preview; also preserves the site's 48% mobile crop.
  vec2 texUV=displaced*fit+(1.0-fit)*u_position;
  vec3 color=texture2D(u_texture,texUV).rgb;
  // Very subtle change in reflected light, attached to the silver surface.
  float light=(sin(uv.x*3.0+uv.y*3.6+t*0.65)-sin(uv.x*3.0+uv.y*3.6))*0.016*u_strength;
  color+=light;
  gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);
}
