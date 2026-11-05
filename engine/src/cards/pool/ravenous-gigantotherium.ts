import { defineCard } from "../define.js";

// EDHREC rank 21796. X is its power as the trigger goes on the stack, locked in
// (the rulings), and "up to X" follows from at least 1 each.

const TEXT =
  "When this creature enters, it deals X damage divided as you choose among up to X target creatures, where X is its power. Each of those creatures deals damage equal to its power to this creature.";

export default defineCard({
  name: "Ravenous Gigantotherium",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  devour: { multiplier: 3, filter: { type: "creature" } },
  text: `Devour 3 (As this creature enters, you may sacrifice any number of creatures. It enters with three times that many +1/+1 counters on it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature" }],
      divided: { total: { powerOf: "source" }, slot: 0 },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-divided", from: 0 },
          { kind: "for-each-target", from: 0, effect: { kind: "fight", a: 0, b: "source", oneSided: true } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
