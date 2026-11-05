import { defineCard } from "../define.js";

// EDHREC rank 29132.

export default defineCard({
  name: "Elemental Augury",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["enchantment"],
  text: "{3}: Look at the top three cards of target player's library, then put them back in any order.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["player"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 3,
        min: 3,
        max: 3,
        destination: "library-top",
        leftover: "stay",
      },
      resolve: null,
      text: "{3}: Look at the top three cards of target player's library, then put them back in any order.",
    },
  ],
});
