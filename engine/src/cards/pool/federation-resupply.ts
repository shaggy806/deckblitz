import { defineCard } from "../define.js";

// EDHREC rank 26987.

export default defineCard({
  name: "Federation Resupply",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: {
    cost: "{3}{W}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Search your library for an Aura, Equipment, or Spacecraft card, reveal it, put it into your hand, then shuffle.\nBeam me up {3}{W} (You may cast this card from your graveyard for {3}{W} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  effect: {
    kind: "search-library",
    filter: { subtypes: ["Aura", "Equipment", "Spacecraft"] },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
});
