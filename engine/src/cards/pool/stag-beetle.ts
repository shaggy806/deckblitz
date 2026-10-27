import { defineCard } from "../define.js";

// Rulings:
//   The value of X is calculated once, as Stag Beetle is entering.

const ENTER_TEXT =
  "This creature enters with X +1/+1 counters on it, where X is the number of other creatures on the battlefield.";

export default defineCard({
  name: "Stag Beetle",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 0,
  text: ENTER_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countOf: { type: "creature" }, excludeSelf: true } },
      },
      text: ENTER_TEXT,
    },
  ],
});
