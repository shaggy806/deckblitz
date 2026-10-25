import { defineCard } from "../define.js";

// EDHREC rank 22983. You lose the 1 life even if the counter can't be put on
// it, it having left in response (the ruling).

export default defineCard({
  name: "Fretwork Colony",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: "This creature can't block.\nAt the beginning of your upkeep, put a +1/+1 counter on this creature and you lose 1 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "lose-life", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, put a +1/+1 counter on this creature and you lose 1 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
