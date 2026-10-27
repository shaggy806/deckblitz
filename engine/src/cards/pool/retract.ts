import { defineCard } from "../define.js";

// EDHREC rank 13198.

export default defineCard({
  name: "Retract",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return all artifacts you control to their owner's hand.",
  effect: { kind: "return-to-hand-all", filter: { type: "artifact", controlledBy: "you" } },
});
