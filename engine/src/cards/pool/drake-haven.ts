import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cycle or discard a card, you may pay {1}. If you do, create a 2/2 blue Drake creature token with flying.";

export default defineCard({
  name: "Drake Haven",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a 2/2 Drake?",
        cost: "{1}",
        effect: { kind: "create-token", token: "Drake Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
