import { defineCard } from "../define.js";

// EDHREC rank 32235.

export default defineCard({
  name: "Shadowstorm",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Shadowstorm deals 2 damage to each creature with shadow.",
  targets: [],
  effect: { kind: "damage-all", amount: 2, filter: { type: "creature", keyword: "shadow" } },
});
