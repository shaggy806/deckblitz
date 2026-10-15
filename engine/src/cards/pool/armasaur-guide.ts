import { defineCard } from "../define.js";

const TEXT = "Whenever you attack with three or more creatures, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Armasaur Guide",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 3 },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
