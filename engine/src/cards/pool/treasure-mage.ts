import { defineCard } from "../define.js";

// EDHREC rank 8402. A card with {X} in its mana cost counts X as 0 in the
// library (the ruling), which is how `manaValue` reads a card there.
const TEXT =
  "When this creature enters, you may search your library for an artifact card with mana value 6 or greater, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Treasure Mage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search for an artifact card with mana value 6 or greater?",
        effect: {
          kind: "search-library",
          filter: { type: "artifact", manaValue: { op: "gte", n: 6 } },
          destination: "hand",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
