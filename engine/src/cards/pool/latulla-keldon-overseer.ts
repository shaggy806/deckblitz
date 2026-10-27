import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 27908. A Spellshaper: Fogwell's Gym's discard
// cost (two cards) with an {X} the effect reads.

const TEXT = "{X}{R}, {T}, Discard two cards: Latulla deals X damage to any target.";

export default defineCard({
  name: "Latulla, Keldon Overseer",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{R}", tap: true, discard: { count: 2 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
