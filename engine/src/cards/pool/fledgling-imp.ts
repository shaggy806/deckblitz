import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 31971.

export default defineCard({
  name: "Fledgling Imp",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 2,
  text: "{B}, Discard a card: This creature gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{B}, Discard a card: This creature gains flying until end of turn.",
    },
  ],
});
