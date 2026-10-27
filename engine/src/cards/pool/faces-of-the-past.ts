import { defineCard } from "../define.js";

// EDHREC rank 17554.
// Rulings:
//   [2004-10-04] You choose whether to tap or untap during resolution.
//   [2004-10-04] You either tap all of them or untap all of them. You can't tap some and untap
//     others.

export default defineCard({
  name: "Faces of the Past",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever a creature dies, tap all untapped creatures that share a creature type with it or untap all tapped creatures that share a creature type with it.",
  triggered: [
    {
      // The choice is made as it resolves (an unannounced modal); "it" is
      // the creature that died, as it last existed.
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Tap all untapped creatures that share a creature type with it.",
            effect: {
              kind: "tap-all",
              filter: { type: "creature", tapped: false, sharesCreatureTypeWith: "trigger-object" },
            },
          },
          {
            text: "Untap all tapped creatures that share a creature type with it.",
            effect: {
              kind: "untap-all",
              filter: { type: "creature", tapped: true, sharesCreatureTypeWith: "trigger-object" },
            },
          },
        ],
      },
      resolve: null,
      text: "Whenever a creature dies, tap all untapped creatures that share a creature type with it or untap all tapped creatures that share a creature type with it.",
    },
  ],
});
