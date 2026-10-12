import { defineCard } from "../define.js";

export default defineCard({
  name: "Manticore Eternal",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zombie", "Manticore"],
  power: 5,
  toughness: 4,
  text: "Afflict 3 (Whenever this creature becomes blocked, defending player loses 3 life.)\nThis creature attacks each combat if able.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "trigger-player" },
      resolve: null,
      text: "Afflict 3",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
