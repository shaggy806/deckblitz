import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 18867.
//
// "Activate only before the combat damage step": any step of the turn up to
// and including the declare blockers step. The combat damage step is one
// `Step` even with first strike, so the first-strike damage step is out too.

const TEXT =
  "{G}{W}{U}, {T}: Prevent all combat damage that would be dealt this turn. Activate only before the combat damage step.";

export default defineCard({
  name: "Angus Mackenzie",
  manaCost: "{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{W}{U}", tap: true },
      condition: {
        kind: "turn-structure",
        steps: ["upkeep", "draw", "precombat-main", "begin-combat", "declare-attackers", "declare-blockers"],
      },
      targets: [],
      effect: { kind: "prevent-all-combat-damage" },
      resolve: null,
      text: TEXT,
    },
  ],
});
