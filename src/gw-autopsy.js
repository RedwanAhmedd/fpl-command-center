import {writeFile,mkdir} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {bootstrap,history,picks,transfers,ENTRY_ID} from "./fpl.js";
const out=resolve(process.argv[2]||"artifacts/fpl-gw-autopsy.json");
await mkdir(dirname(out),{recursive:true});
try {
  const [b,h,t]=await Promise.all([bootstrap(),history(),transfers()]);
  const finished=b.events.filter(e=>e.finished).sort((a,z)=>a.id-z.id);
  const ev=finished.at(-1);
  if(!ev) throw new Error("No completed official gameweek");
  const previous=h.current?.find(x=>x.event===ev.id-1);
  const current=h.current?.find(x=>x.event===ev.id);
  if(!current) throw new Error("Missing official entry GW history");
  const [p,liveResponse]=await Promise.all([
    picks(ev.id),
    fetch("https://fantasy.premierleague.com/api/event/"+ev.id+"/live/",{signal:AbortSignal.timeout(20000)})
  ]);
  if(!liveResponse.ok) throw new Error("Official event live HTTP "+liveResponse.status);
  const live=await liveResponse.json();
  const scores=new Map((live.elements||[]).map(x=>[x.id,x]));
  const names=new Map(b.elements.map(x=>[x.id,x.web_name]));
  const players=p.picks.map(x=>{
    const l=scores.get(x.element);
    if(!l||!Number.isFinite(l.stats?.total_points)) throw new Error("Missing live points for "+x.element);
    return {id:x.element,name:names.get(x.element)||"UNKNOWN",position:x.position,
      multiplier:x.multiplier,captain:!!x.is_captain,vice:!!x.is_vice_captain,
      raw_points:l.stats.total_points,counted_points:l.stats.total_points*x.multiplier,
      minutes:l.stats.minutes??null,explain:l.explain??[]};
  });
  if(players.length!==15||new Set(players.map(x=>x.id)).size!==15) throw new Error("Invalid GW picks");
  const captain=players.find(x=>x.captain);
  const vice=players.find(x=>x.vice);
  const bench=players.filter(x=>x.position>11);
  const counted=players.reduce((s,x)=>s+x.counted_points,0);
  const eventTransfers=t.filter(x=>x.event===ev.id).map(x=>({
    time:x.time??null,in_id:x.element_in,out_id:x.element_out,
    in:names.get(x.element_in)||"UNKNOWN",out:names.get(x.element_out)||"UNKNOWN"
  }));
  const result={
    source:"Official FPL entry history, event picks and event live endpoints",
    status:"verified_official",entry_id:ENTRY_ID,generated_at:new Date().toISOString(),
    gameweek:ev.id,finished:ev.finished,deadline_utc:ev.deadline_time,
    points:current.points,total_points:current.total_points,overall_rank:current.overall_rank,
    previous_rank:previous?.overall_rank??null,
    rank_change:previous?.overall_rank!=null?previous.overall_rank-current.overall_rank:null,
    bench_points_official:current.points_on_bench,
    transfer_count:current.event_transfers,transfer_cost:current.event_transfers_cost,
    bank_after_gw:current.bank!=null?current.bank/10:null,
    captain,vice,players,bench,
    counted_points_from_picks:counted,
    official_points_reconciliation:{official:current.points,picks_counted:counted,
      difference:current.points-counted,
      note:"Difference may reflect event chips, substitutions, deductions, or scoring nuances; do not assume direct equivalence."},
    transfers:eventTransfers,
    captain_alternatives:players.filter(x=>x.position<=11&&x.id!==captain?.id)
      .map(x=>({name:x.name,raw_points:x.raw_points,
        realized_extra_if_captained:x.raw_points-(captain?.raw_points??0)}))
      .sort((a,z)=>z.realized_extra_if_captained-a.realized_extra_if_captained),
    caveat:"Hindsight captain comparison is descriptive, not evidence of a superior pre-deadline prediction."
  };
  await writeFile(out,JSON.stringify(result,null,2)+"\n");
  console.log("Official autopsy verified GW"+ev.id);
} catch(error) {
  await writeFile(out,JSON.stringify({status:"unverified",entry_id:ENTRY_ID,
    generated_at:new Date().toISOString(),error:String(error)},null,2)+"\n");
  console.error(error);
  process.exitCode=1;
}
