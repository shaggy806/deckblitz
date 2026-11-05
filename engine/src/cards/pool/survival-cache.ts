import { defineCard } from "../define.js";

// EDHREC rank 16757.

export default defineCard({
  name: "Survival Cache",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  rebound: true,
  text: "You gain 2 life. Then if you have more life than an opponent, draw a card.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "life", compare: "more", than: "an-opponent" },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
