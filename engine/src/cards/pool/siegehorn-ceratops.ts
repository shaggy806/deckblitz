import { defineCard } from "../define.js";

// EDHREC rank 12949. Rivals of Ixalan.
//
// Enrage: once per damage event however many sources (the ruling). A
// creature dealt lethal damage has left before this resolves, so the
// counters find nothing (rule 400.7).

export default defineCard({
  name: "Siegehorn Ceratops",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 2,
  text: "Enrage — Whenever this creature is dealt damage, put two +1/+1 counters on it. (It must survive the damage to get the counters.)",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "Enrage — Whenever this creature is dealt damage, put two +1/+1 counters on it.",
    },
  ],
});
