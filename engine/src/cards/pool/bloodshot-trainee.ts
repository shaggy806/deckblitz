import { defineCard } from "../define.js";

// EDHREC rank 25399. Future Sight.
//
// The power check is an activation restriction only: once activated, it
// deals 4 even if its power has dropped (the ruling).

export default defineCard({
  name: "Bloodshot Trainee",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 3,
  text: "{T}: This creature deals 4 damage to target creature. Activate only if this creature's power is 4 or greater.",
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "source", filter: { power: { op: "gte", n: 4 } } },
      targets: ["creature"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 4 damage to target creature. Activate only if this creature's power is 4 or greater.",
    },
  ],
});
