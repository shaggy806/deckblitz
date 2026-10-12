import { defineCard } from "../define.js";

export default defineCard({
  name: "Pursue the Past",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  flashback: { cost: "{2}{R}{W}" },
  text: "You gain 2 life. You may discard a card. If you do, draw two cards.\nFlashback {2}{R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 2 },
      {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 2 },
            },
          ],
        },
      },
    ],
  },
});
