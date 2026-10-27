import { defineCard } from "../define.js";

// Starter 1999. EDHREC rank 31303. (`squall.ts` is Squall, SeeD Mercenary.)
export default defineCard({
  name: "Squall",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Squall deals 2 damage to each creature with flying.",
  targets: [],
  effect: { kind: "damage-all", amount: 2, filter: { type: "creature", keyword: "flying" } },
});
