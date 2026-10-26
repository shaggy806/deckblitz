import { defineCard } from "../define.js";

const TEXT = "{T}: Each creature attacks this turn if able.";

// A rule for the turn over every creature (the `filter` form of `restrict`), so one
// that enters or becomes a creature after it resolves must attack too (the ruling).
export default defineCard({
  name: "Goblin Diplomats",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "restrict", filter: { type: "creature" }, restrictions: ["must-attack"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
