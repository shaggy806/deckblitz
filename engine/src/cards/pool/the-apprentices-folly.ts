import { defineCard } from "../define.js";

// EDHREC rank 10058.
//
// Rulings:
//   [2023-09-01] If something becomes a copy of the token, the copy is also a Reflection in
//     addition to its other types, has haste, and isn't legendary.
//   [2023-09-01] Except for the listed exceptions, the token copies exactly what was printed on
//     the original creature and nothing else.
//
// All three exceptions are copiable values (rule 707.9b): `gainsHaste` and
// `exceptions` both are, so a copy of the token keeps them (the first
// ruling). "Doesn't have the same name as a token you control" is
// `nameDiffersFromEach` over your tokens (rule 201.2c).

const COPY_TEXT =
  "I, II — Choose target nontoken creature you control that doesn't have the same name as a token you control. Create a token that's a copy of it, except it isn't legendary, is a Reflection in addition to its other types, and has haste.";
const III_TEXT = "III — Sacrifice all Reflections you control.";

export default defineCard({
  name: "The Apprentice's Folly",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${COPY_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", token: false, nameDiffersFromEach: { token: true, controlledBy: "you" } },
        },
      ],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        gainsHaste: true,
        exceptions: { notLegendary: true, addSubtypes: ["Reflection"] },
      },
      resolve: null,
      text: COPY_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "sacrifice-all", who: "you", filter: { subtype: "Reflection" } },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
