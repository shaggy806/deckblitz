import { defineCard } from "../define.js";

// EDHREC rank 24602. Every end step, not only its controller's (Lightning
// Shrieker's shape).
//
// Rulings:
//   [2009-05-01] A token that's copying Blitz Hellion will be shuffled into its owner's library
//     when this ability resolves, then will cease to exist.
//   [2009-05-01] If it's not on the battlefield by the time this ability resolves, nothing
//     happens. Blitz Hellion stays wherever it is, and its owner doesn't shuffle their library.
export default defineCard({
  name: "Blitz Hellion",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 7,
  toughness: 7,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nAt the beginning of the end step, this creature's owner shuffles it into their library.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: "At the beginning of the end step, this creature's owner shuffles it into their library.",
    },
  ],
});
