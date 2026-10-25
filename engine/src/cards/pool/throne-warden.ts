import { defineCard } from "../define.js";

// EDHREC rank 17897.
//
// An intervening-if (rule 603.4): checked as the end step begins and again
// as the ability resolves (the ruling).

const TEXT = "At the beginning of your end step, if you're the monarch, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Throne Warden",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "monarch", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
