import { defineCard } from "../define.js";

// EDHREC rank 26207.

export default defineCard({
  name: "Siren of the Fanged Coast",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  tribute: 3,
  text: "Flying\nTribute 3 (As this creature enters, an opponent of your choice may put three +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, gain control of target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, gain control of target creature.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
