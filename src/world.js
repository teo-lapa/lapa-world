import { roadClearance, TOWN_ROUTES } from './road-clearance.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createModels } from './world-models.js';
import { createCockpit } from './cockpit.js';
import { createExpansion, createPassengerCar, REGION_DESTINATIONS, EXPANSION_ROUTES } from './world-expansion.js';

export function createWorld(host, { onArrive = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor('#a9dcee'); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  renderer.domElement.setAttribute('aria-label', 'Paese 3D LAPA con magazzino, camion, pizzeria e panetteria');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#a9dcee', 100, 230);
  scene.add(new THREE.HemisphereLight('#fff8ec', '#648b80', 2.25));
  const sun = new THREE.DirectionalLight('#fff4e3', 2.8); sun.position.set(-14,24,17); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:65});
  sun.shadow.normalBias=.035; sun.shadow.bias=-.0001; scene.add(sun);
  const m = createModels(); const town = new THREE.Group(); scene.add(town);
  m.cyl(town,'#c3b086',[0,-.75,0],[19.8,1.5,16.4]);
  m.cyl(town,'#8abf87',[0,-.14,0],[20,.36,16.6]);
  m.cyl(town,'#a1c88a',[0,.035,0],[19.7,.07,16.35]);
  // Closed smooth rectangular road, with an inset lawn creating generous lanes.
  function roundedShape(w,h,r) {
    const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;
  }
  const roadShape=roundedShape(30,22,5); const hole=roundedShape(23.8,15.8,2);roadShape.holes.push(hole);
  const roadGeo=new THREE.ShapeGeometry(roadShape,16);const roadMat=new THREE.MeshStandardMaterial({color:'#688084',roughness:1});
  const road=new THREE.Mesh(roadGeo,roadMat);road.rotation.x=-Math.PI/2;road.position.y=.09;road.receiveShadow=true;town.add(road);
  for(let x=-10;x<=10;x+=2.2)for(const z of [-9.45,9.45])m.box(town,'#ebedce',[x,.105,z],[1,.018,.09]);
  for(let z=-5;z<=5;z+=2.2)for(const x of [-13.45,13.45])m.box(town,'#ebedce',[x,.105,z],[.09,.018,1]);
  // The warehouse sits north-west; shopfronts face the foreground.
  m.warehouse(town);m.shop(town,'pizzeria',6.8,-4.2);m.shop(town,'bakery',5.7,3.25);
  m.truck(town,[-9.3,.13,.35],0,true);m.truck(town,[-2.6,.13,.35],0,true);
  const truck=m.truck(town,[-5.9,.15,1.4],0,false,true);
  const car=createPassengerCar(town,m);car.group.visible=false;
  let player=truck,region=0;
  const expansion=createExpansion(scene,m);
  for (let i=0;i<5;i++)m.box(town,'#f9f3db',[-11.9+i*.37,.12,5.2],[.2,.025,2.4]);
  const clearOfRoad=roadClearance({...TOWN_ROUTES,...EXPANSION_ROUTES});
  // Park, garden, trees, street lamps and Swiss flag.
  for(const [x,z,s,e] of [[-15,-8,1.2,1],[-16,-3,1,0],[-15,5,1.1,0],[-12,11,1,0],[-6,12,1.1,0],[0,12,1,0],[10,10,1.1,0],[15,7,1.1,1],[16,1,1.1,0],[15,-6,1,1],[10,-12,1.1,1],[4,-12,1,1],[-3,-12,1.4,1],[-10,-12,1.2,1],[-5,6.3,1,0],[-8,5.5,.85,0]]){if(clearOfRoad(x,z))m.tree(town,x,z,s,e);}
  m.cyl(town,'#e7d7b1',[-4.9,.1,5.6],[2.1,.13,1.7]);
  for(const x of [-6,-4]){m.box(town,'#b48250',[x,.55,5.9],[1.3,.12,.43]);m.box(town,'#b48250',[x,.88,6.1],[1.3,.5,.09]);for(const dx of [-.45,.45])m.box(town,'#5b7365',[x+dx,.29,5.9],[.08,.5,.35]);}
  for(let i=0;i<32;i++) {
    const a=i*2.399;const x=-3+Math.cos(a)*(1+(i%4)*.31),z=5.5+Math.sin(a)*(1+(i%4)*.23);
    m.mesh(town,m.ball,['#fff0ab','#e67a69','#f5d69c'][i%3],[x,.22,z],[.11,.12,.11]);
  }
  for(const [x,z] of [[-11,2.7],[11,-1],[10.8,7],[-10,8]]){
    m.cyl(town,'#55797a',[x,1.35,z],[.055,2.7,.055]);m.box(town,'#fff3b9',[x,2.68,z],[.33,.26,.33]);m.box(town,'#55797a',[x,2.86,z],[.46,.1,.46]);
  }
  m.cyl(town,'#eee6d0',[-11.4,2.6,-6.7],[.055,5.2,.055]);
  const flag=new THREE.Group();flag.position.set(-10.78,4.55,-6.7);town.add(flag);
  m.box(flag,'#e74837',[0,0,0],[1.15,.95,.035]);m.box(flag,'#fff8df',[0,0,.023],[.59,.18,.025]);m.box(flag,'#fff8df',[0,0,.025],[.18,.59,.025]);
  const clouds=[];
  for(const [x,y,z]of [[-17,13,-18],[11,15,-25],[28,12,-10]]){const cloud=new THREE.Group();cloud.position.set(x,y,z);scene.add(cloud);for(let i=0;i<3;i++)m.mesh(cloud,m.ball,'#f9f5de',[i*1.3,Math.sin(i)*.45,0],[1.7,1,1.2]);clouds.push(cloud);}
  const camera=new THREE.OrthographicCamera(-25,25,20,-20,.1,300);camera.position.set(30,31,39);
  const cabCamera=new THREE.PerspectiveCamera(70,1,.06,300);scene.add(cabCamera);
  const cockpit=createCockpit(cabCamera);
  let cockpitEnabled=false,cabInitialized=false;
  const cabPosition=new THREE.Vector3(),cabLook=new THREE.Vector3(),cabDirection=new THREE.Vector3();
  const cabRotation=new THREE.Quaternion(),cabLookMatrix=new THREE.Matrix4(),worldUp=new THREE.Vector3(0,1,0);
  function setCockpit(active){cockpitEnabled=Boolean(active);cabInitialized=false;controls.enabled=!(cockpitEnabled&&currentView==='road');}
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minZoom=.7;controls.maxZoom=1.7;controls.minPolarAngle=.35;controls.maxPolarAngle=1.15;controls.target.set(0,0,0);controls.update();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentView='overview',driving=false,progress=0,arrived=false,disposed=false,raf=0,last=performance.now(),elapsed=0,transition=true;
  let destination='pizzeria';const goalTarget=new THREE.Vector3();const goalPosition=new THREE.Vector3();let goalSpan=36;
  const cameraOffset = new THREE.Vector3(29,31,37);
  const cameraRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),cameraOffset).normalize();
  const screenUp = new THREE.Vector3().crossVectors(cameraOffset,cameraRight).normalize();
  function followTruck() {
    const portrait = host.clientHeight > host.clientWidth;
    goalSpan = portrait ? 26 : 31;
    // Project the truck at 31% / 35% screen height, clear of bottom controls.
    goalTarget.copy(player.group.position).addScaledVector(screenUp,-goalSpan*(portrait ? .19 : .15));
    goalPosition.copy(goalTarget).add(cameraOffset);
    transition = true;
  }
  const routes={...TOWN_ROUTES,...EXPANSION_ROUTES};
  let curve,tripDuration=12;
  function makeRoute(){curve=new THREE.CatmullRomCurve3(routes[destination].map(([x,z])=>new THREE.Vector3(x,.2,z)),false,'centripetal');tripDuration=REGION_DESTINATIONS[destination].chapter===0?12:Math.max(14,Math.min(28,curve.getLength()/4.5));}
  makeRoute();
  function setView(view){
    currentView=['overview','depot','road',...Object.keys(REGION_DESTINATIONS)].includes(view)?view:'overview';
    controls.enabled=!(cockpitEnabled&&currentView==='road');
    cabInitialized=false;
    controls.enableRotate=currentView!=='road';
    controls.enableZoom=currentView!=='road';
    if(currentView==='road'){camera.zoom=1;followTruck();return;}
    const portrait=host.clientHeight>host.clientWidth;
    const places=Object.values(REGION_DESTINATIONS).filter(d=>d.chapter<=region);
    const minX=Math.min(-20,...places.map(d=>d.x-12)),maxX=Math.max(20,...places.map(d=>d.x+12));
    const minZ=Math.min(-17,...places.map(d=>d.z-10)),maxZ=Math.max(17,...places.map(d=>d.z+10));
    const overviewSpan=region===0?(portrait?42:36):Math.max(maxX-minX,maxZ-minZ)*(portrait?1.35:1.04);
    const customer=REGION_DESTINATIONS[currentView];
    const config=customer?[[customer.x,0,customer.z+1.7],19]:currentView==='depot'?[[-5.5,0,-2.5],22]:[[(minX+maxX)/2,0,(minZ+maxZ)/2],overviewSpan];
    goalTarget.set(...config[0]);goalSpan=config[1];
    // Aim above and to the left of overlay panels without moving the town itself.
    if(portrait)goalTarget.z+=4.8;else goalTarget.x+=4.5;
    goalPosition.copy(goalTarget).add(cameraOffset);transition=true;
  }
  let span=36;
  function resize(){const w=Math.max(host.clientWidth,1),h=Math.max(host.clientHeight,1);renderer.setSize(w,h,false);camera.left=-span*w/h/2;camera.right=span*w/h/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();setView(currentView);}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  controls.addEventListener('start',()=>{transition=false;});
  function setCargo(items=[]){while(truck.cargo.children.length)truck.cargo.remove(truck.cargo.children[0]);items.slice(0,8).forEach((item,i)=>m.crate(truck.cargo,item.color||'#e6b860',[(i%2-.5)*.59,Math.floor(i/4)*.5,(Math.floor(i/2)%2-.5)*.59],.48));}
  function setRegion(chapter){region=expansion.setRegion(chapter);if(currentView==='overview')setView('overview');}
  function prepareTrip(next,vehicle='truck'){destination=Object.hasOwn(REGION_DESTINATIONS,next)?next:'pizzeria';player=vehicle==='car'?car:truck;truck.group.visible=player===truck;car.group.visible=player===car;progress=0;arrived=false;driving=false;cabInitialized=false;makeRoute();player.group.position.copy(curve.getPointAt(0));const t=curve.getTangentAt(0);player.group.rotation.set(0,Math.atan2(t.x,t.z),0);}
  function animate(now){
    if(disposed||document.hidden){raf=0;return;}const dt=Math.max(0,Math.min((now-last)/1000,.25));last=now;elapsed+=dt;
    if(driving&&!arrived){progress=Math.min(1,progress+dt/tripDuration);const p=curve.getPointAt(progress),t=curve.getTangentAt(progress);player.group.position.copy(p);player.group.rotation.y=Math.atan2(t.x,t.z);if(!reduced.matches)player.group.position.y+=Math.sin(elapsed*17)*.025;if(progress>=1){arrived=true;driving=false;onArrive(destination);}}
    if(currentView==='road')followTruck();
    if(transition){const lerp=reduced.matches?1:1-Math.exp(-dt*4);controls.target.lerp(goalTarget,lerp);camera.position.lerp(goalPosition,lerp);span=THREE.MathUtils.lerp(span,goalSpan,lerp);const aspect=Math.max(host.clientWidth,1)/Math.max(host.clientHeight,1);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();if(camera.position.distanceTo(goalPosition)<.02)transition=false;}
    if(!reduced.matches){flag.rotation.y=Math.sin(elapsed*1.7)*.12;clouds.forEach((c,i)=>{c.position.x+=Math.sin(elapsed*.05+i)*dt*.09;});}
    controls.update();
    const cabActive=cockpitEnabled&&currentView==='road';
    cockpit.group.visible=cabActive;truck.group.visible=player===truck&&!cabActive;car.group.visible=player===car&&!cabActive;
    const width=Math.max(host.clientWidth,1),height=Math.max(host.clientHeight,1);
    renderer.setViewport(0,0,width,height);renderer.setScissorTest(false);renderer.clear();
    if(cabActive){
      // The game panel sits below on portrait/desktop and on the right in short landscape.
      const shortLandscape=width>height&&height<560;
      const viewWidth=shortLandscape?Math.round(width*.55):width;
      const viewHeight=shortLandscape?height:Math.round(height*.7);
      cabCamera.aspect=viewWidth/viewHeight;cabCamera.updateProjectionMatrix();cockpit.frame(cabCamera.aspect);
      cabPosition.copy(player.group.position);cabPosition.y+=player===car?1.05:1.5;
      const tangent=curve.getTangentAt(progress);
      cabPosition.addScaledVector(tangent,.65);
      const ahead=Math.min(1,progress+.045);
      cabLook.copy(curve.getPointAt(ahead));cabLook.y+=player===car?.98:1.28;
      // At arrival extrapolate the last heading, instead of looking back at the cab.
      if(ahead===progress||cabLook.distanceTo(cabPosition)<1.5)cabLook.copy(cabPosition).addScaledVector(tangent,4);
      cabDirection.subVectors(cabLook,cabPosition).normalize();
      const yaw=Math.atan2(cabDirection.x,cabDirection.z);
      if(!cabInitialized){cabCamera.position.copy(cabPosition);cabCamera.lookAt(cabLook);cabInitialized=true;}
      else {
        cabCamera.position.copy(cabPosition);
        cabRotation.setFromRotationMatrix(cabLookMatrix.lookAt(cabPosition,cabLook,worldUp));
        cabCamera.quaternion.slerp(cabRotation,reduced.matches?1:1-Math.exp(-dt*7));
      }
      const turn=THREE.MathUtils.euclideanModulo(yaw-player.group.rotation.y+Math.PI,Math.PI*2)-Math.PI;
      cockpit.update(turn*3,reduced.matches);
      renderer.setViewport(0,height-viewHeight,viewWidth,viewHeight);
      renderer.setScissor(0,height-viewHeight,viewWidth,viewHeight);renderer.setScissorTest(true);
      renderer.render(scene,cabCamera);renderer.setScissorTest(false);
    }else renderer.render(scene,camera);
    raf=requestAnimationFrame(animate);
  }
  function visibilityChanged(){
    cancelAnimationFrame(raf);raf=0;
    // Reset time so returning to the page never advances a hidden trip.
    if(!document.hidden&&!disposed){last=performance.now();raf=requestAnimationFrame(animate);}
  }
  document.addEventListener('visibilitychange',visibilityChanged);
  visibilityChanged();
  return {setView,setCargo,prepareTrip,setCockpit,setRegion,setDriving(active){driving=Boolean(active)&&!arrived;},reset(){setRegion(0);setCockpit(false);prepareTrip('pizzeria');setCargo([]);setView('overview');},dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibilityChanged);observer.disconnect();controls.dispose();cockpit.dispose();expansion.dispose();roadGeo.dispose();roadMat.dispose();m.dispose();renderer.dispose();renderer.domElement.remove();}};
}
