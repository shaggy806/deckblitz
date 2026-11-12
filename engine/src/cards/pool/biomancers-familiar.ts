import { defineCard } from "../define.js";

// The reduction is Training Grounds' (an ability's mana kept at one or
// more). The {T} ability marks the creature's next adapt this turn, which
// then puts its counters on whatever it has; it adds no counters itself (the
// ruling).
const COST_TEXT =
  "Activated abilities of creatures you control cost {2} less to activate. This effect can't reduce the mana in that cost to less than one mana.";
const TAP_TEXT =
  "{T}: The next time target creature adapts this turn, it adapts as though it had no +1/+1 counters on it.";

export default defineCard({
  name: "Biomancer's Familiar",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Mutant"],
  power: 2,
  toughness: 2,
  text: `${COST_TEXT}\n${TAP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { type: "creature", controlledBy: "you" }, reduceGeneric: 2, leavesOneMana: true },
      text: COST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "adapt-as-though-no-counters", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
