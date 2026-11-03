import { defineCard } from "../define.js";

const CYCLE_TEXT = "When you cycle this card, counter target activated or triggered ability you don't control.";

export default defineCard({
  name: "Nimble Obstructionist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 3,
  toughness: 1,
  keywords: ["flash", "flying"],
  cycling: { cost: "{2}{U}" },
  text: `Flash\nFlying\nCycling {2}{U} ({2}{U}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [{ kind: "ability", whose: "opponent" }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
