import { defineCard } from "../define.js";

// "You may choose new targets" (rule 115.7d): any of them, each kept even if
// it's no longer legal; a new one must be legal (the rulings), and a divided
// amount keeps its division (115.7f).
export default defineCard({
  name: "Deflecting Swat",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "If you control a commander, you may cast this spell without paying its mana cost.\n" +
    "You may choose new targets for target spell or ability.",
  freeCastIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 } },
  targets: [{ kind: "stack", spells: "any", abilities: true }],
  effect: { kind: "change-targets", target: 0, how: "choose-new" },
});
