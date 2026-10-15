import { defineCard } from "../define.js";

// EDHREC rank 18595.
const TEXT = "At the beginning of combat on your turn, put a +1/+1 counter on another target creature you control.";

export default defineCard({
  name: "Loxodon Battle Priest",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
