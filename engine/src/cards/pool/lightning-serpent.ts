import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 19992.
//
// Rulings:
//   [2006-07-15] If Lightning Serpent enters without X being paid because an effect puts it onto
//     the battlefield or an effect lets you cast it without paying its mana cost, then X is 0.

export default defineCard({
  name: "Lightning Serpent",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Serpent"],
  power: 2,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nThis creature enters with X +1/+0 counters on it.\nAt the beginning of the end step, sacrifice this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, sacrifice this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+0", amount: "x" } },
      text: "This creature enters with X +1/+0 counters on it.",
    },
  ],
});
