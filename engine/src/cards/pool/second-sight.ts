import { defineCard } from "../define.js";

// EDHREC rank 25422.

export default defineCard({
  name: "Second Sight",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{U}", keyword: "entwine" },
  text: "Choose one —\n• Look at the top five cards of target opponent's library, then put them back in any order.\n• Look at the top five cards of your library, then put them back in any order.\nEntwine {U} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Look at the top five cards of target opponent's library, then put them back in any order.",
        targets: ["opponent"],
        effect: {
          kind: "look-and-choose",
          from: { target: 0 },
          zone: "library",
          count: 5,
          min: 5,
          max: 5,
          destination: "library-top",
          leftover: "stay",
        },
      },
      {
        text: "Look at the top five cards of your library, then put them back in any order.",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 5,
          min: 5,
          max: 5,
          destination: "library-top",
          leftover: "stay",
        },
      },
    ],
    kickedModes: 2,
  },
});
