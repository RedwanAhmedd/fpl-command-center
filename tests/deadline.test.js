import test from "node:test";
import assert from "node:assert/strict";
import { parseDeadline } from "../src/deadline-snapshot.js";
test("chooses earliest future deadline regardless of is_next flag",()=>{
  const data={events:[{id:10,deadline_time:"2026-11-06T18:30:00Z",is_next:false},{id:11,deadline_time:"2026-11-13T18:30:00Z",is_next:true}]};
  const r=parseDeadline(data,new Date("2026-11-03T12:00:00Z"));
  assert.equal(r.gameweek,10);
  assert.equal(r.deadline_utc,"2026-11-06T18:30:00.000Z");
  assert.match(r.deadline_asia_dhaka,/11\/07\/2026|2026-11-07|11\/7\/2026/);
});
test("rejects missing and expired deadlines",()=>{
  assert.throws(()=>parseDeadline({},new Date()),/missing events/);
  assert.throws(()=>parseDeadline({events:[{id:1,deadline_time:"2020-01-01T00:00:00Z"}]},new Date()),/No valid future/);
});
