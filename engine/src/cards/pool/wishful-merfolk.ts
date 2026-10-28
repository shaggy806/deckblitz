import { defineCard } from "../define.js";

// EDHREC rank 28894.
//
// Rulings:
//   [2019-10-04] While Wishful Merfolk is a Human, it's no longer a Merfolk.

export default defineCard({
  name: "Wishful Merfolk",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 3,
  toughness: 2,
  keywords: ["defender"],
  text: "Defender\n{1}{U}: This creature loses defender and becomes a Human until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
          { kind: "add-types", target: "source", setSubtypes: ["Human"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{1}{U}: This creature loses defender and becomes a Human until end of turn.",
    },
  ],
});
