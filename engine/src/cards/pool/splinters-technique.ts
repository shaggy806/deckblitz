import { defineCard } from "../define.js";

export default defineCard({
  name: "Splinter's Technique",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  sneak: { cost: "{1}{B}" },
  text:
    "Sneak {1}{B} (You may cast this spell for {1}{B} if you also return an unblocked attacker you control to hand during the declare blockers step.)\n" +
    "Search your library for a card, put that card into your hand, then shuffle.",
  effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
});
