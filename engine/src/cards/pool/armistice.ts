import { defineCard } from "../define.js";

const TEXT = "{3}{W}{W}: You draw a card and target opponent gains 3 life.";

export default defineCard({
  name: "Armistice",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{W}{W}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "gain-life", amount: 3, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
