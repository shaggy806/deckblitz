import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 17362.
//
// Axebane Guardian's count of creatures you control with defender, read as
// the ability resolves (the ruling).
const TEXT =
  "{1}{U}, {T}: Target player mills X cards, where X is the number of creatures you control with defender.";

export default defineCard({
  name: "Coral Colony",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 1,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${TEXT} (To mill a card, a player puts the top card of their library into their graveyard.)`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: ["player"],
      effect: {
        kind: "mill",
        target: 0,
        amount: { countOf: { type: "creature", controlledBy: "you", keyword: "defender" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
