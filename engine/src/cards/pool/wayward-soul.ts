import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 31926.

export default defineCard({
  name: "Wayward Soul",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{U}: Put this creature on top of its owner's library.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "put-on-library", target: "source", position: "top" },
      resolve: null,
      text: "{U}: Put this creature on top of its owner's library.",
    },
  ],
});
