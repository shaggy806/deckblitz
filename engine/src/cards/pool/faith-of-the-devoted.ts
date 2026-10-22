import { defineCard } from "../define.js";

// Amonkhet. "Cycle or discard" is one discard (cycling discards the card), so
// it's the per-card `discards` trigger (Grisly Survivor's shape); the {1} is
// paid once at most (the ruling).
const TEXT =
  "Whenever you cycle or discard a card, you may pay {1}. If you do, each opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Faith of the Devoted",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have each opponent lose 2 life and gain 2 life?",
        cost: "{1}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 2, who: "each-opponent" },
            { kind: "gain-life", amount: 2 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
