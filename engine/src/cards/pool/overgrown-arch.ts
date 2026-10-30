import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 20214.

export default defineCard({
  name: "Overgrown Arch",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\n{T}: You gain 1 life.\n{2}, Sacrifice this creature: Learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{T}: You gain 1 life.",
    },
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: learn(),
      resolve: null,
      text: "{2}, Sacrifice this creature: Learn.",
    },
  ],
});
