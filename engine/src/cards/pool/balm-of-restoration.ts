import { defineCard } from "../define.js";

// EDHREC rank 31121.

export default defineCard({
  name: "Balm of Restoration",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}, Sacrifice this artifact: Choose one —\n• You gain 2 life.\n• Prevent the next 2 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "You gain 2 life.", effect: { kind: "gain-life", amount: 2 } },
          {
            text: "Prevent the next 2 damage that would be dealt to any target this turn.",
            targets: ["any-target"],
            effect: { kind: "prevent-damage", target: 0, amount: 2 },
          },
        ],
      },
      resolve: null,
      text: "{1}, {T}, Sacrifice this artifact: Choose one —",
    },
  ],
});
