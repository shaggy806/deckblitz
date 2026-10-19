import { defineCard } from "../define.js";

// With the casualty cost paid, the copy resolves first and searches too —
// two tutors (the rulings).
export default defineCard({
  name: "Illicit Shipment",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  casualty: 3,
  text:
    "Casualty 3 (As you cast this spell, you may sacrifice a creature with power 3 or greater. When you do, copy this spell.)\n" +
    "Search your library for a card, put it into your hand, then shuffle.",
  targets: [],
  effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
});
