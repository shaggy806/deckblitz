import { defineCard } from "../define.js";

// EDHREC rank 21221.

export default defineCard({
  name: "Inquisitor Exarch",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, choose one —\n• You gain 2 life.\n• Target opponent loses 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "You gain 2 life.", effect: { kind: "gain-life", amount: 2 } },
          {
            text: "Target opponent loses 2 life.",
            targets: ["opponent"],
            effect: { kind: "lose-life", amount: 2, target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
