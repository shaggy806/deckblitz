import { defineCard } from "../define.js";

// EDHREC rank 31993.
// A delayed triggered ability for the rest of the turn (rule 603.7c): each
// activation sets up another, so two activations give two counters per
// black spell. A Titan that has left and come back is a new object the
// counters can't reach (rule 400.7).
const TEXT = "{1}{R}{R}: Until end of turn, whenever you cast a black spell, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Mountain Titan",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "cast-spell", who: "you", filter: { colors: ["B"] } } },
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        text: "Whenever you cast a black spell, put a +1/+1 counter on this creature.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
