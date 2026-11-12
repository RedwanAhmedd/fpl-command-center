import test from "node:test";
import assert from "node:assert/strict";
import {transferEngine} from "../src/engine.js";
const fixture={gw:11,opponent:"FUL",venue:"H",difficulty:2};
const player=(name,position)=>({name,position,price:5,status:"a",points_per_game:3,form:3,expected_goal_involvements:1,fixtures_6:[fixture]});
test("transfer recommendations preserve FPL positions and do not invent selling prices",()=>{
  const squad=[player("GK",1),player("DEF",2),player("MID",6),player("FWD",9)];
  const watchlist=[{...player("NewDEF",2),position:2},{...player("NewMID",3),position:3},{...player("NewFWD",4),position:4}];
  const result=transferEngine({squad,watchlist},{bank:0.3,free_transfers:"UNKNOWN_PUBLIC_API"});
  for(const route of result.one_transfer){
    const out=route.out[0],inn=route.in[0];
    const expected=out==="DEF"?2:out==="MID"?3:out==="FWD"?4:1;
    assert.equal(watchlist.find(x=>x.name===inn).position,expected);
    assert.equal(route.affordable,"UNKNOWN");
    assert.equal(route.bank_after,"UNKNOWN");
  }
  assert.ok(result.one_transfer.length>0);
});
