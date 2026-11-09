import { defineCard } from "../define.js";

const EXILE_TEXT =
  "Exile the top card of your library: Put X +1/+1 counters on this creature, where X is the exiled card's mana value.";

// EDHREC rank 15221. "When this creature's power is 7 or greater" is a state
// trigger (rule 603.8); it sacrifices even if the power has since dropped
// (its ruling).
export default defineCard({
  name: "Phyrexian Devourer",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 1,
  toughness: 1,
  text: `When this creature's power is 7 or greater, sacrifice it.\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "state", state: { kind: "source", filter: { power: { op: "gte", n: 7 } } } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When this creature's power is 7 or greater, sacrifice it.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, do: { kind: "exile-from-library", amount: 1 } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { manaValueOf: { paid: "exiled" } } },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
