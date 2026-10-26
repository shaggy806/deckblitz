import { defineCard } from "../define.js";

// EDHREC rank 32072.

export default defineCard({
  name: "Trip Wire",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target creature with horsemanship.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "horsemanship" } }],
  effect: { kind: "destroy", target: 0 },
});
