import { defineCard } from "../define.js";

export default defineCard({
  name: "Unwilling Ingredient",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\n{2}{B}, Exile this card from your graveyard: You draw a card and you lose 1 life.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "{2}{B}, Exile this card from your graveyard: You draw a card and you lose 1 life.",
      zone: "graveyard",
    },
  ],
});
