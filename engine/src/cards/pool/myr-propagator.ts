import { defineCard } from "../define.js";

// EDHREC rank 9758.
//
// Rulings:
//   The token copies Myr Propagator's copiable values (as it last existed
//     on the battlefield, if it has left) — not its counters or other
//     effects (Pack Rat's shape).

const TEXT = "{3}, {T}: Create a token that's a copy of this creature.";

export default defineCard({
  name: "Myr Propagator",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
