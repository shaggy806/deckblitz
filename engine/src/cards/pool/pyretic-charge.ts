import { defineCard } from "../define.js";

// EDHREC rank 10171.
//
// Rulings:
//   [2024-04-12] Pyretic Charge affects only creatures you control at the time it resolves.
//     Creatures you begin to control later in the turn and noncreature permanents that become
//     creatures later in the turn won't get +1/+0 for each card discarded this way.
//
// Path of the Pyromancer's shape: the discard counted by `thisWay`, and the
// pump a `modify-pt-all` over the creatures there as it resolves.

const MAIN_TEXT =
  "Discard your hand, then draw four cards. For each card discarded this way, creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Pyretic Charge",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  plot: { cost: "{3}{R}" },
  text: `${MAIN_TEXT}\nPlot {3}{R} (You may pay {3}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: 4 },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { thisWay: "discarded", who: "you" },
        toughness: 0,
        duration: "end-of-turn",
      },
    ],
  },
});
