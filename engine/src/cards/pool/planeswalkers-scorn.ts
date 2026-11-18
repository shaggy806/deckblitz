import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 30456.
//
// Rulings:
//   If the opponent has no cards in hand, then X is zero.
//
// Hired Torturer's random reveal from the target opponent's hand (`choose-random-card`, `show:
// "reveal"`), its mana value read through `{ thisWay: "revealed" }` — 0 with no card — on the
// ability's own second target.
const TEXT =
  "{3}{B}: Target opponent reveals a card at random from their hand. Target creature gets -X/-X until end of turn, where X is the revealed card's mana value. Activate only as a sorcery.";
const REVEALED_MV = { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "revealed" } } as const;

export default defineCard({
  name: "Planeswalker's Scorn",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      sorcerySpeed: true,
      targets: ["opponent", "creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "choose-random-card", zone: "hand", whose: 0, show: "reveal" },
          {
            kind: "modify-pt",
            target: 1,
            power: { product: [REVEALED_MV, -1] },
            toughness: { product: [REVEALED_MV, -1] },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
