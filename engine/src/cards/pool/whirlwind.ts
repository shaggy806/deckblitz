import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 15861.

export default defineCard({
  name: "Whirlwind",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all creatures with flying.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", keyword: "flying" } },
});
