import { defineCard } from "../define.js";

// EDHREC rank 28185.

export default defineCard({
  name: "Extinguish",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target sorcery spell.",
  targets: [{ kind: "spell", filter: { type: "sorcery" } }],
  effect: { kind: "counter", target: 0 },
});
