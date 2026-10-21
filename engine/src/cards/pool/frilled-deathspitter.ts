import { defineCard } from "../define.js";

// Rulings: it triggers once however many sources damage it at once, and it
// triggers on lethal damage too — the damage then comes from it as it last
// existed.
const ENRAGE = "Enrage — Whenever this creature is dealt damage, it deals 2 damage to target opponent or planeswalker.";

export default defineCard({
  name: "Frilled Deathspitter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 2,
  text: ENRAGE,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: ENRAGE,
    },
  ],
});
