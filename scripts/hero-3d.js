/* Seynox hero 3D scene — a rotating topology graph: nodes distributed
   over a sphere, connected by lines where they're close, with rhythmic
   per-node pulses. Ported from ThreeUI's StructureFlowCollection
   (topology-field variant / "Nexus topology field") animation core,
   recolored for the light hero (navy nodes/lines on paper, a couple of
   accent nodes echoing the old placeholder diagram's orange pulse dot).
   Vanilla Three.js, no build step. Mounts into #hero-3d-canvas if present. */
(function () {
  // The site's page runtime (dc-runtime) replaces the whole hero subtree
  // with a freshly React-rendered copy once it hydrates — destroying
  // whatever this script already mounted into the original element. A
  // fixed-count poll can miss that swap on a slow load and leave the
  // container permanently blank, so `current` below tracks the *live*
  // container node and re-mounts (cleaning up the old instance first)
  // whenever it changes, for as long as the page lives.
  var current = { container: null, cleanup: null };

  function init(container) {
    var width = container.clientWidth, height = container.clientHeight;
    if (!width || !height) return; // not laid out yet — a later check will pick it up

    var NAVY = 0x14193b;
    var ACCENT = 0xf5821f;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.z = 650;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) { return; } // no WebGL — nothing to retry, leave the hero blank
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    var group = new THREE.Group();
    scene.add(group);

    // --- nodes: evenly distributed over a unit sphere --------------------
    var numNodes = 46;
    var nodes = [];
    var nodeGeo = new THREE.SphereGeometry(1, 16, 16);
    var accentIdx = { 5: true, 27: true };

    for (var i = 0; i < numNodes; i++) {
      var phi = Math.acos(-1 + (2 * i) / numNodes);
      var theta = Math.sqrt(numNodes * Math.PI) * phi;
      var x = Math.cos(theta) * Math.sin(phi);
      var y = Math.sin(theta) * Math.sin(phi);
      var z = Math.cos(phi);
      var isAccent = !!accentIdx[i];

      var mesh = new THREE.Mesh(
        nodeGeo,
        new THREE.MeshBasicMaterial({ color: isAccent ? ACCENT : NAVY, transparent: true, opacity: 0.75 })
      );
      mesh.position.set(x, y, z);
      mesh.userData = {
        baseSize: (isAccent ? 0.85 : Math.random() * 0.55 + 0.35),
        pulseSpeed: Math.random() * 0.02 + 0.015,
        pulseOffset: Math.random() * Math.PI * 2,
        isAccent: isAccent
      };
      group.add(mesh);
      nodes.push(mesh);
    }

    // --- lines between nodes that are close on the sphere ----------------
    var linePos = [];
    for (var a = 0; a < numNodes; a++) {
      for (var b = a + 1; b < numNodes; b++) {
        var dist = nodes[a].position.distanceTo(nodes[b].position);
        var threshold = 0.95;
        if (dist < threshold) {
          linePos.push(nodes[a].position.x, nodes[a].position.y, nodes[a].position.z);
          linePos.push(nodes[b].position.x, nodes[b].position.y, nodes[b].position.z);
        }
      }
    }

    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    var lineMat = new THREE.LineBasicMaterial({
      color: NAVY,
      transparent: true,
      depthWrite: false,
      opacity: 0.22
    });
    var lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // container is the masked right-hand strip of the hero, not the full
    // width — size the sphere off its own box, not fixed viewport breakpoints.
    function fit() {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      var R = Math.min(w, h) * 0.62;
      group.scale.set(R, R, R);
      group.position.set(0, 0, 0);
    }
    fit();

    var t0 = performance.now();
    var raf;
    function animate(now) {
      raf = requestAnimationFrame(animate);

      if (!reduceMotion) {
        // canonical source advances a frame counter (`time += 1` per rAf,
        // ~60fps); approximate that here from real elapsed time so the
        // motion speed matches regardless of actual frame rate.
        var tFrames = (now - t0) / 16.6667;

        group.rotation.y = tFrames * 0.0018;
        group.rotation.x = 0.2;
        group.rotation.z = tFrames * 0.0006;

        nodes.forEach(function (mesh) {
          var p = mesh.userData;
          var pulse = (Math.sin((tFrames * p.pulseSpeed) + p.pulseOffset) + 1) / 2;

          var targetRadius = p.baseSize + pulse * 0.7;
          var scale = targetRadius / group.scale.x;

          mesh.scale.set(scale, scale, scale);
          mesh.material.opacity = (p.isAccent ? 0.55 : 0.35) + (pulse * 0.6);
        });
      }

      renderer.render(scene, camera);
    }
    animate(t0);

    function onResize() {
      fit();
    }
    window.addEventListener('resize', onResize, { passive: true });

    return function cleanup() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }

  function check() {
    if (!window.THREE) return;
    var c = document.getElementById('hero-3d-canvas');
    if (!c || c === current.container) return;
    var cleanup = init(c);
    if (!cleanup) return; // not laid out yet — try again on the next check
    if (current.cleanup) current.cleanup();
    current.container = c;
    current.cleanup = cleanup;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }
  window.addEventListener('load', check);

  // dc-runtime swaps in a freshly-rendered copy of the hero once it
  // hydrates (and again on any later streamed update), discarding whatever
  // this script mounted into the previous element — keep watching for that
  // for the life of the page rather than giving up after a few tries.
  var scheduled = false;
  var mo = new MutationObserver(function () {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () { scheduled = false; check(); });
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
