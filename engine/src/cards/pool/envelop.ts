import { defineCard } from "../define.js";

// EDHREC rank 20797.

export default defineCard({
  name: "Envelop",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target sorcery spell.",
  targets: [{ kind: "spell", filter: { type: "sorcery" } }],
  effect: { kind: "counter", target: 0 },
});
