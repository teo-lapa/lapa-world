import * as THREE from 'three';

// Coordinates are also used by arrival cameras and the journey tests.
export const REGION_DESTINATIONS = {
  pizzeria:{chapter:0,x:6.8,z:-4.2}, bakery:{chapter:0,x:5.7,z:3.25},
  gelateria:{chapter:1,x:29,z:0},
  trattoria:{chapter:2,x:27,z:24}, market:{chapter:2,x:36,z:24},
  farm:{chapter:3,x:1,z:24}, supplier:{chapter:3,x:10,z:24},
  hotel:{chapter:4,x:-20,z:24}, harbor:{chapter:5,x:-35,z:0},
  mountain:{chapter:6,x:-31,z:-30}, festival:{chapter:7,x:6,z:-30},
};
const start=[[-5.9,1.4],[-5.9,3],[-10.7,3.6],[-13.4,5.9]];
const south=[...start,[-10.5,9.4],[0,9.4]];
const east=[...south,[10.4,9.4],[13.4,6]];
const westNorth=[...start,[-13.4,0],[-13.4,-5]];
export const EXPANSION_ROUTES = {
  gelateria:[...east,[20,6],[29,6]],
  trattoria:[...east,[20,6],[29,6],[29,15],[23,19],[23,30],[27,30]],
  market:[...east,[20,6],[35,6],[41,12],[41,21],[41,30],[36,30]],
  farm:[...south,[5.7,9.4],[5.7,16],[-3,19],[-3,30],[1,30]],
  supplier:[...south,[5.7,9.4],[5.7,16],[14,19],[14,30],[10,30]],
  hotel:[...start,[-20,6],[-25,12],[-25,23],[-25,30],[-20,30]],
  harbor:[...start,[-22,6],[-29,6],[-35,6]],
  mountain:[...westNorth,[-20,-7],[-25,-13],[-25,-21],[-25,-24],[-31,-24]],
  festival:[...east,[13.4,-2],[13.4,-7],[20,-12],[20,-20],[17,-24],[6,-24]],
};
// New road sections only: buildings sit behind the destination's stopping lane.
const branches={
  1:[[13.4,6],[20,6],[29,6]],
  2:[[29,6],[29,15],[23,19],[23,30],[27,30]],
  3:[[5.7,9.4],[5.7,16],[-3,19],[-3,30],[1,30]],
  4:[[-13.4,5.9],[-20,6],[-25,12],[-25,23],[-25,30],[-20,30]],
  5:[[-13.4,5.9],[-22,6],[-29,6],[-35,6]],
  6:[[-13.4,-5],[-20,-7],[-25,-13],[-25,-21],[-25,-24],[-31,-24]],
  7:[[13.4,-7],[20,-12],[20,-20],[17,-24],[6,-24]],
};
const tiles=[[29,0,13,13],[32,24,14,14],[5,24,13,14],[-20,24,13,14],[-35,0,14,13],[-29,-25,15,15],[8,-27,16,14]];
const names={gelateria:'GELATERIA',trattoria:'TRATTORIA',market:'MERCATO',farm:'FATTORIA',supplier:'FORNITORE',hotel:'HOTEL LAGO',harbor:'PORTO',mountain:'RIFUGIO',festival:'FESTA LAPA'};
const colors=['#eb96b0','#df8455','#79a369','#729eca','#4bafb7','#918dbc','#e9b84a'];
export function createExpansion(scene,m){
  const regions=[],frontiers=[];
  const roadSamples=Object.values(EXPANSION_ROUTES).flatMap(points=>new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal').getSpacedPoints(180));
  const roadGeometries=[];
  function pave(group,points){
    const c=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.1,z)),false,'centripetal');
    const n=Math.ceil(c.getLength()*2);
    function ribbon(width,y,color){
      const vertices=[],indices=[];
      for(let i=0;i<=n;i++){
        const p=c.getPointAt(i/n),t=c.getTangentAt(i/n);
        for(const side of [-1,1])vertices.push(p.x+t.z*width*.5*side,y,p.z-t.x*width*.5*side);
        if(i<n){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();roadGeometries.push(geometry);
      m.mesh(group,geometry,color,[0,0,0],[1,1,1]);
    }
    ribbon(6,.06,'#8bbd83');ribbon(4.25,.11,'#dad7bd');ribbon(3.55,.16,'#688084');
    for(let i=0;i<n;i+=5){const p=c.getPointAt(i/n),t=c.getTangentAt(i/n);const dash=m.box(group,'#f7edc9',[p.x,.18,p.z],[.1,.018,.8]);dash.rotation.y=Math.atan2(t.x,t.z);}
  }
  for(let chapter=1;chapter<=7;chapter++){
    const g=new THREE.Group();scene.add(g);regions.push(g);
    const [cx,cz,rx,rz]=tiles[chapter-1];
    m.cyl(g,'#c3b086',[cx,-.6,cz],[rx,1.15,rz]);m.cyl(g,'#91c88c',[cx,-.02,cz],[rx,.18,rz]);
    pave(g,branches[chapter]);
    if(chapter===2)pave(g,[[29,6],[35,6],[41,12],[41,21],[41,30],[36,30]]);
    if(chapter===3)pave(g,[[5.7,16],[14,19],[14,30],[10,30]]);
    // Road embankments support stretches between the small islands of land.
    for(let i=1;i<branches[chapter].length;i++){
      const a=branches[chapter][i-1],b=branches[chapter][i],dx=b[0]-a[0],dz=b[1]-a[1];
      const emb=m.box(g,'#8bbd83',[(a[0]+b[0])/2,-.25,(a[1]+b[1])/2],[6,.6,Math.hypot(dx,dz)+2]);emb.rotation.y=Math.atan2(dx,dz);
    }
    Object.entries(REGION_DESTINATIONS).filter(([,d])=>d.chapter===chapter).forEach(([id,d])=>{
      const shop=new THREE.Group();shop.position.set(d.x,0,d.z);g.add(shop);
      const accent=colors[chapter-1],height=id==='hotel'?5:2.8;
      m.box(shop,'#e4dcc1',[0,.12,0],[6.2,.2,5.4]);
      m.box(shop,id==='farm'?'#de7862':'#ffebbd',[0,height/2,0],[5,height,3.8],true);
      m.box(shop,accent,[0,height+.12,0],[5.5,.3,4.3],true);
      for(const xx of [-1.65,0,1.65]){
        m.box(shop,'#77b6ca',[xx,1.2,1.92],[1.05,1.55,.08]);
        if(id==='hotel')m.box(shop,'#77b6ca',[xx,3.65,1.92],[1.05,1.25,.08]);
      }
      m.label(shop,names[id],[0,height-.35,1.99],4.65,{color:accent,height:.52});
      for(let i=0;i<10;i++)m.box(shop,i%2?'#fff7df':accent,[-2.5+i*.55,2.1,2.45],[.55,.13,1.1]);
      m.box(shop,'#eadfbd',[0,.12,3.65],[6,.16,2]);
      // Customer standing at the front door.
      m.cyl(shop,accent,[.9,.65,3.4],[.22,.65,.22]);m.mesh(shop,m.ball,'#e8af85',[.9,1.18,3.4],[.24,.26,.24]);
      if(id==='gelateria')for(let i=0;i<3;i++)m.mesh(shop,m.ball,['#ed91ab','#fff3bf','#9bcd9a'][i],[-1+i,3.6,0],[.65,.65,.65]);
      if(id==='farm'||id==='supplier')for(let i=0;i<4;i++)m.crate(shop,['#d4ac62','#8eaf59'][i%2],[-3.5,0,-2+i*1.1],.75);
      if(id==='market')for(let i=0;i<4;i++){m.box(shop,'#b98351',[-2+i*1.3,.6,3.4],[1,.8,.65]);m.mesh(shop,m.ball,['#df6b4a','#eabc44','#87b557','#d68554'][i],[-2+i*1.3,1.1,3.4],[.35,.3,.3]);}
    });
    // Trees stay clear of all customer yards and road approaches.
    for(let i=0;i<7;i++){const x=cx-rx+2+i*2.5,z=cz-rz+3;if(roadSamples.every(p=>Math.hypot(p.x-x,p.z-z)>3.3))m.tree(g,x,z,.8+(i%3)*.15,chapter===6);}
    if(chapter===3)for(let row=0;row<4;row++)for(let col=0;col<7;col++)m.mesh(g,m.ball,'#b2ce62',[-3+col*.8,.25,15+row*.65],[.25,.3,.25]);
    if(chapter===4||chapter===5){
      m.cyl(g,'#58b8db',[cx-5,.085,cz-3],[5,.08,6]);
      for(let i=0;i<6;i++)m.box(g,'#bee9ed',[cx-7+(i%2)*2,.14,cz-6+i],[1.3,.02,.1]);
      m.box(g,'#b78756',[cx-4,.35,cz+2],[5,.35,1.5]);
      const boat=m.box(g,'#f7f2dc',[cx-7,.42,cz],[1.4,.55,2.6]);boat.rotation.y=.35;
      m.cyl(g,'#a57c4e',[cx-7,1.65,cz],[.055,2.7,.055]);
      m.box(g,'#f0b65d',[cx-6.6,2,cz],[.8,1.2,.06]);
    }
    if(chapter===6)for(const [x,z,s] of [[-37,-34,5],[-27,-36,6],[-20,-32,4]]){m.mesh(g,m.cone,'#84aaa2',[x,2,z],[s,7,s]);m.mesh(g,m.cone,'#fff7e6',[x,4.8,z],[s*.33,2.4,s*.33]);}
    if(chapter===7){
      for(let i=0;i<5;i++){
        m.cyl(g,'#b8946c',[i*2+1,2.8,-34],[.025,5,.025]);
        m.mesh(g,m.ball,colors[i],[i*2+1,5.5,-34],[.7,.9,.7]);
      }
      m.cyl(g,'#f3cf72',[12,.2,-30],[2.3,.25,2.3]);m.mesh(g,m.cone,'#e78070',[12,3,-30],[2.5,2,2.5]);
      for(const x of [10.4,13.6])m.cyl(g,'#faf0d6',[x,1.3,-30],[.07,2.6,.07]);
    }
    const frontier=new THREE.Group();scene.add(frontier);frontiers.push(frontier);
    const [fx,fz]=branches[chapter][0];
    m.cyl(frontier,'#a3845d',[fx,1,fz],[.08,2,.08]);
    m.label(frontier,`CAPITOLO ${chapter+1}`,[fx,1.8,fz+.12],3.8,{color:'#678696',background:'#e8f4ef',height:.6});
    // Opaque clouds obscure the next frontier; later land is completely absent.
    for(let i=0;i<4;i++)m.mesh(frontier,m.ball,'#eff5ed',[cx-3+i*2.5,1.2+(i%2),cz],[4.5,2.1,4]);
  }
  function setRegion(value){const chapter=Math.max(0,Math.min(7,Math.trunc(Number(value)||0)));regions.forEach((g,i)=>{g.visible=i<chapter;});frontiers.forEach((g,i)=>{g.visible=i===chapter;});return chapter;}
  setRegion(0);
  return {setRegion,dispose(){roadGeometries.forEach(g=>g.dispose());}};
}

export function createPassengerCar(parent,m){
  const g=new THREE.Group();parent.add(g);
  m.box(g,'#236bb9',[0,.65,0],[1.5,.6,2.65],true);
  m.box(g,'#388bd1',[0,1.04,-.15],[1.28,.65,1.5],true);
  m.box(g,'#b7e7f0',[0,1.11,.62],[1.1,.38,.04]);
  m.box(g,'#90cee7',[0,1.11,-.92],[1.1,.38,.04]);
  for(const x of [-.65,.65])m.box(g,'#a6dcec',[x,1.12,-.15],[.025,.36,1.1]);
  for(const x of [-.77,.77])for(const z of [-.85,.85]){const tire=m.cyl(g,'#29434e',[x,.37,z],[.34,.18,.34]);tire.rotation.z=Math.PI/2;const hub=m.cyl(g,'#e3ecdd',[x*1.02,.37,z],[.17,.2,.17]);hub.rotation.z=Math.PI/2;}
  for(const x of [-.48,.48])m.box(g,'#fff1b2',[x,.67,1.34],[.28,.2,.04]);
  m.box(g,'#e0e9e4',[0,.43,1.35],[1.4,.14,.1]);
  return {group:g};
}
