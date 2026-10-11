import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 19701.
//
// Rulings:
//   [2026-08-21] The effect of Multiply by Zero overrides any other effect that sets a creature's
//     base power and toughness, as well as any characteristic-defining abilities that set base
//     power and toughness. However, if any other effects are increasing that creature's
//     toughness, such as a +1/+1 counter or an effect that gave the creature +1/+1 until end of
//     turn, those will still apply.
//
// `animate`'s set P/T is layer 7b, after a characteristic-defining ability
// (7a) and before modifications and counters (7c).

const TEXT = "Target creature has base power and toughness 0/0 until end of turn.";

export default defineCard({
  name: "Multiply by Zero",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 0,
    toughness: 0,
    addTypes: [],
    addSubtypes: [],
    duration: "end-of-turn",
  },
});
