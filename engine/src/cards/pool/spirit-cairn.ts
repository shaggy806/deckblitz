import { defineCard } from "../define.js";

const TEXT =
  "Whenever a player discards a card, you may pay {W}. If you do, create a 1/1 white Spirit creature token with flying.";

// Once per card discarded (`perCard`); one {W} makes one token (ruling).
export default defineCard({
  name: "Spirit Cairn",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "any", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W} to create a 1/1 Spirit with flying?",
        cost: "{W}",
        effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
