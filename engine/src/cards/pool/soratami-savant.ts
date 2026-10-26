import { defineCard } from "../define.js";

// EDHREC rank 14906.

const COUNTER_TEXT = "{3}, Return a land you control to its owner's hand: Counter target spell unless its controller pays {3}.";

export default defineCard({
  name: "Soratami Savant",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${COUNTER_TEXT}`,
  activated: [
    {
      // Soramaro's land-return cost, Confounding Riddle's counter.
      cost: { mana: "{3}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: ["spell"],
      effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
