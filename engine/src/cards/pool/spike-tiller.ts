import { defineCard } from "../define.js";

// EDHREC rank 28075.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.

export default defineCard({
  name: "Spike Tiller",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spike"],
  power: 0,
  toughness: 0,
  text: "This creature enters with three +1/+1 counters on it.\n{2}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.\n{2}, Remove a +1/+1 counter from this creature: Target land becomes a 2/2 creature that's still a land. Put a +1/+1 counter on it.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.",
    },
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["land"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: 0,
            power: 2,
            toughness: 2,
            addTypes: ["creature"],
            addSubtypes: [],
            duration: "permanent",
          },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from this creature: Target land becomes a 2/2 creature that's still a land. Put a +1/+1 counter on it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
});
