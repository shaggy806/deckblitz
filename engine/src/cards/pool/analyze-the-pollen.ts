import { defineCard } from "../define.js";

// "If evidence was collected" (rule 701.59c) is the spell being kicked: the
// kicked search replaces the basic land one. Any land, nonbasic included
// (the ruling).
export default defineCard({
  name: "Analyze the Pollen",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, you may collect evidence 8. (Exile cards with total mana value 8 or greater from your graveyard.)\nSearch your library for a basic land card. If evidence was collected, instead search your library for a creature or land card. Reveal that card, put it into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  kicker: {
    cost: "",
    keyword: "collect-evidence",
    collectEvidence: 8,
    effect: {
      kind: "search-library",
      filter: { typesAnyOf: ["creature", "land"] },
      destination: "hand",
      min: 0,
      max: 1,
      reveal: true,
    },
  },
});
