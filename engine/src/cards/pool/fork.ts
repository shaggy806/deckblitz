import { defineCard } from "../define.js";

// EDHREC rank 7624. "Except that the copy is red" is a copy exception (rule
// 707.9b): its colour is red whatever its mana cost says (the rulings).
export default defineCard({
  name: "Fork",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Copy target instant or sorcery spell, except that the copy is red. You may choose new targets for the copy.",
  targets: ["instant-or-sorcery-spell"],
  effect: { kind: "copy-spell", target: 0, newTargets: true, except: { setColors: ["R"] } },
});
