import { defineCard } from "../define.js";

const DISCARDED =
  "When a spell or ability an opponent controls causes you to discard this card, you gain 2 life, and you return this card from your graveyard to your hand at the beginning of the next end step.";

export default defineCard({
  name: "Mangara's Blessing",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `You gain 5 life.\n${DISCARDED}`,
  effect: { kind: "gain-life", amount: 5 },
  triggered: [
    {
      trigger: { on: "this-discarded", byOpponent: true },
      targets: [],
      // The life now; the return at end of turn, only if the card is still
      // the one that was discarded there (the rulings).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
            text: "Return Mangara's Blessing from your graveyard to your hand.",
          },
        ],
      },
      resolve: null,
      text: DISCARDED,
    },
  ],
});
