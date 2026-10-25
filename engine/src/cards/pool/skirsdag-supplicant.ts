import { defineCard } from "../define.js";

// EDHREC rank 26986.

const TEXT = "{B}, {T}, Discard a card: Each player loses 2 life.";

export default defineCard({
  name: "Skirsdag Supplicant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
