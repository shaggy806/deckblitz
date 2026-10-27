import { defineCard } from "../define.js";

// EDHREC rank 29465.
//
// Rulings:
//   [2004-10-04] The number of +1/+1 counters for the ability is checked when the ability
//     resolves.

export default defineCard({
  name: "Canopy Crawler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  text: "Amplify 1 (As this creature enters, put a +1/+1 counter on it for each Beast card you reveal in your hand.)\n{T}: Target creature gets +1/+1 until end of turn for each +1/+1 counter on this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: { countersOn: "source", counter: "+1/+1" }, toughness: { countersOn: "source", counter: "+1/+1" }, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature gets +1/+1 until end of turn for each +1/+1 counter on this creature.",
    },
  ],
  amplify: 1,
});
