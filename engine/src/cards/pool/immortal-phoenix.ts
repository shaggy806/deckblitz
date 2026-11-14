import { defineCard } from "../define.js";

// If it leaves the graveyard before the trigger resolves, it stays where it
// went (the ruling): the trigger object is followed to the graveyard only.
export default defineCard({
  name: "Immortal Phoenix",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhen this creature dies, return it to its owner's hand.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: "When this creature dies, return it to its owner's hand.",
    },
  ],
});
