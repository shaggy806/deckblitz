import { defineCard } from "../define.js";

// "If evidence was collected" (rule 701.59c) is the spell being kicked. Each
// opponent picks among their creatures tied for the greatest power (the
// ruling), and all are sacrificed at once.
export default defineCard({
  name: "Extract a Confession",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, you may collect evidence 6. (Exile cards with total mana value 6 or greater from your graveyard.)\nEach opponent sacrifices a creature of their choice. If evidence was collected, instead each opponent sacrifices a creature with the greatest power among creatures they control.",
  effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
  kicker: {
    cost: "",
    keyword: "collect-evidence",
    collectEvidence: 6,
    effect: {
      kind: "sacrifice",
      who: "each-opponent",
      filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
      count: 1,
    },
  },
});
