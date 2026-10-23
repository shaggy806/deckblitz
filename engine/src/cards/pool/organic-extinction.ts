import { defineCard } from "../define.js";

export default defineCard({
  name: "Organic Extinction",
  manaCost: "{8}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nDestroy all nonartifact creatures.",
  // Improvise (rule 702.126a): artifacts tapped as it's cast pay its generic mana.
  improvise: true,
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", notTypes: ["artifact"] } },
});
