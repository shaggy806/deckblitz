import { defineCard } from "../define.js";

const TEXT =
  "Whenever Yennett attacks, reveal the top card of your library. You may cast it without paying its mana cost if its mana value is odd. If you don't cast it, draw a card.";

export default defineCard({
  name: "Yennett, Cryptic Sovereign",
  manaCost: "{2}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 3,
  toughness: 5,
  keywords: ["flying", "vigilance", "menace"],
  text: `Flying, vigilance, menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: { libraryTop: 1, reveal: true },
        free: true,
        spell: { manaValueParity: "odd" },
        else: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
