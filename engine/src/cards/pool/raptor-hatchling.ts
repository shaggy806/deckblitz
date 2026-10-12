import { defineCard } from "../define.js";

export default defineCard({
  name: "Raptor Hatchling",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 1,
  toughness: 1,
  text: "Enrage — Whenever this creature is dealt damage, create a 3/3 green Dinosaur creature token with trample.",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Token", count: 1 },
      resolve: null,
      text: "Enrage — Whenever this creature is dealt damage, create a 3/3 green Dinosaur creature token with trample.",
    },
  ],
});
