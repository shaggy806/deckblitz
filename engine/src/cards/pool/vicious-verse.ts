import { defineCard } from "../define.js";

// Stingerquill Voxmancer's prepare spell (rule 722): no card of its own,
// only ever cast as the copy a prepared Voxmancer makes in exile (722.3c).
export default defineCard({
  name: "Vicious Verse",
  manaCost: "{B/R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Vicious Verse deals 1 damage to target opponent.",
  targets: ["opponent"],
  effect: { kind: "damage", amount: 1, target: 0 },
});
