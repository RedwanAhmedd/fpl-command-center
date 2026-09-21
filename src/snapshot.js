import {bootstrap,entry,fixtures,history,picks,transfers,currentEvent,ENTRY_ID} from "./fpl.js";

export async function buildSnapshot(){
  const [b,e,h,t,fx]=await Promise.all([bootstrap(),entry(),history(),transfers(),fixtures()]);
  const ev=currentEvent(b.events);
  if(!ev) throw new Error("No FPL event found");

  let p, publishedEvent=ev;
  try {
    p=await picks(ev.id);
  } catch {
    const last=b.events.filter(x=>x.finished).at(-1);
    if(!last) throw new Error("No published picks available");
    publishedEvent=last;
    p=await picks(last.id);
  }

  const players=new Map(b.elements.map(x=>[x.id,x]));
  const teams=new Map(b.teams.map(x=>[x.id,x]));
  const squad=p.picks.map(x=>{
    const q=players.get(x.element);
    return {
      id:x.element,
      name:q?.web_name??"UNKNOWN",
      team_id:q?.team??null,
      team:q?.team?teams.get(q.team)?.short_name??null:null,
      position:x.position,
      multiplier:x.multiplier,
      captain:x.is_captain,
      vice_captain:x.is_vice_captain,
      price:q?.now_cost!=null?q.now_cost/10:null,
      status:q?.status??"UNKNOWN",
      news:q?.news??"",
      minutes:q?.minutes??null,
      total_points:q?.total_points??null,
      form:q?.form??null,
      xg:q?.expected_goals??null,
      xa:q?.expected_assists??null,
      xgi:q?.expected_goal_involvements??null,
      selected_by_percent:q?.selected_by_percent??null
    };
  });

  const currentHistory=(h.current??[]).find(x=>x.event===publishedEvent.id)??p.entry_history??null;
  const captain=squad.find(x=>x.captain)??null;
  const viceCaptain=squad.find(x=>x.vice_captain)??null;

  return {
    source:"Fantasy Premier League public API",
    source_precedence:["fresh_official_public_fpl","verified_current_user_evidence","confirmed_transactions","older_stored_state"],
    entry_id:ENTRY_ID,
    manager:{
      name:[e.player_first_name,e.player_last_name].filter(Boolean).join(" "),
      team_name:e.name,
      overall_points:e.summary_overall_points??null,
      overall_rank:e.summary_overall_rank??null,
      last_gw_points:e.summary_event_points??null,
      last_gw_rank:e.summary_event_rank??null
    },
    gameweek:{
      id:publishedEvent.id,
      name:publishedEvent.name,
      deadline:publishedEvent.deadline_time,
      finished:publishedEvent.finished,
      current_official_event:ev.id
    },
    gw_stats:currentHistory?{
      points:currentHistory.points??null,
      total_points:currentHistory.total_points??null,
      overall_rank:currentHistory.overall_rank??null,
      rank:currentHistory.rank??null,
      rank_sort:currentHistory.rank_sort??null,
      event_transfers:currentHistory.event_transfers??null,
      event_transfers_cost:currentHistory.event_transfers_cost??null,
      points_on_bench:currentHistory.points_on_bench??null,
      bank:currentHistory.bank!=null?currentHistory.bank/10:null,
      value:currentHistory.value!=null?currentHistory.value/10:null
    }:null,
    captain:captain?{id:captain.id,name:captain.name,multiplier:captain.multiplier}:null,
    vice_captain:viceCaptain?{id:viceCaptain.id,name:viceCaptain.name}:null,
    squad,
    bank:p.entry_history?.bank!=null?p.entry_history.bank/10:"UNKNOWN",
    free_transfers:"UNKNOWN_PUBLIC_API",
    chips:h.chips??[],
    active_chip:p.active_chip??null,
    history:h.current??[],
    transfers:t.slice(0,100),
    fixtures:fx.filter(x=>!x.finished).slice(0,60),
    generated_at:new Date().toISOString(),
    rules:{
      latest_public_picks_are_authoritative:true,
      confirmed_sales_override_stale_text:true,
      never_infer_private_state:true,
      never_execute_transfers:true
    }
  };
}
