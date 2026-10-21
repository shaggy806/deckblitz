import { defineCard } from "../define.js";

const TEXT =
  "Enrage — Whenever this creature is dealt damage, exile target creature an opponent controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Trapjaw Tyrant",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
