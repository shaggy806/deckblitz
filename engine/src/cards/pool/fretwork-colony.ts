import { defineCard } from "../define.js";

// The life loss happens even when the counter can't be put on (it left in
// response — the ruling): a sequence does each step regardless.

const UPKEEP_TEXT = "At the beginning of your upkeep, put a +1/+1 counter on this creature and you lose 1 life.";

export default defineCard({
  name: "Fretwork Colony",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: `This creature can't block.\n${UPKEEP_TEXT}`,
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
      text: UPKEEP_TEXT,
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
