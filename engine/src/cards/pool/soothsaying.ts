import { defineCard } from "../define.js";

// EDHREC rank 8398.

export default defineCard({
  name: "Soothsaying",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "{3}{U}{U}: Shuffle your library.\n{X}: Look at the top X cards of your library, then put them back in any order.",
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "shuffle-library" },
      resolve: null,
      text: "{3}{U}{U}: Shuffle your library.",
    },
    {
      cost: { mana: "{X}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        min: "x",
        max: "x",
        destination: "library-top",
        leftover: "stay",
      },
      resolve: null,
      text: "{X}: Look at the top X cards of your library, then put them back in any order.",
    },
  ],
});
