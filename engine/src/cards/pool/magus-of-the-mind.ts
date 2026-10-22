import { defineCard } from "../define.js";

// EDHREC rank 23938.
//
// Rulings: X counts every player's spells cast this turn (one with none);
// the exiled cards are played by the normal timing rules, a land only with a
// land play left; any not played stay exiled; X in a cost is 0.

const TEXT =
  "{U}, {T}, Sacrifice this creature: Shuffle your library, then exile the top X cards, where X is one plus the number of spells cast this turn. Until end of turn, you may play lands and cast spells from among cards exiled this way without paying their mana costs.";

export default defineCard({
  name: "Magus of the Mind",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-library" },
          {
            kind: "impulse-exile",
            amount: { sum: [1, { castThisTurn: {}, who: "each-player" }] },
            duration: "end-of-turn",
            free: { only: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
