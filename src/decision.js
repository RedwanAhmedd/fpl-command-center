const r1=n=>Math.round(n*10)/10;
function teamName(id,teams){return teams.get(id)?.short_name??String(id)}
function futureFor(playerId,fixtures,teams,count=8){return fixtures.filter(f=>!f.finished&&(f.team_h===playerId.team||f.team_a===playerId.team)).slice(0,count).map(f=>{const home=f.team_h===playerId.team;const opp=home?f.team_a:f.team_h;return {gw:f.event,opponent:teamName(opp,teams),venue:home?"H":"A",difficulty:home?f.team_h_difficulty:f.team_a_difficulty,kickoff:f.kickoff_time}})}
function avgDifficulty(xs,n){const a=xs.slice(0,n).map(x=>x.difficulty).filter(Number.isFinite);return a.length?r1(a.reduce((s,x)=>s+x,0)/a.length):null}
export function buildDecisionLayer({bootstrap,fixtures,snapshot}){
 const teams=new Map(bootstrap.teams.map(t=>[t.id,t]));
 const elements=new Map(bootstrap.elements.map(p=>[p.id,p]));
 const owned=new Set(snapshot.squad.map(p=>p.id));
 const squad=snapshot.squad.map(s=>{const p=elements.get(s.id)||{};const upcoming=futureFor(p,fixtures,teams);return {...s,team_name:teamName(p.team,teams),form:Number(p.form)||0,points:p.total_points??null,minutes:p.minutes??null,selected_by_percent:Number(p.selected_by_percent)||0,expected_goals:Number(p.expected_goals)||0,expected_assists:Number(p.expected_assists)||0,expected_goal_involvements:Number(p.expected_goal_involvements)||0,points_per_game:Number(p.points_per_game)||0,fixtures_3:upcoming.slice(0,3),fixtures_6:upcoming.slice(0,6),fixture_difficulty_3:avgDifficulty(upcoming,3),fixture_difficulty_6:avgDifficulty(upcoming,6)}});
 const available=bootstrap.elements.filter(p=>!owned.has(p.id)).map(p=>{const upcoming=futureFor(p,fixtures,teams);return {id:p.id,name:p.web_name,team:teamName(p.team,teams),position:p.element_type,price:p.now_cost/10,status:p.status,news:p.news,form:Number(p.form)||0,points:p.total_points,minutes:p.minutes,selected_by_percent:Number(p.selected_by_percent)||0,xGI:Number(p.expected_goal_involvements)||0,ppg:Number(p.points_per_game)||0,fixture_difficulty_3:avgDifficulty(upcoming,3),fixture_difficulty_6:avgDifficulty(upcoming,6),fixtures_6:upcoming.slice(0,6)}}).filter(p=>p.status!=="u");
 const watchlist=[...available].sort((a,b)=>(b.ppg+b.form)-(a.ppg+a.form)).slice(0,30);
 const flags=squad.filter(p=>p.status!=="a"||p.news).map(p=>({name:p.name,status:p.status,news:p.news}));
 return {generated_at:new Date().toISOString(),horizons:{tactical:3,primary:6,structural:8},squad,flags,watchlist,principles:{objective:"maximize expected rank gain",price_rule:"price accelerates a football decision; it does not create one",transfer_rule:"compare roll vs 1-transfer vs 2-transfer routes before acting",captaincy_rule:"evaluate only realistic owned starters",uncertainty_rule:"unknown private state stays UNKNOWN"}};
}
