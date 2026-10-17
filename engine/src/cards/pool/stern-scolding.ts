import { defineCard } from "../define.js";

// EDHREC rank 11122.
//
// The spell's power and toughness are read as it is on the stack (a filter's
// P/T clause is computed for a spell too).

export default defineCard({
  name: "Stern Scolding",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature spell with power or toughness 2 or less.",
  targets: [
    {
      kind: "spell",
      filter: {
        type: "creature",
        anyOf: [{ power: { op: "lte", n: 2 } }, { toughness: { op: "lte", n: 2 } }],
      },
    },
  ],
  effect: { kind: "counter", target: 0 },
});
