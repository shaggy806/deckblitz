import { defineCard } from "../define.js";

// "You may tap or untap target artifact or creature": Retreat to Coralhelm's
// modal of tap, untap or neither.
export default defineCard({
  name: "Iceberg Titan",
  art: "https://cards.scryfall.io/art_crop/back/a/c/ac5e9a53-cc4f-4ced-8088-5a73d619eae3.jpg",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 6,
  toughness: 6,
  text: "Whenever this creature attacks, you may tap or untap target artifact or creature.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["artifact-or-creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, you may tap or untap target artifact or creature.",
    },
  ],
  faces: ["Inverted Iceberg", "Iceberg Titan"],
  transform: true,
});
