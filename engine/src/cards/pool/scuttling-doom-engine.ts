import { defineCard } from "../define.js";

export default defineCard({
  name: "Scuttling Doom Engine",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 6,
  toughness: 6,
  text: "This creature can't be blocked by creatures with power 2 or less.\nWhen this creature dies, it deals 6 damage to target opponent or planeswalker.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: 6, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 6 damage to target opponent or planeswalker.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
