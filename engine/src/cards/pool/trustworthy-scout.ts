import { defineCard } from "../define.js";

const TEXT =
  "{1}{W}, Exile this card from your graveyard: Search your library for a card named Trustworthy Scout, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Trustworthy Scout",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      zone: "graveyard",
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Trustworthy Scout" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
