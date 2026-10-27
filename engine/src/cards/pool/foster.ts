import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 21695.

const TEXT =
  "Whenever a creature you control dies, you may pay {1}. If you do, reveal cards from the top of your library until you reveal a creature card. Put that card into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Foster",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to reveal cards until you reveal a creature card?",
        cost: "{1}",
        effect: { kind: "reveal-until", filter: { type: "creature" }, put: "hand", rest: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
