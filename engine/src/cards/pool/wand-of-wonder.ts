import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 2490. Every row exiles the same way; the roll sets only how many
// of the exiled instants and sorceries may be cast. Those not cast stay exiled.
const TEXT =
  "{4}, {T}: Roll a d20. Each opponent exiles cards from the top of their library until they exile an instant or sorcery card, then shuffles the rest into their library. You may cast up to X instant and/or sorcery spells from among cards exiled this way without paying their mana costs.";

const wonder = (x: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    {
      kind: "for-each-player",
      who: "each-opponent",
      effect: {
        kind: "reveal-until",
        whose: "that-player",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        exile: true,
        rest: "shuffle",
        keepFound: true,
      },
    },
    {
      kind: "cast-now",
      from: "exiled-this-way",
      repeat: true,
      upTo: x,
      free: true,
      spell: { typesAnyOf: ["instant", "sorcery"] },
    },
  ],
});

export default defineCard({
  name: "Wand of Wonder",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${TEXT}\n1—9 | X is one.\n10—19 | X is two.\n20 | X is three.`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: wonder(1) },
          { min: 10, max: 19, effect: wonder(2) },
          { min: 20, effect: wonder(3) },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
