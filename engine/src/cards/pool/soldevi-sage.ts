import { defineCard } from "../define.js";

// Sixth Edition (6ED). EDHREC rank 28488.
//
// "Draw three cards, then discard one of them": Casting of Bones' `discard`
// of one card `{ thisWay: "drawn" }`, only a card the ability drew.

const TEXT = "{T}, Sacrifice two lands: Draw three cards, then discard one of them.";

export default defineCard({
  name: "Soldevi Sage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "land" }, count: 2 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 1, filter: { thisWay: "drawn" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
