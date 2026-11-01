import { defineCard } from "../define.js";

// EDHREC rank 22432.
//
// Three activations each turn at most (rule 602.5b), each paying its {B} and
// its 1 life.
const PUMP_TEXT = "{B}, Pay 1 life: This creature gets +1/+0 until end of turn. Activate no more than three times each turn.";

export default defineCard({
  name: "Sewer Rats",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: false, payLife: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      timesEachTurn: 3,
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
