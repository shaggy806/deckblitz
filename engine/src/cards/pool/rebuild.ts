import { defineCard } from "../define.js";

// Rulings:
//   [2019-06-14] Artifact cards not on the battlefield won't be returned by Rebuild.

export default defineCard({
  name: "Rebuild",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Return all artifacts to their owners' hands.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  effect: { kind: "return-to-hand-all", filter: { type: "artifact" } },
});
