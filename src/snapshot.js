import {bootstrap,entry,fixtures,history,picks,transfers,currentEvent,ENTRY_ID} from "./fpl.js";
export async function buildSnapshot(){
 const [b,e,h,t,fx]=await Promise.all([bootstrap(),entry(),history(),transfers(),fixtures()]);
 const ev=currentEvent(b.events); if(!ev) throw new Error("No FPL event found");
 let p; try{p=await picks(ev.id)}catch{const last=b.events.filter(x=>x.finished).at(-1);if(!last)throw new Error("No published picks available");p=await picks(last.id)}
 const players=new Map(b.elements.map(x=>[x.id,x]));
 const squad=p.picks.map(x=>{const q=players.get(x.element);return {id:x.element,name:q?.web_name??"UNKNOWN",team:q?.team,position:x.position,multiplier:x.multiplier,captain:x.is_captain,vice_captain:x.is_vice_captain,price:q?.now_cost!=null?q.now_cost/10:null,status:q?.status??"UNKNOWN",news:q?.news??""}});
 return {source:"Fantasy Premier League public API",entry_id:ENTRY_ID,manager:{name:[e.player_first_name,e.player_last_name].filter(Boolean).join(" "),team_name:e.name},gameweek:{id:ev.id,name:ev.name,deadline:ev.deadline_time,finished:ev.finished},squad,bank:p.entry_history?.bank!=null?p.entry_history.bank/10:"UNKNOWN",free_transfers:"UNKNOWN_PUBLIC_API",chips:h.chips??[],transfers:t.slice(0,25),fixtures:fx.filter(x=>!x.finished).slice(0,30),generated_at:new Date().toISOString(),rules:{latest_public_picks_are_authoritative:true,never_infer_private_state:true}};
}
