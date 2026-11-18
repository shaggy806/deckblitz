import { defineCard } from "../define.js";

// EDHREC rank 16230.
//
// Rulings:
//   [2023-02-04] To activate Synthesis Pod's ability, you must exile a spell you control on the
//     stack (the only place spells exist).
//   [2023-02-04] If a spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2023-02-04] If you cast a spell "without paying its mana cost," you can't choose to cast it
//     for any alternative costs. If the card has any mandatory additional costs, those must be
//     paid to cast the card.
//   [2023-02-04] If you wish to cast the card, you do so as part of the resolution of Synthesis
//     Pod's ability. You can't wait to cast it later. Timing rules based on a card's type are
//     ignored.
//   [2023-02-04] The spell you exiled as part of the cost to activate Synthesis Pod's ability will
//     remain in exile.

// Birthing Pod's shape over a spell: `exileSpell` takes it off the stack, and
// `{ paid: "exiled" }` reads it as it last was there — its {X} counted (rule
// 202.3e), a copy too though it has ceased to exist. The card found is exiled
// before its owner shuffles, and cast free as this resolves.
const TEXT =
  "{1}{U/P}, {T}, Exile a spell you control: Target opponent reveals cards from the top of their library until they reveal a card with mana value equal to 1 plus the exiled spell's mana value. Exile that card, then that player shuffles. You may cast that exiled card without paying its mana cost.";

export default defineCard({
  name: "Synthesis Pod",
  manaCost: "{3}{U/P}",
  colors: ["U"],
  types: ["artifact"],
  text: `({U/P} can be paid with either {U} or 2 life.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U/P}", tap: true, exileSpell: {} },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "reveal-until",
            whose: 0,
            filter: { manaValue: { op: "eq", n: { amount: { sum: [{ manaValueOf: { paid: "exiled" } }, 1] } } } },
            then: { kind: "exile", target: 0 },
            rest: "shuffle",
          },
          { kind: "cast-now", from: "exiled-this-way", free: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
