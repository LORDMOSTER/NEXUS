import { useEffect, useRef } from 'react';
import './MetallicPaint.css';

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform float uTime;
uniform float uSeed;
uniform float uScale;
uniform float uSpeed;
uniform float uBrightness;
uniform vec3 uLightColor;
uniform vec3 uDarkColor;
uniform vec3 uTintColor;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform bool uHasTexture;
uniform vec2 uMouse;
uniform bool uMouseAnimation;

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898 + uSeed, 4.1414 + uSeed))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = rand(i);
  float b = rand(i + vec2(1.0, 0.0));
  float c = rand(i + vec2(0.0, 1.0));
  float d = rand(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * noise(p * freq);
    freq *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 st = uv * uScale;

  // Mouse distortion
  vec2 mouseInfluence = vec2(0.0);
  if (uMouseAnimation) {
    vec2 mouseUV = uMouse / uResolution;
    float mouseDist = length(uv - mouseUV);
    mouseInfluence = (uv - mouseUV) * (1.0 / (mouseDist * 8.0 + 1.0)) * 0.15;
  }

  float t = uTime * uSpeed * 0.3;
  vec2 distorted = st + mouseInfluence * uScale;

  // Layered metallic flow
  float flow1 = fbm(distorted + vec2(t * 0.7, t * 0.4));
  float flow2 = fbm(distorted + vec2(flow1 * 1.5) + vec2(-t * 0.5, t * 0.3));
  float flow3 = fbm(distorted + vec2(flow2 * 1.2) + vec2(t * 0.3, -t * 0.6));

  // Metallic shimmer
  float shimmer = fbm(vec2(flow2 * 3.0, flow3 * 3.0) + vec2(t * 1.5));
  shimmer = pow(shimmer, 1.5);

  // Mix light and dark colors with tint
  vec3 metalColor = mix(uDarkColor, uLightColor, shimmer * uBrightness);
  metalColor = mix(metalColor, uTintColor, 0.15 * shimmer);

  // Apply image mask if available
  float alpha = 1.0;
  if (uHasTexture) {
    vec4 tex = texture2D(uTexture, uv);
    // Use luminance as mask: dark pixels in image = show metallic paint
    float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    alpha = (1.0 - luma) * tex.a;
  }

  gl_FragColor = vec4(metalColor, alpha);
}
`;

function hexToRgb(hex) {
  if (hex.startsWith('var(')) {
    // Fallback for CSS variables — use accent color
    return [0.32, 0.15, 1.0];
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [1, 1, 1];
}

export default function MetallicPaint({
  imageSrc,
  seed = 42,
  scale = 3,
  speed = 0.4,
  brightness = 1.5,
  lightColor = '#ffffff',
  darkColor = '#000000',
  tintColor = '#5227FF',
  mouseAnimation = true,
}) {
  const ctnRef = useRef(null);
  const propsRef = useRef({ imageSrc, seed, scale, speed, brightness, lightColor, darkColor, tintColor, mouseAnimation });
  const mouseRef = useRef([0, 0]);

  useEffect(() => {
    propsRef.current = { imageSrc, seed, scale, speed, brightness, lightColor, darkColor, tintColor, mouseAnimation };
  });

  useEffect(() => {
    const ctn = ctnRef.current;
    if (!ctn) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctn.appendChild(canvas);

    const resize = () => {
      canvas.width = ctn.offsetWidth;
      canvas.height = ctn.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(ctn);

    // Mouse tracking
    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [e.clientX - rect.left, canvas.height - (e.clientY - rect.top)];
    };
    ctn.addEventListener('mousemove', handleMouse);

    // Compile shaders
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uloc = (n) => gl.getUniformLocation(prog, n);
    const uTime = uloc('uTime');
    const uSeed = uloc('uSeed');
    const uScale = uloc('uScale');
    const uSpeed = uloc('uSpeed');
    const uBrightness = uloc('uBrightness');
    const uLightColor = uloc('uLightColor');
    const uDarkColor = uloc('uDarkColor');
    const uTintColor = uloc('uTintColor');
    const uResolution = uloc('uResolution');
    const uTexture = uloc('uTexture');
    const uHasTexture = uloc('uHasTexture');
    const uMouse = uloc('uMouse');
    const uMouseAnim = uloc('uMouseAnimation');

    // Enable transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Load texture
    let tex = null;
    let hasTexture = false;
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        hasTexture = true;
      };
      img.src = imageSrc;
    }

    let raf;
    const start = performance.now();
    const render = () => {
      raf = requestAnimationFrame(render);
      const p = propsRef.current;
      const t = (performance.now() - start) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTime, t);
      gl.uniform1f(uSeed, p.seed);
      gl.uniform1f(uScale, p.scale);
      gl.uniform1f(uSpeed, p.speed);
      gl.uniform1f(uBrightness, p.brightness);
      gl.uniform3fv(uLightColor, hexToRgb(p.lightColor));
      gl.uniform3fv(uDarkColor, hexToRgb(p.darkColor));
      gl.uniform3fv(uTintColor, hexToRgb(typeof p.tintColor === 'string' && p.tintColor.startsWith('var') ? '#5227FF' : p.tintColor));
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2fv(uMouse, mouseRef.current);
      gl.uniform1i(uMouseAnim, p.mouseAnimation ? 1 : 0);

      if (hasTexture && tex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(uTexture, 0);
        gl.uniform1i(uHasTexture, 1);
      } else {
        gl.uniform1i(uHasTexture, 0);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ctn.removeEventListener('mousemove', handleMouse);
      if (ctn.contains(canvas)) ctn.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [imageSrc]);

  return <div ref={ctnRef} className="paint-container" />;
}
