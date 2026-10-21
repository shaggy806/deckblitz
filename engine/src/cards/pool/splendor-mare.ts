import { defineCard } from "../define.js";

const CYCLE_TEXT = "When you cycle this card, put a lifelink counter on target creature you control.";

export default defineCard({
  name: "Splendor Mare",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elk", "Unicorn"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  cycling: { cost: "{1}{W}" },
  text: `Lifelink\nCycling {1}{W} ({1}{W}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "lifelink", amount: 1 },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
