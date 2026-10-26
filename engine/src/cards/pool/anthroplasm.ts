import { defineCard } from "../define.js";

// EDHREC rank 26119.
//
// Rulings:
//   [2009-10-01] While Anthroplasm does become 0/0 for a moment while its ability resolves,
//     state-based actions are not checked until the ability has finished resolving.

export default defineCard({
  name: "Anthroplasm",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text: "This creature enters with two +1/+1 counters on it.\n{X}, {T}: Remove all +1/+1 counters from this creature and put X +1/+1 counters on it.",
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "remove-counter",
            target: "source",
            counter: "+1/+1",
            amount: { countersOn: "source", counter: "+1/+1" },
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
        ],
      },
      resolve: null,
      text: "{X}, {T}: Remove all +1/+1 counters from this creature and put X +1/+1 counters on it.",
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
