import * as THREE from 'three';

// Every town shares these small geometries and materials, keeping GPU memory modest.
export function createModels() {
  const geometries = new Set();
  const materials = new Map();
  const textures = new Set();
  const geo = (g) => { geometries.add(g); return g; };
  const cube = geo(new THREE.BoxGeometry(1, 1, 1));
  const cylinder = geo(new THREE.CylinderGeometry(1, 1, 1, 12));
  const ball = geo(new THREE.IcosahedronGeometry(1, 1));
  const cone = geo(new THREE.ConeGeometry(1, 1, 7));
  function material(color, extra = {}) {
    const key = color + JSON.stringify(extra);
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .82, ...extra }));
    return materials.get(key);
  }
  function mesh(parent, geometry, color, pos, scale, shadow = false) {
    const m = new THREE.Mesh(geometry, material(color));
    m.position.set(...pos); m.scale.set(...scale); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
  }
  const box = (p, c, xyz, size, shadow) => mesh(p, cube, c, xyz, size, shadow);
  const cyl = (p, c, xyz, size, shadow) => mesh(p, cylinder, c, xyz, size, shadow);
  function label(parent, text, xyz, width, { color = '#253b3b', background = '#fff7df', height = .65 } = {}) {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 192;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = background; ctx.fillRect(0, 0, 768, 192);
    ctx.fillStyle = color; ctx.font = '900 85px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 384, 100, 730);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; textures.add(map);
    const mat = new THREE.MeshBasicMaterial({ map }); materials.set(`label-${materials.size}`, mat);
    const panel = new THREE.Mesh(geo(new THREE.PlaneGeometry(width, height)), mat); panel.position.set(...xyz); parent.add(panel); return panel;
  }
  function crate(parent, color, xyz, size = .55) {
    const g = new THREE.Group(); g.position.set(...xyz); parent.add(g);
    box(g, color, [0, size / 2, 0], [size, size, size]);
    box(g, '#efd69a', [0, size + .012, 0], [size * .18, .025, size * 1.01]);
    box(g, '#fff6dd', [0, size * .53, size / 2 + .008], [size * .47, size * .25, .018]); return g;
  }
  function truck(parent, xyz, rotation = 0, small = false, openCargo = false) {
    const g = new THREE.Group(); g.position.set(...xyz); g.rotation.y = rotation; parent.add(g);
    box(g, '#263d43', [0, .44, 0], [1.25, .23, 2.65]);
    if (openCargo) {
      // Low cutaway sides make both layers of cargo readable from the town camera.
      box(g, '#c5b99f', [0, .61, -.5], [1.43, .13, 1.75]);
      for (const x of [-.68, .68]) {
        box(g, '#fcfaf1', [x, .96, -.5], [.09, .65, 1.75], true);
        box(g, '#d83b35', [x, 1.3, -.5], [.12, .065, 1.8]);
      }
      for (const z of [-1.33, .33]) box(g, '#fcfaf1', [0, .96, z], [1.43, .65, .09], true);
    } else box(g, '#fcfaf1', [0, 1.15, -.5], [1.43, 1.25, 1.75], true);
    if(openCargo){
      for(const x of [-.69,.69])box(g, '#d83b35', [x, .72, -.5], [.08, .17, 1.78]);
      for(const z of [-1.35,.35])box(g, '#d83b35', [0, .72, z], [1.46, .17, .08]);
    }else box(g, '#d83b35', [0, .72, -.5], [1.46, .17, 1.78]);
    box(g, '#d83b35', [0, .98, .92], [1.4, 1.15, 1.03], true);
    box(g, '#9ed8de', [0, 1.19, 1.45], [1.12, .43, .025]);
    box(g, '#bf292c', [0, .83, 1.46], [1.42, .18, .08]);
    box(g, '#f8d88e', [-.43, .65, 1.49], [.25, .15, .035]); box(g, '#f8d88e', [.43, .65, 1.49], [.25, .15, .035]);
    box(g, '#e7eee7', [0, .48, 1.47], [1.5, .14, .12]);
    for (const x of [-.72, .72]) for (const z of [-.84, .89]) {
      const tire = cyl(g, '#233b41', [x, .4, z], [.35, .17, .35]); tire.rotation.z = Math.PI / 2;
      const hub = cyl(g, '#d3dcd5', [x * 1.035, .4, z], [.17, .19, .17]); hub.rotation.z = Math.PI / 2;
    }
    const logoY = openCargo ? 1.03 : 1.23;
    const side = label(g, 'LAPA', [.731, logoY, -.48], 1.25, { color: '#d83b35', height: .4 }); side.rotation.y = Math.PI / 2;
    const other = label(g, 'LAPA', [-.731, logoY, -.48], 1.25, { color: '#d83b35', height: .4 }); other.rotation.y = -Math.PI / 2;
    const cargo = new THREE.Group(); cargo.position.set(0, openCargo ? .68 : 1.81, -.5); g.add(cargo);
    if (small) g.scale.setScalar(.8);
    return { group: g, cargo };
  }
  function tree(parent, x, z, scale = 1, evergreen = false) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); parent.add(g);
    cyl(g, '#956747', [0, .8, 0], [.12, 1.6, .12]);
    if (evergreen) {
      mesh(g, cone, '#397c64', [0, 1.7, 0], [.85, 1.9, .85], true);
      mesh(g, cone, '#62a075', [0, 2.25, 0], [.63, 1.5, .63], true);
    } else {
      mesh(g, ball, '#79ad69', [0, 1.9, 0], [.9, 1, .85], true);
      mesh(g, ball, '#9ac777', [.45, 2.1, .05], [.65, .72, .66]);
    }
  }
  function warehouse(parent) {
    const g = new THREE.Group(); g.position.set(-5.8, 0, -4.1); parent.add(g);
    box(g, '#dfd9bd', [0, .12, 0], [10.6, .24, 6.6]);
    box(g, '#f7efd7', [0, 1.55, -3], [10.3, 3.1, .24], true);
    box(g, '#eddfbd', [-5.05, 1.45, 0], [.24, 2.9, 6]);
    const zones = [{x:-3.35,c:'#edc777',n:'SECCO'}, {x:0,c:'#a4d3bb',n:'FRESCO'}, {x:3.35,c:'#acd9e5',n:'GELO'}];
    zones.forEach(({x,c,n}, i) => {
      box(g, c, [x, .255, 0], [3.22, .035, 5.8]);
      label(g, n, [x, 2.54, -2.85], 2.5, { background:c, height:.57 });
      for (const z of [-1.8, -.75]) {
        for (const xx of [x-1.1, x+1.1]) box(g, '#64767b', [xx, 1.05, z], [.075, 1.65, .075]);
        for (const y of [.55, 1.25, 1.9]) {
          box(g, '#df9b52', [x, y, z], [2.5, .09, .73]);
          for (let k = -1; k <= 1; k++) crate(g, ['#d7aa67','#729d6e','#e8f5ed'][i], [x+k*.71, y+.05, z], .49);
        }
      }
      box(g, '#f7f0d4', [x, .3, 2.63], [2.8, .04, .1]);
    });
    for (const x of [-5, -1.68, 1.68, 5]) box(g, '#f5efe0', [x, 1.45, 2.93], [.15, 2.9, .15]);
    box(g, '#df4b3c', [0, 3, 2.95], [10.5, .46, .35]);
    label(g, 'LAPA · BUONE COSE, IN VIAGGIO', [0, 3.04, 3.135], 8, {background:'#df4b3c',color:'#fff9e7',height:.35});
    box(g, '#f7f2d7', [0, .06, 3.85], [10.6, .12, 1.1]);
    for (const x of [-3.4, 0, 3.4]) {
      box(g, '#f1d57b', [x-1.1, .015, 4.9], [.09, .025, 1.6]);
      box(g, '#f1d57b', [x+1.1, .015, 4.9], [.09, .025, 1.6]);
    }
    crate(g, '#d7ab73', [-4.2,.25,1.4], .65); crate(g, '#c99656', [-3.5,.25,1.4], .65);
    return g;
  }
  function shop(parent, kind, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    const pizza = kind === 'pizzeria'; const accent = pizza ? '#dc5541' : '#c68b44';
    box(g, '#e5ddc3', [0,.1,0], [5.2,.2,4.7]);
    box(g, pizza ? '#ffe3a7' : '#f3cfac', [0,1.4,0], [4.4,2.7,3.4], true);
    box(g, '#f6efd6', [0,2.8,0], [4.7,.25,3.7]);
    box(g, accent, [0,3.03,-.1], [4.65,.24,3.6]);
    box(g, '#6d9e9f', [0,1.13,1.72], [.8,1.98,.04]);
    for (const xx of [-1.35,1.35]) {
      box(g, '#f9f1d6', [xx,1.25,1.73], [1.24,1.4,.08]);
      box(g, '#73a9a9', [xx,1.25,1.78], [1.08,1.23,.04]);
      box(g, '#f8e8c3', [xx,1.25,1.81], [.065,1.26,.025]);
    }
    label(g, pizza ? 'PIZZERIA' : 'PANETTERIA', [0,2.42,1.755], 3.8, {color:accent,height:.47});
    for (let i=0;i<12;i++) {
      const awning = box(g, i%2 ? '#fff3d5' : accent, [-2.2+(i+.5)*4.4/12,2.02,2.13], [4.4/12,.09,1.03]); awning.rotation.x=.15;
      box(g, i%2 ? '#fff3d5' : accent, [-2.2+(i+.5)*4.4/12,1.85,2.64], [4.4/12,.25,.06]);
    }
    for (const xx of [-1.5,1.5]) {
      cyl(g, '#ad7b4d', [xx,.7,3.3], [.51,.12,.51]); cyl(g, '#536c61', [xx,.36,3.3], [.06,.7,.06]);
      cyl(g, '#fff0c9', [xx,.78,3.3], [.17,.035,.17]);
      for (const dz of [-.5,.5]) { box(g, accent, [xx,.38,3.3+dz], [.42,.09,.38]); box(g,'#6b7459',[xx,.18,3.3+dz],[.06,.36,.06]); }
      cyl(g, '#dc9670', [xx, .22, 2.75], [.18,.4,.18]); mesh(g,ball,'#648957',[xx,.51,2.75],[.24,.26,.24]);
    }
    return g;
  }
  return {box,cyl,mesh,ball,cone,label,crate,truck,tree,warehouse,shop,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
