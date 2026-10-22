import { defineCard } from "../define.js";

// EDHREC rank 25869. Hour of Devastation. Exert is part of the second
// ability's cost (rule 701.43).
export default defineCard({
  name: "Fervent Paincaster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 1,
  text: "{T}: This creature deals 1 damage to target player or planeswalker.\n{T}, Exert this creature: It deals 1 damage to target creature. (An exerted creature won't untap during your next untap step.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to target player or planeswalker.",
    },
    {
      cost: { mana: null, tap: true, exertSelf: true },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}, Exert this creature: It deals 1 damage to target creature.",
    },
  ],
});
