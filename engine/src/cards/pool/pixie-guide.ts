import { defineCard } from "../define.js";

// EDHREC rank 10975.

export default defineCard({
  name: "Pixie Guide",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nGrant an Advantage — If you would roll one or more dice, instead roll that many dice plus one and ignore the lowest roll.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-roll-dice",
        who: "you",
        instead: { modify: { plus: 1 } },
        ignoreLowest: true,
      },
      text: "Grant an Advantage — If you would roll one or more dice, instead roll that many dice plus one and ignore the lowest roll.",
    },
  ],
});
