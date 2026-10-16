import { defineCard } from "../define.js";

// EDHREC rank 19956.
//
// Rulings:
//   [2024-09-20] Vicious Clown's ability checks the power of the other creature only at the moment
//     it enters. If a creature enters with counters, those counters are included. If a creature's
//     power is 2 or less when it enters but becomes greater than 2 while Vicious Clown's ability
//     is still on the stack, Vicious Clown will still get +2/+0 until end of turn when its ability
//     resolves.

const TEXT =
  "Whenever another creature you control with power 2 or less enters, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Vicious Clown",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Clown"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      // The power is read as the creature enters, counters it enters with
      // included; no intervening-if, so growing past 2 in response doesn't
      // stop the bonus (the ruling).
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "lte", n: 2 } },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
