import { defineCard } from "../define.js";

// EDHREC rank 12038.
//
// Rulings:
//   [2013-04-15] Emmara Tandris's ability prevents all damage that would be dealt to creature
//     tokens you control, not just combat damage.
//   [2013-04-15] If Emmara Tandris is dealt lethal damage at the same creature tokens you control
//     would be dealt damage, the damage that would be dealt to those tokens is prevented.
//
// Iroas, God of Victory's prevention shape, over creature tokens.

const TEXT = "Prevent all damage that would be dealt to creature tokens you control.";

export default defineCard({
  name: "Emmara Tandris",
  manaCost: "{5}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 5,
  toughness: 7,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        toFilter: { type: "creature", token: true, controlledBy: "you" },
      },
      text: TEXT,
    },
  ],
});
