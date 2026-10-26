import { defineCard } from "../define.js";

// EDHREC rank 23710.
//
// Rulings:
//   [2009-10-01] The spell’s effect has no duration. The targeted creature gets +2/+2 until the
//     game ends or it leaves the battlefield. It has horsemanship until the game ends, it leaves
//     the battlefield, or some other effect causes it to lose horsemanship.

export default defineCard({
  name: "Riding the Dilu Horse",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature gets +2/+2 and gains horsemanship. (It can't be blocked except by creatures with horsemanship. This effect lasts indefinitely.)",
  targets: ["creature"],
  // No duration: it lasts as long as the creature stays (the ruling).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "permanent" },
      { kind: "grant-keyword", target: 0, keyword: "horsemanship", duration: "permanent" },
    ],
  },
});
