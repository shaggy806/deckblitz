import { defineCard } from "../define.js";

// EDHREC rank 8894.

export default defineCard({
  name: "Guttural Response",
  manaCost: "{R/G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Counter target blue instant spell.",
  targets: [{ kind: "spell", filter: { type: "instant", colors: ["U"] } }],
  effect: { kind: "counter", target: 0 },
});
