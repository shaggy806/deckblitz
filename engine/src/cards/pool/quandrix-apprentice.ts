import { defineCard } from "../define.js";

// EDHREC rank 9201.

const MAGECRAFT_TEXT =
  "Magecraft — Whenever you cast or copy an instant or sorcery spell, look at the top three cards of your library. You may reveal a land card from among them and put that card into your hand. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Quandrix Apprentice",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: MAGECRAFT_TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: MAGECRAFT_TEXT,
    },
  ],
});
