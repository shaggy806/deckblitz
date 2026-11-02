import { defineCard } from "../define.js";

const ENTERS = "This creature enters with X +1/+1 counters on it.";
const NO_BLOCK = "This creature can't block.";
const TAX = "This creature can't attack unless you pay {1} for each +1/+1 counter on it.";

// A cost to attack (rule 508.1h) counted as it's determined: a counter gained
// or lost before the declaration changes it.
export default defineCard({
  name: "Phyrexian Marauder",
  manaCost: "{X}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 0,
  toughness: 0,
  text: `${ENTERS}\n${NO_BLOCK}\n${TAX}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS,
    },
    { affects: { scope: "self" }, restrictions: ["cant-block"], text: NO_BLOCK },
    { affects: { scope: "self" }, combatTax: { on: ["attack"], generic: 1, perCounter: "+1/+1" }, text: TAX },
  ],
});
