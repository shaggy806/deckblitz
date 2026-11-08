import { defineCard } from "../define.js";

const TEXT =
  "Whenever one or more +1/+1 counters are put on this creature for the first time each turn, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";

// The timing wrapper's `firstTimeEachTurn` on `counters-put` (B278): counted
// per object, of +1/+1 counters only, from the journal.
export default defineCard({
  name: "Axgard Artisan",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
