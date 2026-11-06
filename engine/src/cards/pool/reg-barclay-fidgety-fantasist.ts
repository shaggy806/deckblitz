import { defineCard } from "../define.js";

// EDHREC rank 28818.
//
// "Isn't legendary", "an Illusion artifact in addition to its other types" and
// "it has haste" are all copy exceptions (rule 707.9b), so a copy of the token
// copies them too.

const SEEK_TEXT =
  "Seek out — Whenever you draw your second card each turn, create a token that's a copy of another target " +
  "creature you control, except it isn't legendary, it's an Illusion artifact in addition to its other types, " +
  "and it has haste. Exile that token at the beginning of the next end step.";

export default defineCard({
  name: "Reg Barclay, Fidgety Fantasist",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 5,
  text: SEEK_TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        notLegendary: true,
        exceptions: { addTypes: ["artifact"], addSubtypes: ["Illusion"], keywords: ["haste"] },
        exileAtEndStep: true,
      },
      resolve: null,
      text: SEEK_TEXT,
    },
  ],
});
