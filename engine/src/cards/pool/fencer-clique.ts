import { defineCard } from "../define.js";

// EDHREC rank 30298.

const TEXT = "{U}: Put this creature on top of its owner's library.";

export default defineCard({
  name: "Fencer Clique",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "put-on-library", target: "source", position: "top" },
      resolve: null,
      text: TEXT,
    },
  ],
});
