import { defineCard } from "../define.js";

// EDHREC rank 20621.
//
// Rulings:
//   [2023-04-14] A token’s name is its subtypes plus the word “Token” unless it’s copying another
//     object or it was given a specific name by the effect that created it. For example, Myr
//     tokens are named “Myr Token,” and they have a different name than Phyrexian Myr tokens,
//     which are named “Phyrexian Myr Token.”
//   [2023-04-14] To determine the number of differently named artifact tokens you control, count
//     each artifact token you control once, but only if its English name isn’t exactly the same as
//     another artifact token you’ve already counted this way.

export default defineCard({
  name: "Sandsteppe War Riders",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nAt the beginning of combat on your turn, bolster X, where X is the number of differently named artifact tokens you control. (Choose a creature with the least toughness among creatures you control and put X +1/+1 counters on it.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "bolster",
        amount: { distinctTokenNames: { token: true, type: "artifact", controlledBy: "you" } },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, bolster X, where X is the number of differently named artifact tokens you control.",
    },
  ],
});
