import { defineCard } from "../define.js";

// EDHREC rank 12306. Ambuscade's shape with +1/+1.
//
// Rulings:
//   - You can't cast Clear Shot unless you choose a creature you control and a
//     creature you don't control as targets.
//   - If either creature is an illegal target as it resolves, the creature you
//     control won't deal damage. If the creature you control is a legal target
//     but the other isn't, your creature still gets +1/+1.

export default defineCard({
  name: "Clear Shot",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +1/+1 until end of turn. It deals damage equal to its power to target creature you don't control.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
