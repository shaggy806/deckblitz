import { defineCard } from "../define.js";

// EDHREC rank 9393. Once per gain of energy, however many (the ruling): one
// +1/+1 counter.
//
// Rulings:
//   If you get multiple {E} at once, you only put one +1/+1 counter on a creature, not one counter
//     for each {E}. If you get multiple {E} at different times, Fabrication Module's ability
//     triggers once each time.

const ENERGY_TEXT =
  "Whenever you get one or more {E} (energy counters), put a +1/+1 counter on target creature you control.";
const TAP_TEXT = "{4}, {T}: You get {E}.";

export default defineCard({
  name: "Fabrication Module",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ENERGY_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "you", counter: "energy", orPlayer: true },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENERGY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
