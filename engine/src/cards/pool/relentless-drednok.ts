import { defineCard } from "../define.js";

// EDHREC rank 31359.

export default defineCard({
  name: "Relentless Drednok",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink\n{2}{B}, Exile this card from your graveyard: You draw a card and lose 1 life.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "{2}{B}, Exile this card from your graveyard: You draw a card and lose 1 life.",
      zone: "graveyard",
    },
  ],
});
