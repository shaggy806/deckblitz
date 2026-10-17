import { defineCard } from "../define.js";

const TEXT = "Whenever you scry, put a +1/+1 counter on this creature. This ability triggers only once each turn.";

export default defineCard({
  name: "Chance-Met Elves",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
