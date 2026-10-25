import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 26244.
//
// The colours are counted as either ability resolves; the last ability works
// only from the graveyard, exiling the Soul as part of its cost (the rulings).

const DRAW = { kind: "draw", amount: { colorsAmong: { controlledBy: "you" } } } as const;

export default defineCard({
  name: "Soul of Ravnica",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\n{5}{U}{U}: Draw a card for each color among permanents you control.\n{5}{U}{U}, Exile this card from your graveyard: Draw a card for each color among permanents you control.",
  activated: [
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      targets: [],
      effect: DRAW,
      resolve: null,
      text: "{5}{U}{U}: Draw a card for each color among permanents you control.",
    },
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      zone: "graveyard",
      targets: [],
      effect: DRAW,
      resolve: null,
      text: "{5}{U}{U}, Exile this card from your graveyard: Draw a card for each color among permanents you control.",
    },
  ],
});
