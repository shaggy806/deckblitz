import { defineCard } from "../define.js";

// EDHREC rank 22710.
//
// "It deals 1 damage to each other creature and each player": the creatures
// and the players are dealt their damage at once (Dry Spell's shape), and
// `exceptSource` spares the Conductor itself.

export default defineCard({
  name: "Conductor of Cacophony",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 2,
  toughness: 1,
  text: "This creature enters with two +1/+1 counters on it.\n{B}, Remove a +1/+1 counter from this creature: It deals 1 damage to each other creature and each player.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 1, exceptSource: true },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: "{B}, Remove a +1/+1 counter from this creature: It deals 1 damage to each other creature and each player.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
});
