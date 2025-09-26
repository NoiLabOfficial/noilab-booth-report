const clamp = (v:number,min=0,max=100)=>Math.max(min,Math.min(max,v));
export const accT1 = (c:number)=> c<=7?clamp(60*Math.pow(c/7,0.7)): (c<=10? clamp(60+10*((c-7)/3)) : clamp(70+30*Math.pow((c-10)/5,1.5)));
export const accT2 = (c:number)=> c<=11?clamp(60*Math.pow(c/11,0.7)):(c<=15?clamp(60+10*((c-11)/4)):clamp(70+30*Math.pow((c-15)/7,1.5)));

export const spdT1 = (rt:number)=>{ const MIN=1200, MAX=5000; const x=(MAX-rt)/(MAX-MIN); return clamp(100*Math.pow(Math.max(0,Math.min(1,x)),1.25)); };
export const spdT2 = (rt:number)=>{ const MIN=300, MAX=1300; const x=(MAX-rt)/(MAX-MIN); return clamp(100*Math.pow(Math.max(0,Math.min(1,x)),1.3)); };

export const metricsFromRaw = (acc1:number, sp1:number, acc2:number, sp2:number) => ({
  memory:        Math.round(0.85*acc1 + 0.15*sp1),
  comprehension: Math.round(0.75*acc1 + 0.25*sp1),
  endurance:     Math.round(0.60*acc1 + 0.40*sp1),
  focus:         Math.round(0.50*acc2 + 0.50*sp2),
  judgment:      Math.round(0.65*acc2 + 0.35*sp2),
  agility:       Math.round(0.30*acc2 + 0.70*sp2),
});

export const risks = (m:any)=>({
  r_adhd:     clamp(100 - (0.6*m.focus + 0.4*m.judgment)),
  r_stress:   clamp(100 - (0.5*m.endurance + 0.3*m.focus + 0.2*m.agility)),
  r_dementia: clamp(100 - (0.5*m.memory + 0.3*m.comprehension + 0.2*m.judgment)),
  r_forget:   clamp(100 - (0.7*m.memory + 0.3*m.focus)),
});

export const ci = (m:any)=> (m.memory+m.comprehension+m.focus+m.judgment+m.agility+m.endurance)/6;

export const brainAge = (ciSelf:number, ciPeer:number, age:number)=>{
  const ba = Math.round(Math.max(age-15, Math.min(age+15, age - 0.25*(ciSelf-ciPeer))));
  return ba;
};
