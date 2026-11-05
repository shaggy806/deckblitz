import { defineCard } from "../define.js";

// EDHREC rank 29519.
//
// Rulings:
//   [2004-10-04] Any X in the mana cost of a card is zero for purposes of the Wand.
//
// The revealed card is picked at random (`choose-random-card`, Dementia
// Sliver's shape) into slot 1; the target player then pays life or discards
// that card (`unless`, the player's choice; Sirocco's `discard-card`). A
// card's mana value in a hand counts {X} as 0 (rule 202.3e).
const TEXT =
  "{3}, {T}: Target player reveals a card at random from their hand. If it's a land card, that player discards it unless they pay 1 life. If it isn't a land card, the player discards it unless they pay life equal to its mana value. Activate only during your turn.";

export default defineCard({
  name: "Wand of Ith",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["player"],
      condition: { kind: "your-turn" },
      effect: {
        kind: "choose-random-card",
        zone: "hand",
        whose: 0,
        show: "reveal",
        slot: 1,
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 1, filter: { type: "land" } },
          then: {
            kind: "unless",
            chooser: 0,
            options: [{ payLife: 1, text: "Pay 1 life to keep the revealed land card" }],
            otherwise: { kind: "discard-card", target: 1 },
          },
          else: {
            kind: "unless",
            chooser: 0,
            options: [
              { payLifeAmount: { manaValueOf: 1 }, text: "Pay {X} life (its mana value) to keep the revealed card" },
            ],
            otherwise: { kind: "discard-card", target: 1 },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
