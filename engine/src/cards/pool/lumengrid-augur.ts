import { defineCard } from "../define.js";

// EDHREC rank 28514. Mirrodin.
//
// Reckless Scholar's loot, then Psychic Miasma's "if a [type] card is
// discarded this way" check.

const TEXT =
  "{1}, {T}: Target player draws a card, then discards a card. If that player discards an artifact card this way, untap this creature.";

export default defineCard({
  name: "Lumengrid Augur",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, target: 0 },
          { kind: "discard", target: 0, amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { type: "artifact" } },
            then: { kind: "untap", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
