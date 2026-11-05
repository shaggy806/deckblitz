import { defineCard } from "../define.js";

// EDHREC rank 5305.

export default defineCard({
  name: "Lake of the Dead",
  colors: [],
  types: ["land"],
  text: "If this land would enter, sacrifice a Swamp instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.\n{T}: Add {B}.\n{T}, Sacrifice a Swamp: Add {B}{B}{B}{B}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Swamp" } } },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 4 },
      resolve: null,
      text: "{T}, Sacrifice a Swamp: Add {B}{B}{B}{B}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        instead: { sacrifice: { filter: { subtype: "Swamp" }, count: 1 } },
      },
      text: "If this land would enter, sacrifice a Swamp instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.",
    },
  ],
});
