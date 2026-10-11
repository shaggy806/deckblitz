import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 13281. Marvel Super Heroes Commander.
//
// The Soldiers are counted as each trigger resolves: the +1/+1 counters on
// it then (as it last existed, if it has left).

const ENTER_TEXT = "This Vehicle enters with X +1/+1 counters on it.";
const SOLDIER_TEXT =
  "Whenever this Vehicle enters or attacks, create a number of 1/1 white Soldier creature tokens equal to the number of +1/+1 counters on it.";

const SOLDIERS = {
  kind: "create-token",
  token: "Soldier Token",
  count: { countersOn: "source", counter: "+1/+1" },
} as const;

export default defineCard({
  name: "Royal Talon Fighter Jet",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${SOLDIER_TEXT}\nCrew 2`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: SOLDIERS, resolve: null, text: SOLDIER_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: SOLDIERS, resolve: null, text: SOLDIER_TEXT },
  ],
  activated: [crew(2)],
});
