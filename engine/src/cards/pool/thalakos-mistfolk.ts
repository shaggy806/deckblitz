import { defineCard } from "../define.js";

// EDHREC rank 27789.

const TEXT = "{U}: Put this creature on top of its owner's library.";

export default defineCard({
  name: "Thalakos Mistfolk",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Thalakos", "Illusion"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${TEXT}`,
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
