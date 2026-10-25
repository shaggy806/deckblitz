import { defineCard } from "../define.js";

// A spell dealing damage is an instant or sorcery (a permanent spell deals none
// from the stack). `plus: -1` never takes the damage below 0.
const MINUS =
  "If a spell would deal damage to a permanent or player, it deals that much damage minus 1 to that permanent or player instead.";

export default defineCard({
  name: "Benevolent Unicorn",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 1,
  toughness: 2,
  text: MINUS,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", plus: -1, source: { typesAnyOf: ["instant", "sorcery"] } },
      text: MINUS,
    },
  ],
});
