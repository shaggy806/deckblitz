import { defineCard } from "../define.js";

// EDHREC rank 9878.
//
// Rulings:
//   [2022-02-18] The target card's mana value must be less than X. A card with mana value equal to
//     X is not a legal target for Scrap Welder's ability.
//
// X is announced as the ability is activated though its cost has no {X}
// (rules 602.2b, 601.2b): the target is chosen at that X (601.2c), and only
// an artifact with that mana value pays (601.2h) — the sacrifice's filter
// reads X, as Sidisi, Regent of the Mire's does.

const TEXT =
  "{T}, Sacrifice an artifact with mana value X: Return target artifact card with mana value less than X from your graveyard to the battlefield. It gains haste until end of turn.";

export default defineCard({
  name: "Scrap Welder",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: { filter: { type: "artifact", manaValue: { op: "eq", n: "x" } } },
      },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "artifact", manaValue: { op: "lt", n: { amount: "x" } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
