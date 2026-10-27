import { defineCard } from "../define.js";

// Each land card milled is its own trigger ("a land card", not "one or more").
const TEXT = "Whenever a land card is put into your graveyard from your library, you may pay {1}. If you do, draw a card.";

export default defineCard({
  name: "Pedantic Learning",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", from: "library", filter: { type: "land" } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to draw a card?", cost: "{1}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
