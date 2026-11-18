import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 28824.
//
// Rulings:
//   If the opponent has no cards in hand, then X is zero.
//
// Planeswalker's Scorn's shape, +X/+X, at any time.
const TEXT =
  "{3}{G}: Target opponent reveals a card at random from their hand. Target creature gets +X/+X until end of turn, where X is the revealed card's mana value.";
const REVEALED_MV = { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "revealed" } } as const;

export default defineCard({
  name: "Planeswalker's Favor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: ["opponent", "creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "choose-random-card", zone: "hand", whose: 0, show: "reveal" },
          { kind: "modify-pt", target: 1, power: REVEALED_MV, toughness: REVEALED_MV, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
