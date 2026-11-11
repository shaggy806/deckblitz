import { defineCard } from "../define.js";

// Rulings:
//   If either target is an illegal target as Super Combo resolves, the creature you control won't
//     deal damage due to the effect of that copy of Super Combo.

export default defineCard({
  name: "Super Combo",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Replicate {2} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nTarget creature you control deals damage equal to its power to target creature an opponent controls.",
  replicate: { cost: "{2}" },
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
