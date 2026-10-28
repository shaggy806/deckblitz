import { defineCard } from "../define.js";

// Born of the Gods (BNG). EDHREC rank 28715.

export default defineCard({
  name: "Culling Mark",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature blocks this turn if able.",
  targets: ["creature"],
  effect: { kind: "block-if-able", target: 0 },
});
