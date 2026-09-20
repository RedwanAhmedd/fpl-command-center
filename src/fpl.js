const BASE="https://fantasy.premierleague.com/api";
export const ENTRY_ID=1169933;
async function get(path){const r=await fetch(BASE+path,{headers:{"User-Agent":"FPL-Command-Center/0.1"}});if(!r.ok)throw new Error(`FPL API ${r.status}: ${path}`);return r.json();}
export async function bootstrap(){return get("/bootstrap-static/")}
export async function fixtures(){return get("/fixtures/")}
export async function entry(){return get(`/entry/${ENTRY_ID}/`)}
export async function history(){return get(`/entry/${ENTRY_ID}/history/`)}
export async function transfers(){return get(`/entry/${ENTRY_ID}/transfers/`)}
export async function picks(gw){return get(`/entry/${ENTRY_ID}/event/${gw}/picks/`)}
export function currentEvent(events){return events.find(e=>e.is_current)||events.find(e=>e.is_next)||events.filter(e=>e.finished).at(-1)}
