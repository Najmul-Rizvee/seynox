/* Seynox hero 3D scene — a glossy curved ribbon with an animated light
   trail over a starfield, in the site's navy/orange palette. Vanilla
   Three.js, no build step. Mounts into #hero-3d-canvas if present. */
(function () {
  function init() {
    var container = document.getElementById('hero-3d-canvas');
    if (!container || !window.THREE || container.__heroInit) return;
    container.__heroInit = true;

    var NAVY = new THREE.Color(0x14193B);
    var ORANGE = new THREE.Color(0xF5821F);
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var width = container.clientWidth, height = container.clientHeight;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.PointLight(0xF5821F, 1.4, 20);
    rim.position.set(-3, -1, 4);
    scene.add(rim);

    // --- the ribbon: a flattened tube along a curved path ---------------
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.6, -2.4, -1.5),
      new THREE.Vector3(-2.2, -0.8, 0.4),
      new THREE.Vector3(0.2, 1.1, 1.2),
      new THREE.Vector3(2.6, 1.6, -0.2),
      new THREE.Vector3(4.8, 2.6, -1.8)
    ]);
    var tubeSegments = 160;
    var tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, 0.62, 16, false);

    // gradient vertex colors along the ribbon's length (navy -> orange)
    var posAttr = tubeGeo.attributes.position;
    var colors = new Float32Array(posAttr.count * 3);
    var tmp = new THREE.Color();
    for (var i = 0; i < posAttr.count; i++) {
      var t = (i / (16 + 1)) / tubeSegments;
      tmp.copy(NAVY).lerp(ORANGE, Math.min(1, t * 1.15));
      colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
    }
    tubeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    var ribbonMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      metalness: 0.55,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      reflectivity: 0.6
    });
    var ribbon = new THREE.Mesh(tubeGeo, ribbonMat);
    ribbon.scale.y = 0.42; // flatten the round tube into a ribbon
    scene.add(ribbon);

    // --- animated light trail racing along the same curve ---------------
    function glowTexture() {
      var c = document.createElement('canvas');
      c.width = c.height = 128;
      var ctx = c.getContext('2d');
      var g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,236,214,.9)');
      g.addColorStop(1, 'rgba(255,236,214,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }
    var trailTex = glowTexture();
    var trailGroup = new THREE.Group();
    var TRAIL_LEN = 14;
    var trailSprites = [];
    for (var s = 0; s < TRAIL_LEN; s++) {
      var mat = new THREE.SpriteMaterial({ map: trailTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      var sprite = new THREE.Sprite(mat);
      var scale = 0.85 - (s / TRAIL_LEN) * 0.6;
      sprite.scale.set(scale, scale, 1);
      trailGroup.add(sprite);
      trailSprites.push(sprite);
    }
    scene.add(trailGroup);

    // --- starfield --------------------------------------------------------
    var starCount = 180;
    var starGeo = new THREE.BufferGeometry();
    var starPos = new Float32Array(starCount * 3);
    for (var p = 0; p < starCount; p++) {
      starPos[p * 3] = (Math.random() - 0.5) * 16;
      starPos[p * 3 + 1] = (Math.random() - 0.5) * 10;
      starPos[p * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    var starMat = new THREE.PointsMaterial({ color: 0xFAFAF8, size: 0.045, transparent: true, opacity: 0.55, depthWrite: false });
    var stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- interaction: subtle mouse parallax --------------------------------
    var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    function onMove(e) {
      var r = container.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    var t0 = performance.now();
    var raf;
    function animate(now) {
      raf = requestAnimationFrame(animate);
      var elapsed = (now - t0) / 1000;
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX * 0.9;
      camera.position.y = 0.3 + targetY * -0.5;
      camera.lookAt(0, 0.2, 0);

      if (!reduceMotion) {
        var speed = 0.06;
        var head = (elapsed * speed) % 1;
        for (var k = 0; k < trailSprites.length; k++) {
          var tt = head - k * 0.012;
          tt = ((tt % 1) + 1) % 1;
          var pt = curve.getPointAt(tt);
          trailSprites[k].position.copy(pt);
          trailSprites[k].material.opacity = Math.max(0, 1 - k / trailSprites.length) * 0.9;
        }
        stars.rotation.y = elapsed * 0.01;
        ribbon.rotation.z = Math.sin(elapsed * 0.15) * 0.02;
      }
      renderer.render(scene, camera);
    }
    animate(t0);

    function onResize() {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize, { passive: true });

    container.__heroCleanup = function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // dc pages can re-render; retry shortly in case the canvas mounts late
  setTimeout(init, 300);
  setTimeout(init, 1000);
})();
