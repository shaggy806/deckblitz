import { defineCard } from "../define.js";

// EDHREC rank 29388.

export default defineCard({
  name: "Thunder Brute",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  tribute: 3,
  text: "Trample\nTribute 3 (As this creature enters, an opponent of your choice may put three +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, it gains haste until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, it gains haste until end of turn.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
