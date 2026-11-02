import { defineCard } from "../define.js";

export default defineCard({
  name: "Signal Pest",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Pest"],
  power: 0,
  toughness: 1,
  text: "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)\nThis creature can't be blocked except by creatures with flying or reach.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt-all", filter: { type: "creature", attacking: true }, power: 1, toughness: 0, duration: "end-of-turn", exceptSource: true },
      resolve: null,
      text: "Battle cry",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { not: { anyOf: [{ keyword: "flying" }, { keyword: "reach" }] } },
      text: "This creature can't be blocked except by creatures with flying or reach.",
    },
  ],
});
