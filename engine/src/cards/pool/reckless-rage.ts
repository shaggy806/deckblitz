import { defineCard } from "../define.js";

// Rulings: it can't be cast without both targets, and if one of them is
// illegal as it resolves the other is still dealt its damage.
export default defineCard({
  name: "Reckless Rage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Reckless Rage deals 4 damage to target creature you don't control and 2 damage to target creature you control.",
  targets: ["creature-an-opponent-controls", "creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});
