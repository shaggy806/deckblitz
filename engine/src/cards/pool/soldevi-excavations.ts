import { defineCard } from "../define.js";

// EDHREC rank 15947.

export default defineCard({
  name: "Soldevi Excavations",
  colors: [],
  types: ["land"],
  text: "If this land would enter, sacrifice an untapped Island instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.\n{T}: Add {C}{U}.\n{1}, {T}: Scry 1.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {C}{U}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "{1}, {T}: Scry 1.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        instead: { sacrifice: { filter: { subtype: "Island", tapped: false }, count: 1 } },
      },
      text: "If this land would enter, sacrifice an untapped Island instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.",
    },
  ],
});
