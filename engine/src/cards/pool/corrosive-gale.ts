import { defineCard } from "../define.js";

// EDHREC rank 24180.

export default defineCard({
  name: "Corrosive Gale",
  manaCost: "{X}{G/P}",
  colors: ["G"],
  types: ["sorcery"],
  text: "({G/P} can be paid with either {G} or 2 life.)\nCorrosive Gale deals X damage to each creature with flying.",
  effect: { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: "x" },
});
