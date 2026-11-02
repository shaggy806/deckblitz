import { defineCard } from "../define.js";

const TEXT =
  "Whenever a spell or ability an opponent controls causes you to discard a card, you gain 2 life and you may draw a card.";

export default defineCard({
  name: "Spiritual Focus",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "you", byOpponent: true, perCard: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
