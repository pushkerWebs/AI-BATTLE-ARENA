import { useRef, useEffect } from 'react'

// WebGL shader initialization and render loop helper
function initShader(canvas) {
  let rafId = null
  let resizeObserver = null

  const sync = () => {
    const w = canvas.clientWidth  || 1280
    const h = canvas.clientHeight || 720
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w
      canvas.height = h
    }
  }

  resizeObserver = new ResizeObserver(sync)
  resizeObserver.observe(canvas)
  sync()

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  if (!gl) return { cleanup: () => resizeObserver?.disconnect() }

  // Vertex shader
  const vs = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `
  // Fragment shader — dark smoke/nebula
  const fs = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2  u_resolution;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = v_texCoord;
      float n = 0.0;
      vec2 p  = uv * 3.0;
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        n   += noise(p + u_time * 0.05) * amp;
        p   *= 2.0;
        amp *= 0.5;
      }
      vec3 color1 = vec3(0.035, 0.035, 0.035);
      vec3 color2 = vec3(0.05,  0.05,  0.06);
      vec3 fc     = mix(color1, color2, n);
      float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5));
      gl_FragColor = vec4(fc * vignette, 1.0);
    }
  `

  const mkShader = (type, src) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    return shader
  }

  const prog = gl.createProgram()
  const vsShader = mkShader(gl.VERTEX_SHADER, vs)
  const fsShader = mkShader(gl.FRAGMENT_SHADER, fs)
  if (vsShader) gl.attachShader(prog, vsShader)
  if (fsShader) gl.attachShader(prog, fsShader)
  gl.linkProgram(prog)

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog))
  }

  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

  const pos = gl.getAttribLocation(prog, 'a_position')
  gl.enableVertexAttribArray(pos)
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

  const uTime = gl.getUniformLocation(prog, 'u_time')
  const uRes  = gl.getUniformLocation(prog, 'u_resolution')

  const render = (t) => {
    sync()
    gl.viewport(0, 0, canvas.width, canvas.height)
    if (uTime) gl.uniform1f(uTime, t * 0.001)
    if (uRes)  gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    rafId = requestAnimationFrame(render)
  }
  render(0)

  return {
    cleanup: () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }
}

// WebGL animated dark-smoke / nebula shader background
export default function ShaderBg() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    let cleanupFn = null
    let isCancelled = false
    let idleHandle = null
    let raf1 = null
    let raf2 = null

    const runInit = () => {
      if (isCancelled) return
      const res = initShader(canvas)
      if (res) {
        cleanupFn = res.cleanup
      }
    }

    // Yield main thread to allow browser to perform first paint (layout & CSS styles)
    if (typeof requestIdleCallback === 'function') {
      idleHandle = requestIdleCallback(() => runInit(), { timeout: 1000 })
    } else {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          runInit()
        })
      })
    }

    return () => {
      isCancelled = true
      if (idleHandle !== null) cancelIdleCallback(idleHandle)
      if (raf1 !== null) cancelAnimationFrame(raf1)
      if (raf2 !== null) cancelAnimationFrame(raf2)
      if (cleanupFn) cleanupFn()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
