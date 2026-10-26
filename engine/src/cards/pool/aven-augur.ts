import { defineCard } from "../define.js";

export default defineCard({
  name: "Aven Augur",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nSacrifice this creature: Return up to two target creatures to their owners' hands. Activate only during your upkeep.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      // Into the Void's shape: two distinct optional slots, moved as one event.
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      resolve: null,
      text: "Sacrifice this creature: Return up to two target creatures to their owners' hands. Activate only during your upkeep.",
    },
  ],
});
