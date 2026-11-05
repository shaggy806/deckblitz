import { defineCard } from "../define.js";

// EDHREC rank 6846.

export default defineCard({
  name: "Lotus Vale",
  colors: [],
  types: ["land"],
  text: "If this land would enter, sacrifice two untapped lands instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.\n{T}: Add three mana of any one color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 3 },
      resolve: null,
      text: "{T}: Add three mana of any one color.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        instead: { sacrifice: { filter: { type: "land", tapped: false }, count: 2 } },
      },
      text: "If this land would enter, sacrifice two untapped lands instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.",
    },
  ],
});
