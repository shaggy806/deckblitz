import { defineCard } from "../define.js";

// EDHREC rank 27727.

const LOOT = "Whenever this creature deals combat damage to a player, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Abomination of Gudul",
  manaCost: "{3}{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{2}{B}{G}{U}" },
  text: `Flying\n${LOOT}\nMorph {2}{B}{G}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: LOOT,
    },
  ],
});
