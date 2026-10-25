import { defineCard } from "../define.js";

// EDHREC rank 1319.

export default defineCard({
  name: "Organic Extinction",
  manaCost: "{8}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nDestroy all nonartifact creatures.",
  effect: { kind: "destroy-all", filter: { type: "creature", notTypes: ["artifact"] } },
});
