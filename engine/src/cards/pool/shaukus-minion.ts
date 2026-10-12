import { defineCard } from "../define.js";

export default defineCard({
  name: "Shauku's Minion",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 2,
  toughness: 2,
  text: "{B}{R}, {T}: This creature deals 2 damage to target white creature.",
  activated: [
    {
      cost: { mana: "{B}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { colors: ["W"], type: "creature" } }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{B}{R}, {T}: This creature deals 2 damage to target white creature.",
    },
  ],
});
