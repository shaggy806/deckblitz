import { defineCard } from "../define.js";

// EDHREC rank 26326. It's tapped whether or not the damage is prevented (the
// ruling): the tap is its own step, before the damage.

export default defineCard({
  name: "Primordial Ooze",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 1,
  text: "This creature attacks each combat if able.\nAt the beginning of your upkeep, put a +1/+1 counter on this creature. Then you may pay {X}, where X is the number of +1/+1 counters on it. If you don't, tap this creature and it deals X damage to you.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "unless",
            chooser: "you",
            options: [{ payGeneric: { countersOn: "source", counter: "+1/+1" }, text: "Pay {X}." }],
            otherwise: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: "source" },
                { kind: "damage", amount: { countersOn: "source", counter: "+1/+1" }, who: "you" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, put a +1/+1 counter on this creature. Then you may pay {X}, where X is the number of +1/+1 counters on it. If you don't, tap this creature and it deals X damage to you.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
