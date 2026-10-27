import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 12193. Entwine: Rain of Rust's shape.

export default defineCard({
  name: "Wail of the Nim",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  kicker: { cost: "{B}", keyword: "entwine" },
  text: "Choose one —\n• Regenerate each creature you control.\n• Wail of the Nim deals 1 damage to each creature and each player.\nEntwine {B} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Regenerate each creature you control.",
        targets: [],
        effect: { kind: "regenerate-all", filter: { type: "creature", controlledBy: "you" } },
      },
      {
        text: "Wail of the Nim deals 1 damage to each creature and each player.",
        targets: [],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
            { kind: "damage", amount: 1, who: "each-player" },
          ],
        },
      },
    ],
    kickedModes: 2,
  },
});
