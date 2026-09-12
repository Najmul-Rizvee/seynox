/* <seynox-logo> — tiny WebGL render of the Seynox mark (navy hex bracket + orange chevron).
   Extruded geometry, glossy navy material, emissive orange chevron, slow Y oscillation,
   periodic specular sweep. Falls back to a generated SVG when WebGL or motion is unavailable. */
(function () {
  if (window.customElements && customElements.get('seynox-logo')) return;

  var NAVY = [0.078, 0.098, 0.231];   // #14193B
  var ORANGE = [0.961, 0.510, 0.122]; // #F5821F

  // --- 2D shape math -------------------------------------------------------
  var A_OUT = 0.86, THICK = 0.30, A_IN = A_OUT - THICK;
  function hexR(a, deg) { var t = ((deg % 60) + 60) % 60; if (t > 30) t -= 60; return a / Math.cos(t * Math.PI / 180); }
  function pt(a, deg) { var r = hexR(a, deg), k = deg * Math.PI / 180; return [r * Math.cos(k), r * Math.sin(k)]; }
  function arc(a, from, to, step) {
    var out = [], n = Math.max(2, Math.ceil(Math.abs(to - from) / step));
    for (var i = 0; i <= n; i++) out.push(pt(a, from + (to - from) * (i / n)));
    return out;
  }
  var BRACKETS = [[104, 256], [284, 436]];
  var CHEVRON = [
    [[-0.78, 0.52], [0.24, 0.00], [-0.12, 0.00], [-0.78, 0.16]],
    [[-0.78, -0.52], [-0.12, 0.00], [0.24, 0.00], [-0.78, -0.16]]
  ];

  // --- geometry ------------------------------------------------------------
  function build() {
    var pos = [], nrm = [], mat = [];
    function quad(p, q, r, s, m) {
      var ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2];
      var vx = s[0] - p[0], vy = s[1] - p[1], vz = s[2] - p[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      var L = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= L; ny /= L; nz /= L;
      var tri = [p, q, r, p, r, s];
      for (var i = 0; i < 6; i++) { pos.push(tri[i][0], tri[i][1], tri[i][2]); nrm.push(nx, ny, nz); mat.push(m); }
    }
    function extrude(outer, inner, d, m) {
      var i;
      for (i = 0; i < outer.length - 1; i++) {
        var o0 = outer[i], o1 = outer[i + 1], i0 = inner[i], i1 = inner[i + 1];
        quad([o0[0], o0[1], d], [o1[0], o1[1], d], [i1[0], i1[1], d], [i0[0], i0[1], d], m);            // front
        quad([i0[0], i0[1], -d], [i1[0], i1[1], -d], [o1[0], o1[1], -d], [o0[0], o0[1], -d], m);        // back
        quad([o0[0], o0[1], -d], [o1[0], o1[1], -d], [o1[0], o1[1], d], [o0[0], o0[1], d], m);          // outer wall
        quad([i0[0], i0[1], d], [i1[0], i1[1], d], [i1[0], i1[1], -d], [i0[0], i0[1], -d], m);          // inner wall
      }
      var a = outer[0], b = inner[0], c = outer[outer.length - 1], e = inner[inner.length - 1];
      quad([b[0], b[1], d], [a[0], a[1], d], [a[0], a[1], -d], [b[0], b[1], -d], m);
      quad([c[0], c[1], d], [e[0], e[1], d], [e[0], e[1], -d], [c[0], c[1], -d], m);
    }
    for (var b = 0; b < BRACKETS.length; b++) {
      var seg = BRACKETS[b];
      extrude(arc(A_OUT, seg[0], seg[1], 4), arc(A_IN, seg[0], seg[1], 4), 0.13, 0);
    }
    for (var c = 0; c < CHEVRON.length; c++) {
      var q = CHEVRON[c], d = 0.2;
      quad([q[0][0], q[0][1], d], [q[1][0], q[1][1], d], [q[2][0], q[2][1], d], [q[3][0], q[3][1], d], 1);
      quad([q[3][0], q[3][1], -d], [q[2][0], q[2][1], -d], [q[1][0], q[1][1], -d], [q[0][0], q[0][1], -d], 1);
      for (var k = 0; k < 4; k++) {
        var p0 = q[k], p1 = q[(k + 1) % 4];
        quad([p0[0], p0[1], -d], [p1[0], p1[1], -d], [p1[0], p1[1], d], [p0[0], p0[1], d], 1);
      }
    }
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), mat: new Float32Array(mat), n: mat.length };
  }

  // --- svg fallback --------------------------------------------------------
  function svgMarkup() {
    function d(pts, close) {
      var s = '';
      for (var i = 0; i < pts.length; i++) s += (i ? 'L' : 'M') + pts[i][0].toFixed(3) + ' ' + pts[i][1].toFixed(3) + ' ';
      return s + (close ? 'Z' : '');
    }
    var paths = '';
    for (var b = 0; b < BRACKETS.length; b++) {
      var seg = BRACKETS[b];
      var o = arc(A_OUT, seg[0], seg[1], 6), i2 = arc(A_IN, seg[0], seg[1], 6).slice().reverse();
      paths += '<path d="' + d(o.concat(i2), true) + '" fill="#14193B"></path>';
    }
    for (var c = 0; c < CHEVRON.length; c++) paths += '<path d="' + d(CHEVRON[c], true) + '" fill="#F5821F"></path>';
    return '<svg viewBox="-1.05 -1.05 2.1 2.1" width="100%" height="100%" role="img" aria-label="Seynox"><g transform="scale(1,-1)">' + paths + '</g></svg>';
  }

  var VS = 'attribute vec3 aPos;attribute vec3 aNrm;attribute float aMat;' +
    'uniform mat4 uM;uniform mat4 uP;varying vec3 vN;varying vec3 vP;varying float vM;' +
    'void main(){vec4 p=uM*vec4(aPos,1.0);vP=p.xyz;vN=normalize(mat3(uM)*aNrm);vM=aMat;gl_Position=uP*p;}';

  var FS = 'precision mediump float;varying vec3 vN;varying vec3 vP;varying float vM;' +
    'uniform float uSweep;uniform float uHover;uniform vec3 uNavy;uniform vec3 uOrange;' +
    'void main(){vec3 N=normalize(vN);vec3 L=normalize(vec3(-0.42,0.72,0.85));vec3 H=normalize(L+vec3(0.0,0.0,1.0));' +
    'float df=max(dot(N,L),0.0);float sp=pow(max(dot(N,H),0.0),46.0);' +
    'vec3 base=mix(uNavy,uOrange,vM);' +
    'float q=(vP.x-uSweep)/0.30;float sw=exp(-q*q)*smoothstep(0.0,0.45,N.z);' +
    'vec3 c=base*(0.46+0.80*df)+vec3(1.0)*sp*(0.55+0.40*vM);' +
    'c+=vec3(1.0,0.78,0.50)*sw*0.55*(1.0-vM);' +
    'c+=uOrange*vM*(0.30+0.55*uHover);' +
    'c+=vec3(1.0,0.88,0.66)*sw*0.28*vM;' +
    'gl_FragColor=vec4(c,1.0);}';

  function sh(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  class SeynoxLogo extends HTMLElement {
    connectedCallback() {
      if (this._up) return;
      this._up = true;
      var size = parseInt(this.getAttribute('size') || '40', 10);
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML =
        '<style>:host{display:inline-block;width:' + size + 'px;height:' + size + 'px;line-height:0;}' +
        'div{position:relative;width:100%;height:100%;}canvas{width:100%;height:100%;display:block;}' +
        '.fb{position:absolute;inset:0;}</style>' +
        '<div><div class="fb">' + svgMarkup() + '</div></div>';
      this._host = root.querySelector('div');
      this._fb = root.querySelector('.fb');
      this._size = size;

      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      var start = () => { try { this.init(); } catch (e) { /* keep SVG fallback */ } };
      if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 1200 });
      else setTimeout(start, 240);

      this.addEventListener('pointerenter', () => { this._hoverT = performance.now(); this._hovering = true; });
      this.addEventListener('pointerleave', () => { this._hoverT = performance.now(); this._hovering = false; });
    }

    init() {
      var cv = document.createElement('canvas');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(this._size * dpr); cv.height = Math.round(this._size * dpr);
      var gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
      if (!gl) return;
      this._host.appendChild(cv);

      var g = build();
      var p = gl.createProgram();
      gl.attachShader(p, sh(gl, gl.VERTEX_SHADER, VS));
      gl.attachShader(p, sh(gl, gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      gl.useProgram(p);

      function attr(name, data, n) {
        var b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(p, name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
      }
      attr('aPos', g.pos, 3); attr('aNrm', g.nrm, 3); attr('aMat', g.mat, 1);

      var uM = gl.getUniformLocation(p, 'uM'), uP = gl.getUniformLocation(p, 'uP');
      var uS = gl.getUniformLocation(p, 'uSweep'), uH = gl.getUniformLocation(p, 'uHover');
      gl.uniform3fv(gl.getUniformLocation(p, 'uNavy'), NAVY);
      gl.uniform3fv(gl.getUniformLocation(p, 'uOrange'), ORANGE);
      var s = 0.63;
      gl.uniformMatrix4fv(uP, false, new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, -0.6, 0, 0, 0, 0, 1]));
      gl.enable(gl.DEPTH_TEST);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      this._fb.style.display = 'none';

      var visible = true, self = this;
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) tick(); })
          .observe(this);
      }
      document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });

      var t0 = performance.now(), raf = 0;
      function tick() {
        if (raf) return;
        raf = requestAnimationFrame(function loop(now) {
          raf = 0;
          if (document.hidden || !visible) return;
          var t = (now - t0) / 1000;
          var ry = Math.sin(t * 0.55) * 0.30;          // ±17° oscillation
          var rx = -0.16 + Math.sin(t * 0.33) * 0.05;
          var cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
          // M = rotX * rotY  (column-major)
          gl.uniformMatrix4fv(uM, false, new Float32Array([
            cy, sx * sy, -cx * sy, 0,
            0, cx, sx, 0,
            sy, -sx * cy, cx * cy, 0,
            0, 0, 0, 1
          ]));
          gl.uniform1f(uS, ((t * 0.42) % 2.4) - 1.35);
          var hp = Math.min(1, (now - (self._hoverT || 0)) / 260);
          var hv = self._hovering ? hp : 1 - hp;
          gl.uniform1f(uH, self._hovering || hp < 1 ? hv : 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, g.n);
          raf = requestAnimationFrame(loop);
        });
      }
      tick();
      this._stop = function () { if (raf) cancelAnimationFrame(raf); };
    }

    disconnectedCallback() { if (this._stop) this._stop(); }
  }
  customElements.define('seynox-logo', SeynoxLogo);
})();
