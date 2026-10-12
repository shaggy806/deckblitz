import { defineCard } from "../define.js";

export default defineCard({
  name: "Stromkirk Patrol",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 4,
  toughness: 3,
  text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
    },
  ],
});
