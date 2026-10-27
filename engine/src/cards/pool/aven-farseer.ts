import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 29988.
//
// Any permanent turned face up, not just a creature, its controller's or not (the ruling).
const TEXT = "Whenever a permanent is turned face up, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Aven Farseer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
