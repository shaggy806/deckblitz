import { defineCard } from "../define.js";

// EDHREC rank 9326.
//
// An `others-enter-battlefield` replacement never reaches a creature entering
// alongside it (the ruling), and reads X — the +1/+1 counters on the Thrinax —
// as each other creature enters.
const TEXT =
  "Each other creature you control enters with an additional X +1/+1 counters on it, where X is the number of +1/+1 counters on this creature.";

export default defineCard({
  name: "Bloodspore Thrinax",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 2,
  devour: { multiplier: 1, filter: { type: "creature" } },
  text: `Devour 1 (As this creature enters, you may sacrifice any number of creatures. It enters with that many +1/+1 counters on it.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: { countersOn: "source", counter: "+1/+1" } },
      },
      text: TEXT,
    },
  ],
});
