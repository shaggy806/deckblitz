import { defineCard } from "../define.js";

// EDHREC rank 19761.

export default defineCard({
  name: "Duskwatch Hunter",
  manaCost: "{2}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 1,
  text: "This creature can't be blocked by tokens.\nWhen this creature enters, put a +1/+1 counter on target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { token: true },
      text: "This creature can't be blocked by tokens.",
    },
  ],
});
