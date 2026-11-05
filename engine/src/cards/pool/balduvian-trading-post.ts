import { defineCard } from "../define.js";

// EDHREC rank 17805.

export default defineCard({
  name: "Balduvian Trading Post",
  colors: [],
  types: ["land"],
  text: "If this land would enter, sacrifice an untapped Mountain instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.\n{T}: Add {C}{R}.\n{1}, {T}: This land deals 1 damage to target attacking creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {C}{R}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}, {T}: This land deals 1 damage to target attacking creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        instead: { sacrifice: { filter: { subtype: "Mountain", tapped: false }, count: 1 } },
      },
      text: "If this land would enter, sacrifice an untapped Mountain instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.",
    },
  ],
});
