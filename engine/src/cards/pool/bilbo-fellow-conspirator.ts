import { defineCard } from "../define.js";

// EDHREC rank 8833.
//
// Rulings:
//   If you control Bilbo and would create some number of Food tokens, you will instead create that
//   many Food tokens and that many Treasure tokens.
//   If you somehow control two Bilbo, Fellow Conspirators and would create some number of Food
//   tokens, you will instead create that many Food tokens and twice that many Treasure tokens.
//
// `plusTokens` with `ofTokens`: a Treasure for each Food of the event.

const TEXT = "If you would create a Food token, instead create a Food token and a Treasure token.";

export default defineCard({
  name: "Bilbo, Fellow Conspirator",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", ofTokens: { subtypesAnyOf: ["Food"] }, plusTokens: "Treasure Token" },
      text: TEXT,
    },
  ],
});
