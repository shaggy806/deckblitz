import { defineCard } from "../define.js";

// EDHREC rank 3112.

export default defineCard({
  name: "Inevitable Betrayal",
  colors: ["U"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{1}{U}{U}" },
  text: "Suspend 3—{1}{U}{U} (Rather than cast this card from your hand, pay {1}{U}{U} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)\nSearch target opponent's library for a creature card and put that card onto the battlefield under your control. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "search-library",
    whose: { target: 0 },
    filter: { type: "creature" },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
