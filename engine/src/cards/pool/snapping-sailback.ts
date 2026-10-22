import { defineCard } from "../define.js";

// EDHREC rank 14589.
//
// Rulings: damage from several sources at once triggers it once; lethal
// damage triggers it, but the creature is gone before it resolves.

export default defineCard({
  name: "Snapping Sailback",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  keywords: ["flash"],
  text: "Flash\nEnrage — Whenever this creature is dealt damage, put a +1/+1 counter on it. (It must survive the damage to get the counter.)",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Enrage — Whenever this creature is dealt damage, put a +1/+1 counter on it.",
    },
  ],
});
