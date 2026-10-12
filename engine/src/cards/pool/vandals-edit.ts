import { defineCard } from "../define.js";

// Defacing Duskmage's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Duskmage makes in exile (722.3c).
export default defineCard({
  name: "Vandal's Edit",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  prepareSpellOnly: true,
  text: "Draw two cards. Each player loses 2 life.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "lose-life", amount: 2, who: "each-player" },
    ],
  },
});
