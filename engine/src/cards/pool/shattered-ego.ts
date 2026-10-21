import { defineCard } from "../define.js";

// EDHREC rank 30010.
//
// Rulings:
//   As the last ability resolves, the enchanted creature is put into its owner's library. After
//     it resolves, Shattered Ego is put into the graveyard from the battlefield.
//   If the enchanted creature's owner has two or fewer cards in their library, the enchanted
//     creature is put on the bottom of their library as the last ability resolves.
//   The creature will be put into its owner's library even if Shattered Ego is no longer attached
//     to it as the ability resolves.
//
// `"attached"` is the creature it last enchanted once the Aura has gone (the
// third ruling); `fromTop: 3` goes to the bottom of a shorter library.

const TUCK = "{3}{U}{U}: Put enchanted creature into its owner's library third from the top.";

export default defineCard({
  name: "Shattered Ego",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets -3/-0.\n${TUCK}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "put-on-library", target: "attached", position: { fromTop: 3 } },
      resolve: null,
      text: TUCK,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-3, 0],
      text: "Enchanted creature gets -3/-0.",
    },
  ],
});
