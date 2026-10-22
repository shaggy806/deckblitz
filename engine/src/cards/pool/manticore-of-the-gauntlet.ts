import { defineCard } from "../define.js";

// EDHREC rank 30677.

export default defineCard({
  name: "Manticore of the Gauntlet",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Manticore"],
  power: 5,
  toughness: 4,
  text: "When this creature enters, put a -1/-1 counter on target creature you control. This creature deals 3 damage to target opponent or planeswalker.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control", "opponent-or-planeswalker"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
          { kind: "damage", amount: 3, target: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, put a -1/-1 counter on target creature you control. This creature deals 3 damage to target opponent or planeswalker.",
    },
  ],
});
