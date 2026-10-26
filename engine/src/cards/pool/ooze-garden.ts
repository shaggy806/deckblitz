import { defineCard } from "../define.js";

// EDHREC rank 22035. Shards of Alara.
// Makes Ooze → "Ooze Token (Convert to Slime)", the green X/X Ooze whose
// base P/T the effect sets.
//
// Rulings:
//   [2008-10-01] X is equal to the power of the sacrificed creature as it last existed on the
//     battlefield.

export default defineCard({
  name: "Ooze Garden",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "{1}{G}, Sacrifice a non-Ooze creature: Create an X/X green Ooze creature token, where X is the sacrificed creature's power. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: { filter: { type: "creature", notSubtypes: ["Ooze"] } } },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Ooze Token (Convert to Slime)",
        count: 1,
        basePt: { power: { powerOf: "sacrificed" }, toughness: { powerOf: "sacrificed" } },
      },
      resolve: null,
      text: "{1}{G}, Sacrifice a non-Ooze creature: Create an X/X green Ooze creature token, where X is the sacrificed creature's power. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
