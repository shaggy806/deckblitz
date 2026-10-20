import { defineCard } from "../define.js";

// Rulings:
//   [2021-07-23] Monk of the Open Hand doesn't need to have been on the battlefield as the first
//     spell was cast. For example, if Monk of the Open Hand is the first spell you cast, and then
//     you cast another spell after the Monk resolved, that spell would cause the Flurry of Blows
//     ability to trigger.
//   [2021-07-23] If Monk of the Open Hand is the second spell you cast in a turn, spells you cast
//     after that point in the same turn will not cause the Flurry of Blows ability to trigger.

const TEXT = "Flurry of Blows — Whenever you cast your second spell each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Monk of the Open Hand",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elf", "Monk"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
