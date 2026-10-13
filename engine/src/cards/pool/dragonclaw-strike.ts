import { defineCard } from "../define.js";

// EDHREC rank 11960.
//
// Rulings:
//   [2025-04-04] If an effect instructs you to “double” a creature’s power, that creature gets
//     +X/+0, where X is its power as that effect begins to apply. Similarly, a creature whose
//     toughness is doubled gets +0/+X, where X is its toughness as the effect begins to apply.

export default defineCard({
  name: "Dragonclaw Strike",
  manaCost: "{2/G}{2/U}{2/R}",
  colors: ["U", "R", "G"],
  types: ["sorcery"],
  text: "Double the power and toughness of target creature you control until end of turn. Then it fights up to one target creature an opponent controls. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
  // Epic Fight's doubling (+X/+X read as it applies), then Primal Might's
  // fight with an optional second slot.
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: 0, doubling: true },
        toughness: { toughnessOf: 0, doubling: true },
        duration: "end-of-turn",
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
