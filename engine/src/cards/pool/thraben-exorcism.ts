import { defineCard } from "../define.js";

// EDHREC rank 28922.
//
// Rulings:
//   A creature with disturb is one that has the disturb keyword ability in its text box. A
//     permanent cast using disturb is its back face, which has no disturb, so it isn't one
//     (`hasKeyword: "disturb"` reads the face on the battlefield).

export default defineCard({
  name: "Thraben Exorcism",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target Spirit, creature with disturb, or enchantment.",
  targets: [
    {
      kind: "permanent",
      filter: {
        anyOf: [
          { subtype: "Spirit" },
          { type: "creature", hasKeyword: "disturb" },
          { type: "enchantment" },
        ],
      },
    },
  ],
  effect: { kind: "exile", target: 0 },
});
