'use client'

import { useEffect, useRef } from 'react'

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const canvas: HTMLCanvasElement = canvasEl
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null
    if (!gl) return

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = v_texCoord;
    vec2 q = vec2(0.0);
    q.x = fbm(uv + 0.1 * u_time);
    q.y = fbm(uv + vec2(1.0));

    vec2 r = vec2(0.0);
    r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
    r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

    float f = fbm(uv + r);

    vec3 color1 = vec3(0.02, 0.05, 0.1);
    vec3 color2 = vec3(0.0, 0.2, 0.25);
    vec3 color3 = vec3(0.4, 0.6, 0.7);

    vec3 color = mix(color1, color2, clamp((f * f) * 4.0, 0.0, 1.0));
    color = mix(color, color3, clamp(length(q), 0.0, 1.0));
    color = mix(color, vec3(1.0), clamp(length(r.x), 0.0, 1.0) * 0.1);

    gl_FragColor = vec4(color * (f * f * f + 0.6 * f * f + 0.5 * f), 1.0);
}`

    function syncSize(c: HTMLCanvasElement) {
      const w = c.clientWidth || 1280
      const h = c.clientHeight || 720
      if (c.width !== w || c.height !== h) {
        c.width = w
        c.height = h
      }
    }

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => syncSize(canvas)).observe(canvas)
    }
    syncSize(canvas)

    const createShader = (type: number, src: string) => {
      const s = gl!.createShader(type)
      if (!s) return null
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    if (!prog) return
    const vsh = createShader(gl.VERTEX_SHADER, vs)
    const fsh = createShader(gl.FRAGMENT_SHADER, fs)
    if (!vsh || !fsh) return
    gl.attachShader(prog, vsh)
    gl.attachShader(prog, fsh)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')

    const render = (t: number) => {
      if (typeof ResizeObserver === 'undefined') syncSize(canvas)
      gl!.viewport(0, 0, canvas.width, canvas.height)
      if (uTime) gl!.uniform1f(uTime, t * 0.001)
      if (uRes) gl!.uniform2f(uRes, canvas.width, canvas.height)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      requestAnimationFrame(render)
    }
    render(0)

    return () => {
      const loseContext = gl!.getExtension('WEBGL_lose_context')
      if (loseContext) loseContext.loseContext()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-60 bg-slate-950"
      style={{ zIndex: 0 }}
    />
  )
}
