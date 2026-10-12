import { defineCard } from "../define.js";

export default defineCard({
  name: "Enraged Revolutionary",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: "Dethrone (Whenever this creature attacks the player with the most life or tied for most life, put a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defenderLife: "most" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Dethrone",
    },
  ],
});
