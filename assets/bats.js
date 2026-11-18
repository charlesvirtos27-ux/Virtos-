/* Vol de chauves-souris (page « Ninja Batbat »).
   Chaque chauve-souris est un petit modèle 3D : bras, avant-bras, doigts et membrane, projetés en perspective.
   Les ailes battent avec un vrai cycle (abaissement ailes tendues, remontée ailes repliées), le corps monte et descend
   à chaque battement, l'animal s'incline dans les virages et plane par moments. Plus elle est loin, plus elle est petite
   et se fond dans le mur (brume). Une seule volée, à l'arrivée sur la page ; rien si l'appareil limite les animations. */
(function () {
  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function v(x, y, z) { return [x, y, z]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

  // Courbe de Catmull-Rom passant par les points de passage
  function spline(P, t) {
    var n = P.length - 1, f = clamp(t, 0, 1) * n, i = Math.min(Math.floor(f), n - 1), u = f - i;
    var p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, n)];
    var u2 = u * u, u3 = u2 * u, r = [];
    for (var k = 0; k < 3; k++) r[k] = 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3);
    return r;
  }

  // Squelette de l'aile droite, en fractions d'envergure (x vers l'extérieur, y vers le haut, z vers l'avant)
  var WING = {
    S: v(0.035, 0.00, 0.03),   // épaule
    E: v(0.165, 0.012, 0.065), // coude
    R: v(0.285, 0.00, 0.03),   // poignet
    T2: v(0.42, 0.00, 0.015),  // bord d'attaque
    T3: v(0.50, -0.01, -0.055),// pointe de l'aile
    T4: v(0.40, -0.012, -0.165),
    T5: v(0.27, -0.012, -0.20),
    F: v(0.055, -0.01, -0.145),// pied (bord de fuite)
    B: v(0.03, 0.00, -0.05)
  };

  function rotZ(p, c, a) { // rotation autour de l'axe avant (z), pivot c
    var x = p[0] - c[0], y = p[1] - c[1], co = Math.cos(a), si = Math.sin(a);
    return [c[0] + x * co - y * si, c[1] + x * si + y * co, p[2]];
  }

  // Pose de l'aile droite pour une phase de battement
  function wingPose(sp, phase, amp, fold) {
    var dihedral = 0.16;
    var th = amp * Math.cos(phase) + dihedral;              // +amp : ailes hautes ; -amp : ailes basses
    var up = Math.max(0, -Math.sin(phase));                  // remontée (0 → 1)
    var th2 = 0.55 * amp * Math.cos(phase - 0.75);          // la main suit l'épaule avec un retard
    var s = 1 - (0.30 * fold) * up;                          // ailes repliées pendant la remontée
    var W = {};
    for (var k in WING) W[k] = [WING[k][0] * sp.arm, WING[k][1], WING[k][2]];
    var R = W.R, out = {};
    ['T2', 'T3', 'T4', 'T5'].forEach(function (k) {
      var p = W[k], q = [R[0] + (p[0] - R[0]) * s, p[1], R[2] + (p[2] - R[2]) * (0.85 + 0.15 * s)];
      q = rotZ(q, R, th2);
      out[k] = rotZ(q, W.S, th);
    });
    out.S = W.S; out.B = W.B;
    out.E = rotZ(W.E, W.S, th);
    out.R = rotZ(W.R, W.S, th);
    out.F = rotZ(W.F, W.S, th * 0.3);
    return { pts: out, lift: Math.sin(phase) };
  }

  function play(opts) {
    opts = opts || {};
    if (!opts.test && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:6;pointer-events:none;';
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, F = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; F = Math.max(W, H) * 0.85; }
    size(); addEventListener('resize', size);

    // Point de l'écran (sx, sy dans [-1, 1], sy vers le bas) à la profondeur Z, en coordonnées du monde
    function at(sx, sy, Z) { return [sx * (W / 2) * Z / F, -sy * (H / 2) * Z / F, Z]; }
    function proj(p) { return [W / 2 + p[0] * F / p[2], H / 2 - p[1] * F / p[2], F / p[2]]; }

    var WALL = [216, 215, 211];
    // On regarde les chauves-souris légèrement par en dessous : la « verticale » du vol penche vers nous,
    // ce qui montre la surface des ailes au lieu de leur tranche.
    var SKY = norm([0, 0.85, -0.6]);
    function species(o) {
      return {
        span: o.span, arm: o.arm || 1, ear: o.ear || 1, freq: o.freq, amp: o.amp || 1.0,
        tone: o.tone || [34, 30, 28], glide: o.glide || 0, seed: Math.random() * 100
      };
    }
    // Plans de vol : points de passage (sx, sy, profondeur), durée, départ. Chacun a son caractère.
    // Envolée : les chauves-souris sortent du tableau lui-même. Elles partent toutes d'un même point de la toile (vers l'emblème),
    // petites et lointaines, puis se dispersent en éventail en fonçant vers le spectateur, en grossissant jusqu'à frôler l'écran.
    function rnd(a, b2) { return a + Math.random() * (b2 - a); }
    var src = document.querySelector('.wall .framed img') || document.querySelector('.wall .framed') || document.querySelector('img');
    var r0 = src ? src.getBoundingClientRect() : { left: W * 0.3, top: H * 0.2, width: W * 0.4, height: H * 0.4 };
    var ox = 0;
    var ex = r0.left + r0.width * 0.50, ey = r0.top + r0.height * 0.895;       // centre de l'emblème bordé de bleu
    ox = clamp((ex / W) * 2 - 1, -0.95, 0.95);
    var oy = clamp((ey / H) * 2 - 1, -0.95, 0.95);
    var glowR = r0.width * 0.34;
    // Mise en scène en trois temps.
    // 1. L'attente : l'emblème bat deux fois, comme un cœur (0 → T0).
    // 2. L'éclaireuse : une première chauve-souris sort seule et fonce sur le visiteur jusqu'à le frôler.
    // 3. L'éclosion : éclat, onde, puis la nuée jaillit sur 360°. Certaines foncent vers nous, d'autres filent
    //    à mi-distance, d'autres repartent dans la profondeur ; trois tournoient autour du tableau avant de fuir ;
    //    quelques retardataires sortent encore après la vague. Elles quittent vraiment l'écran au lieu de s'effacer.
    var T0 = 0.95, asp = W / H, bats = [];
    var cxs = clamp(((r0.left + r0.width / 2) / W) * 2 - 1, -0.9, 0.9), cys = clamp(((r0.top + r0.height / 2) / H) * 2 - 1, -0.9, 0.9);
    var halfW = r0.width / W, halfH = r0.height / H;
    function tone() { return [rnd(22, 40) | 0, rnd(20, 36) | 0, rnd(19, 34) | 0]; }
    function exitR(dx, dy, m) { // distance (en unités d'écran) pour sortir du cadre dans la direction (dx, dy)
      var rx = Math.abs(dx) > 1e-3 ? ((dx > 0 ? m : -m) - ox) / dx : 99;
      var ry = Math.abs(dy) > 1e-3 ? ((dy > 0 ? m : -m) - oy) / (dy * asp) : 99;
      return Math.min(rx, ry);
    }
    // l'éclaireuse
    var side0 = Math.random() < 0.5 ? -1 : 1;
    bats.push({ sp: species({ span: 1.05, arm: 1.05, ear: 1.1, freq: 7.2, amp: 1.05, tone: [24, 21, 20] }),
      delay: T0, dur: 1.75, ease: 1.55,
      path: [at(ox, oy, 12.5), at(ox + side0 * 0.06, oy - 0.1, 8), at(ox - side0 * 0.12, oy - 0.05, 4.2),
             at(ox * 0.5 + side0 * 0.35, oy * 0.5 - 0.15, 1.9), at(side0 * 1.55, -0.05, 0.8)] });
    // la nuée
    var N = 16, base = Math.random() * TAU;
    for (var i = 0; i < N; i++) {
      var th = base + (i / N) * TAU + rnd(-0.22, 0.22);
      var dx = Math.cos(th), dy = Math.sin(th), qx = -dy, qy = dx;
      var kind = (i % 6 === 2) ? 'back' : (i % 3 === 0 ? 'near' : (i % 3 === 1 ? 'mid' : 'far'));
      var sz = Math.pow(Math.random(), 1.5);
      var span = kind === 'near' ? 0.9 + 0.55 * sz : kind === 'mid' ? 0.6 + 0.4 * sz : kind === 'far' ? 0.42 + 0.28 * sz : 0.34 + 0.2 * sz;
      var startZ = rnd(10.5, 14);
      var Zend = kind === 'near' ? rnd(0.75, 1.2) : kind === 'mid' ? rnd(1.6, 2.8) : kind === 'far' ? rnd(3.2, 5.5) : rnd(18, 23);
      var R = kind === 'back' ? rnd(0.4, 0.8) : exitR(dx, dy, 1.3) * rnd(1.02, 1.25);
      var tx = ox + dx * R, ty = oy + dy * R * asp;
      var path = [at(ox + rnd(-0.03, 0.03), oy + rnd(-0.02, 0.02), startZ)];
      var sign = Math.random() < 0.5 ? -1 : 1;
      [0.18, 0.4, 0.66].forEach(function (k, j) {
        var jink = sign * (j % 2 ? -1 : 1) * rnd(0.06, 0.22) * Math.min(R, 2.2) * (1 - k * 0.6);
        path.push(at(mix(ox, tx, k) + qx * jink, mix(oy, ty, k) + qy * jink * asp, mix(startZ, Zend, Math.pow(k, 0.8))));
      });
      path.push(at(tx, ty, Zend));
      var late = i >= N - 4;
      bats.push({
        sp: species({ span: span, arm: rnd(0.92, 1.14), ear: rnd(0.8, 1.3), freq: rnd(6.8, 8.6) + (1 - sz) * 3.2,
                      amp: rnd(0.85, 1.12), glide: (kind === 'far' || kind === 'back') ? (i % 2) : 0, tone: tone() }),
        delay: T0 + (late ? rnd(0.95, 1.7) : rnd(0.28, 0.6)),
        dur: kind === 'near' ? rnd(1.5, 2.1) : kind === 'mid' ? rnd(1.9, 2.7) : kind === 'far' ? rnd(2.4, 3.2) : rnd(2.6, 3.3),
        ease: kind === 'near' ? rnd(1.3, 1.6) : rnd(1.0, 1.3),
        path: path
      });
    }
    // trois qui tournoient autour du tableau avant de partir
    for (var o = 0; o < 3; o++) {
      var dir = o % 2 ? 1 : -1, a0 = Math.atan2((oy - cys) / asp, ox - cxs) + rnd(-0.3, 0.3), turns = rnd(0.85, 1.25);
      var rx = halfW * rnd(1.35, 1.75), ry = halfH * rnd(1.05, 1.3), zc = rnd(6, 8.5);
      var op = [at(ox, oy, 12.5)];
      for (var k = 1; k <= 9; k++) {
        var aa = a0 + dir * turns * TAU * (k / 9);
        op.push(at(cxs + Math.cos(aa) * rx, cys + Math.sin(aa) * ry, zc + 1.6 * Math.sin(aa * 1.3 + o)));
      }
      var ae = a0 + dir * turns * TAU + dir * 0.5;
      op.push(at(cxs + Math.cos(ae) * 2.4, cys + Math.sin(ae) * 2.0, rnd(2.2, 3.5)));
      bats.push({ sp: species({ span: rnd(0.5, 0.75), arm: rnd(0.95, 1.1), ear: rnd(0.9, 1.2), freq: rnd(8.5, 10.5), amp: rnd(0.9, 1.05), tone: tone() }),
        delay: T0 + rnd(0.35, 0.75), dur: rnd(3.4, 4.1), ease: 1.0, path: op });
    }
    if (opts.bats) bats = opts.bats(at, species);
    var END = Math.max.apply(null, bats.map(function (b) { return b.delay + b.dur; })) + 0.3;

    function state(b, t) {
      var u = clamp((t - b.delay) / b.dur, 0, 1);
      var e = Math.pow(u, b.ease);                                   // vitesse qui varie le long du vol
      var pos = spline(b.path, e), ahead = spline(b.path, Math.min(e + 0.01, 1)), behind = spline(b.path, Math.max(e - 0.01, 0));
      var vel = sub(ahead, behind), f = norm(vel);
      var acc = sub(add(ahead, behind), mul(pos, 2));
      var right = norm(cross(f, SKY)), up = cross(right, f);
      var bank = clamp(-dot(acc, right) * 120, -0.75, 0.75);         // inclinaison dans les virages
      var cb = Math.cos(bank), sb = Math.sin(bank);
      var r2 = add(mul(right, cb), mul(up, sb)), u2 = sub(mul(up, cb), mul(right, sb));
      return { u: u, pos: pos, f: f, right: r2, up: u2 };
    }

    var BLUE = [118, 186, 232], TINT = 0;
    function shade(c, light, fog) {
      var r = [];
      for (var i = 0; i < 3; i++) r[i] = mix(mix(c[i] * light, BLUE[i], TINT), WALL[i], fog);
      return 'rgb(' + (r[0] | 0) + ',' + (r[1] | 0) + ',' + (r[2] | 0) + ')';
    }

    var ghost = 0;
    function drawBat(b, t) {
      if (t < b.delay || t > b.delay + b.dur) return;
      var st = state(b, t), sp = b.sp;
      var lt = t - b.delay;
      // battement, avec des phases de vol plané pour certaines
      var glideEnv = sp.glide ? smooth(clamp(0.5 + 0.9 * Math.sin(lt * 1.9 + sp.seed), 0, 1)) : 1;
      var amp = sp.amp * mix(0.12, 1, glideEnv);
      var phase = lt * sp.freq * TAU * mix(0.6, 1, glideEnv) + sp.seed;
      var pose = wingPose(sp, phase, amp, glideEnv);
      var s = sp.span;
      // le corps s'élève pendant l'abaissement des ailes, plus un léger roulis de vol
      var bob = mul(st.up, 0.035 * s * pose.lift * glideEnv);
      var sway = mul(st.right, s * (0.02 * Math.sin(lt * 2.3 + sp.seed) + 0.01 * Math.sin(lt * 7.3 + sp.seed * 3)));
      var O = add(add(st.pos, bob), sway);
      function W(p, mirror) { var x = mirror ? -p[0] : p[0]; return add(O, add(add(mul(st.right, x * s), mul(st.up, p[1] * s)), mul(st.f, p[2] * s))); }
      function P(p, m) { return proj(W(p, m)); }
      var Z = O[2]; if (Z < 0.3) return;
      var fog = clamp((Z - 2.5) / 15, 0, 1) * 0.6;
      var alpha = Math.min(smooth(clamp(st.u / 0.06, 0, 1)), smooth(clamp((1 - st.u) / 0.07, 0, 1)));
      var px = s * F / Z;                                              // envergure à l'écran, en pixels
      TINT = 0.6 * (1 - smooth(clamp(st.u / 0.2, 0, 1)));           // elles naissent dans la lumière bleue
      // profondeur de champ : floue tout près de l'œil, légèrement floue au loin
      var blur = Z < 1.6 ? (1.6 - Z) / 1.6 * px * 0.025 : Z > 10 ? Math.min(2, (Z - 10) * 0.25) : 0;
      ctx.filter = blur > 0.3 ? 'blur(' + blur.toFixed(1) + 'px)' : 'none';
      ctx.globalAlpha = alpha;

      [1, 0].forEach(function (m) {
        var q = pose.pts;
        // lumière venue d'en haut : l'aile tournée vers le ciel paraît un peu plus claire
        var n = norm(cross(sub(W(q.E, m), W(q.S, m)), sub(W(q.T4, m), W(q.R, m))));
        var light = 1 + 0.55 * Math.abs(dot(n, [0.2, 0.9, -0.3]));
        var c = { S: P(q.S, m), E: P(q.E, m), R: P(q.R, m), T2: P(q.T2, m), T3: P(q.T3, m), T4: P(q.T4, m), T5: P(q.T5, m), F: P(q.F, m), B: P(q.B, m) };
        function scallop(a, b2) { // bord festonné de la membrane entre deux doigts
          var mid = add(mul(add(a, b2), 0.5), mul(sub(q.R, mul(add(a, b2), 0.5)), 0.32));
          var cc = P(mid, m), e = P(b2, m);
          ctx.quadraticCurveTo(cc[0], cc[1], e[0], e[1]);
        }
        ctx.beginPath();
        ctx.moveTo(c.S[0], c.S[1]); ctx.lineTo(c.E[0], c.E[1]); ctx.lineTo(c.R[0], c.R[1]);
        ctx.lineTo(c.T2[0], c.T2[1]); ctx.lineTo(c.T3[0], c.T3[1]);
        scallop(q.T3, q.T4); scallop(q.T4, q.T5); scallop(q.T5, q.F);
        ctx.lineTo(c.B[0], c.B[1]); ctx.closePath();
        // ombre portée douce sur le mur (plus marquée quand la chauve-souris est proche), puis membrane en dégradé
        var near = clamp(1 - (Z - 1.2) / 9, 0, 1);
        ctx.save();
        ctx.shadowColor = 'rgba(20,18,16,' + (0.28 * near * alpha).toFixed(3) + ')';
        ctx.shadowBlur = px * 0.16; ctx.shadowOffsetX = px * 0.05; ctx.shadowOffsetY = px * 0.11;
        var gr = ctx.createLinearGradient(c.S[0], c.S[1], c.T3[0], c.T3[1]);
        gr.addColorStop(0, shade(sp.tone, light * 0.75, fog));
        gr.addColorStop(0.55, shade(sp.tone, light, fog));
        gr.addColorStop(1, shade([sp.tone[0] + 6, sp.tone[1] + 5, sp.tone[2] + 5], light, Math.min(1, fog + 0.05)));
        ctx.fillStyle = gr; ctx.globalAlpha = alpha * (0.98 - 0.03 * (1 - near)); ctx.fill();
        ctx.restore(); ctx.globalAlpha = alpha;
        if (px > 34) { // de près : les os des doigts se devinent sous la membrane
          ctx.strokeStyle = shade([14, 12, 11], 1, fog); ctx.lineCap = 'round';
          ctx.lineWidth = Math.max(0.8, px * 0.012);
          ctx.beginPath(); ctx.moveTo(c.S[0], c.S[1]); ctx.lineTo(c.E[0], c.E[1]); ctx.lineTo(c.R[0], c.R[1]); ctx.lineTo(c.T2[0], c.T2[1]); ctx.stroke();
          ctx.lineWidth = Math.max(0.6, px * 0.007);
          ctx.beginPath();
          [c.T3, c.T4, c.T5].forEach(function (tp) { ctx.moveTo(c.R[0], c.R[1]); ctx.lineTo(tp[0], tp[1]); });
          ctx.stroke();
        }
      });

      // corps : tête, oreilles, torse fourré, queue
      var body = [[0.115, 0.022], [0.07, 0.036], [0.01, 0.044], [-0.05, 0.036], [-0.1, 0.016]];
      var spine = body.map(function (b2) { return P([0, 0.008, b2[0]], false); });
      ctx.fillStyle = shade([18, 16, 15], 1, fog);
      for (var i = 0; i < spine.length; i++) {
        ctx.beginPath(); ctx.arc(spine[i][0], spine[i][1], Math.max(0.8, body[i][1] * s * spine[i][2]), 0, TAU); ctx.fill();
      }
      for (i = 0; i < spine.length - 1; i++) { // relier les segments du corps
        ctx.lineWidth = Math.max(1, 2 * Math.min(body[i][1], body[i + 1][1]) * s * spine[i][2]);
        ctx.strokeStyle = ctx.fillStyle; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(spine[i][0], spine[i][1]); ctx.lineTo(spine[i + 1][0], spine[i + 1][1]); ctx.stroke();
      }
      [1, -1].forEach(function (sd) { // oreilles pointues
        var e1 = P([0.012 * sd, 0.02, 0.112], false), e2 = P([0.028 * sd, 0.07 * sp.ear, 0.1], false), e3 = P([0.03 * sd, 0.018, 0.09], false);
        ctx.beginPath(); ctx.moveTo(e1[0], e1[1]); ctx.lineTo(e2[0], e2[1]); ctx.lineTo(e3[0], e3[1]); ctx.closePath(); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.filter = 'none'; TINT = 0;
    }

    var t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var t = opts.at != null ? opts.at : (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // la pièce s'assombrit à peine pendant le passage
      var dark = 0.2 * smooth(clamp(t / 0.25, 0, 1)) * smooth(clamp((END - t) / 0.8, 0, 1));
      var g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.25, W / 2, H * 0.45, Math.max(W, H) * 0.8);
      g.addColorStop(0, 'rgba(10,10,9,0)'); g.addColorStop(1, 'rgba(10,10,9,' + dark + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // halo bleu à l'emblème : deux battements de cœur, puis l'éclat qui libère la nuée, et une onde légère
      function pulse(c, w) { return Math.exp(-Math.pow((t - c) / w, 2)); }
      var gl = 0.32 * pulse(0.3, 0.11) + 0.5 * pulse(0.62, 0.11)
             + (t > T0 - 0.08 ? smooth(clamp((t - T0 + 0.08) / 0.08, 0, 1)) * smooth(clamp((T0 + 1.5 - t) / 1.4, 0, 1)) : 0);
      if (gl > 0.01) {
        var grow = 1 + Math.max(0, t - T0) * 0.8;
        var hg = ctx.createRadialGradient(ex, ey, 0, ex, ey, glowR * grow);
        hg.addColorStop(0, 'rgba(160,225,252,' + (0.75 * gl).toFixed(3) + ')');
        hg.addColorStop(0.45, 'rgba(110,190,240,' + (0.24 * gl).toFixed(3) + ')');
        hg.addColorStop(1, 'rgba(110,190,240,0)');
        ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
      }
      var wv = (t - T0) / 0.9;
      if (wv > 0 && wv < 1) {
        ctx.beginPath(); ctx.arc(ex, ey, glowR * 0.25 + wv * Math.max(W, H) * 0.42, 0, TAU);
        ctx.strokeStyle = 'rgba(140,205,245,' + (0.3 * (1 - wv) * (1 - wv)).toFixed(3) + ')';
        ctx.lineWidth = 1 + 3 * (1 - wv); ctx.stroke();
      }
      // les plus lointaines d'abord
      bats.slice().sort(function (a, b) {
        var za = state(a, t).pos[2], zb = state(b, t).pos[2]; return zb - za;
      }).forEach(function (b) { drawBat(b, t); });
      if (opts.at != null) return;
      if (t < END) requestAnimationFrame(frame);
      else { removeEventListener('resize', size); cv.remove(); }
    }
    requestAnimationFrame(frame);
  }
  window.VirtosBats = { play: play };
})();
