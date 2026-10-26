import { defineCard } from "../define.js";

export default defineCard({
  name: "Vedalken Ghoul",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Vedalken", "Zombie"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature becomes blocked, defending player loses 4 life.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: 4 },
      resolve: null,
      text: "Whenever this creature becomes blocked, defending player loses 4 life.",
    },
  ],
});
