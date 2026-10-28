import { defineCard } from "../define.js";

// EDHREC rank 17400.
//
// `blockAdditional` under a monarch `condition`, read as blockers are declared
// (the ruling).
//
// Rulings:
//   [2016-08-23] Entourage of Trest checks if you're the monarch only as blockers are declared. If
//     it blocks two attacking creatures, another player becoming the monarch won't change or undo
//     that block.

const MONARCH_TEXT = "When this creature enters, you become the monarch.";
const BLOCK_TEXT = "This creature can block an additional creature each combat as long as you're the monarch.";

export default defineCard({
  name: "Entourage of Trest",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Soldier"],
  power: 4,
  toughness: 4,
  text: `${MONARCH_TEXT}\n${BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "monarch", who: "you" },
      blockAdditional: 1,
      text: BLOCK_TEXT,
    },
  ],
});
