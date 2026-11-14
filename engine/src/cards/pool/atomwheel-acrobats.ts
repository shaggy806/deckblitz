import { defineCard } from "../define.js";

// Rulings:
//   [2022-10-07] Anything that references the "result" of a die roll is looking for the result
//     after modifications.
//   [2022-10-07] If a die is rerolled, the original roll essentially never happened.

const ROLL_TEXT = "Whenever you roll a 1 or 2, put that many +1/+1 counters on this creature.";
const ABILITY_TEXT = "{2}{G}: Roll a six-sided die.";

export default defineCard({
  name: "Atomwheel Acrobats",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Performer"],
  power: 3,
  toughness: 2,
  text: `${ROLL_TEXT}\n${ABILITY_TEXT}`,
  triggered: [
    {
      // Once per die whose result (after modifications) is 1 or 2; "that
      // many" is that result.
      trigger: { on: "event", event: "rolls-die", who: "you", die: { atLeast: 1, atMost: 2 } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "roll-dice", sides: 6 },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
