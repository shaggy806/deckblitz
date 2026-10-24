import { defineCard } from "../define.js";

// EDHREC rank 20563. Any destination counts; a creature that stops being one
// or phases out doesn't leave (the ruling).
const TEXT = "Whenever another creature you control leaves the battlefield, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Ninth Bridge Patrol",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
