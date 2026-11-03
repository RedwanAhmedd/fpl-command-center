import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export function parseDeadline(payload, now = new Date()) {
  if (!Array.isArray(payload?.events)) throw new Error("Official bootstrap JSON missing events");
  const future = payload.events.filter(e => typeof e.deadline_time === "string" && Number.isFinite(Date.parse(e.deadline_time)) && Date.parse(e.deadline_time) > now.getTime()).sort((a,b)=>Date.parse(a.deadline_time)-Date.parse(b.deadline_time));
  const next = future[0];
  if (!next || !Number.isInteger(next.id)) throw new Error("No valid future FPL deadline");
  const deadline = new Date(next.deadline_time);
  return {
    source: "https://fantasy.premierleague.com/api/bootstrap-static/",
    entry_id: 1169933,
    fetched_at_utc: now.toISOString(),
    gameweek: next.id,
    deadline_utc: deadline.toISOString(),
    deadline_asia_dhaka: new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(deadline),
    minutes_until_deadline: Math.floor((deadline.getTime()-now.getTime())/60000),
    status: "verified_official"
  };
}

export async function fetchDeadline(fetchImpl = fetch, now = new Date()) {
  const url="https://fantasy.premierleague.com/api/bootstrap-static/";
  let error;
  for (let attempt=0;attempt<3;attempt++) {
    try {
      const response=await fetchImpl(url,{signal:AbortSignal.timeout(12000),headers:{"Accept":"application/json","User-Agent":"FPL-Command-Center/1.0"}});
      if (!response.ok) throw new Error("HTTP "+response.status);
      return parseDeadline(await response.json(),now);
    } catch(e) {
      error=e;
      if(attempt<2) await new Promise(r=>setTimeout(r,1000*(attempt+1)));
    }
  }
  throw new Error("Official FPL deadline fetch failed after 3 attempts: "+String(error));
}

async function main() {
  const out=resolve(process.argv[2]||"artifacts/fpl-deadline.json");
  await mkdir(dirname(out),{recursive:true});
  try {
    const result=await fetchDeadline();
    await writeFile(out,JSON.stringify(result,null,2)+"\n");
    console.log(JSON.stringify(result));
  } catch(error) {
    const failed={source:"https://fantasy.premierleague.com/api/bootstrap-static/",entry_id:1169933,fetched_at_utc:new Date().toISOString(),status:"unverified",error:String(error)};
    await writeFile(out,JSON.stringify(failed,null,2)+"\n");
    console.error(error);
    process.exitCode=1;
  }
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) await main();
