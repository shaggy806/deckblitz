import { defineCard } from "../define.js";

// Portal (POR). EDHREC rank 26000. Perish without "can't be regenerated".

export default defineCard({
  name: "Nature's Ruin",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all green creatures.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", colors: ["G"] } },
});
