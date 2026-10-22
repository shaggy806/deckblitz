import { defineCard } from "../define.js";

// EDHREC rank 26196.

const TRIGGER =
  "At the beginning of combat on your turn, if you control an Ajani planeswalker, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Ajani's Comrade",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Ajani" }, atLeast: 1 },
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
