import * as THREE from 'three';

/** A camera-local miniature cab: real geometry, kept clear of the windshield. */
export function createCockpit(camera) {
  const group = new THREE.Group();
  const geometries = new Set();
  const materials = new Map();
  const textures = new Set();
  const geometry = (g) => { geometries.add(g); return g; };
  const cube = geometry(new THREE.BoxGeometry(1, 1, 1));
  function mat(color) {
    if (!materials.has(color)) materials.set(color, new THREE.MeshBasicMaterial({ color }));
    return materials.get(color);
  }
  function box(color, xyz, scale) {
    const mesh = new THREE.Mesh(cube, mat(color));
    mesh.position.set(...xyz); mesh.scale.set(...scale); group.add(mesh); return mesh;
  }
  // Camera-local units; the surrounding country remains visible above the fascia.
  box('#24454b', [0, -.58, -1.05], [2.7, .34, .5]);
  box('#395d60', [0, -.405, -1.1], [2.7, .045, .55]);
  box('#d83b35', [0, -.535, -.79], [2.7, .012, .025]);
  const leftPillar = box('#f0e8d6', [-.76, .15, -1], [.075, 1.45, .075]);
  const rightPillar = box('#f0e8d6', [.76, .15, -1], [.075, 1.45, .075]);
  box('#ece4d2', [0, .74, -1], [3, .13, .15]);
  box('#b92f30', [0, -.57, -1.65], [2.3, .04, .3]);
  const wheel = new THREE.Group(); wheel.position.set(-.26, -.31, -.7); wheel.scale.setScalar(.72); group.add(wheel);
  const rim = new THREE.Mesh(geometry(new THREE.TorusGeometry(.16, .022, 8, 36)), mat('#18363d')); wheel.add(rim);
  for (let i=0;i<3;i++) {
    const spoke = new THREE.Mesh(cube, mat('#597477'));
    spoke.scale.set(.018, .145, .014); spoke.rotation.z = i * Math.PI * 2 / 3;
    spoke.position.set(-Math.sin(spoke.rotation.z)*.065, Math.cos(spoke.rotation.z)*.065, 0); wheel.add(spoke);
  }
  const hub = new THREE.Mesh(geometry(new THREE.CylinderGeometry(.047,.047,.018,16)), mat('#d83b35'));
  hub.rotation.x=Math.PI/2;hub.position.z=.012;wheel.add(hub);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#142f37';ctx.fillRect(0,0,512,256);
  ctx.strokeStyle='#afdcbe';ctx.lineWidth=10;ctx.beginPath();ctx.arc(150,158,94,Math.PI,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#fff1c8';ctx.font='bold 64px Arial';ctx.textAlign='center';ctx.fillText('LAPA',360,105);
  ctx.font='28px Arial';ctx.fillStyle='#afdcbe';ctx.fillText('BUON VIAGGIO',345,162);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
  const gaugeMat=new THREE.MeshBasicMaterial({map:texture});materials.set('gauge',gaugeMat);
  const gauge=new THREE.Mesh(geometry(new THREE.PlaneGeometry(.55,.17)),gaugeMat);gauge.position.set(.2,-.415,-.772);group.add(gauge);
  // A small interior mirror and side vents give the cab a recognizable scale.
  box('#24454b',[.26,.47,-.96],[.3,.095,.035]);box('#9ec7c5',[.26,.47,-.938],[.265,.062,.012]);
  for(const x of [-.6,.62])for(let i=0;i<3;i++)box('#16373d',[x,-.455+i*.023,-.788],[.13,.008,.018]);
  group.visible=false;camera.add(group);
  return {
    group,
    frame(aspect) {
      // Keep the pillars near the viewport edges on narrow and wide screens.
      const halfWidth=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*aspect;
      leftPillar.position.x=-halfWidth*.94;rightPillar.position.x=halfWidth*.94;
      wheel.position.x=-Math.min(.26,halfWidth*.3);
      gauge.scale.x=Math.min(1,aspect/.95);
      gauge.position.x=Math.min(.2,halfWidth*.23);
    },
    update(turn, reduced) {wheel.rotation.z=reduced?0:THREE.MathUtils.clamp(turn,-.65,.65);},
    dispose(){camera.remove(group);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
  };
}
