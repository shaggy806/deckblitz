import { defineCard } from "../define.js";

const CYCLE_TEXT = "When you cycle this card, target creature gains flying until end of turn.";

export default defineCard({
  name: "Windcaller Aven",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  cycling: { cost: "{U}" },
  text: `Flying\nCycling {U} ({U}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
