import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 31347.
//
// Any permanent turned face up, not just a creature, its controller's or not (the ruling).
const TEXT = "Whenever a permanent is turned face up, this creature deals 1 damage to any target.";

export default defineCard({
  name: "Bonethorn Valesk",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "any" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
