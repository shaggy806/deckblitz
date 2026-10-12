import { defineCard } from "../define.js";

export default defineCard({
  name: "Khenra Eternal",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Jackal", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Afflict 1 (Whenever this creature becomes blocked, defending player loses 1 life.)",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-player" },
      resolve: null,
      text: "Afflict 1",
    },
  ],
});
