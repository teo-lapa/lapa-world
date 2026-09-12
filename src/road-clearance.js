import * as THREE from 'three';
export const TOWN_ROUTES={
  pizzeria:[[-5.9,1.4],[-5.9,3],[-10.7,3.6],[-13.4,5.9],[-10.5,9.4],[0,9.4],[10.4,9.4],[13.4,6],[13.4,-2],[10.7,-.5],[7.2,-.5]],
  bakery:[[-5.9,1.4],[-5.9,3],[-10.7,3.6],[-13.4,5.9],[-10.5,9.4],[-3,9.4],[5.7,9.4],[7.1,7.8]],
};
export function roadClearance(routes){
  const samples=Object.values(routes).flatMap(points=>new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal').getSpacedPoints(400));
  return (x,z,radius=3.3)=>samples.every(p=>Math.hypot(p.x-x,p.z-z)>radius);
}
