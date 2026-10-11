import { defineCard } from "../define.js";

// "That much" is the life gained, the trigger's value: paying it is a life
// cost of that size (rule 119.4 — payable only with at least that much), and
// the draw is the same number. Each life-gain event triggers it once, so
// two lifelink creatures dealing combat damage at once trigger it twice (the
// ruling).
const GAIN_TEXT = "Whenever you gain life, you may pay that much life. If you do, draw that many cards.";
const DRAIN_TEXT = "{T}: Each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Niv-Mizzet, Ghost Counsel",
  manaCost: "{2}{W}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${GAIN_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay that much life to draw that many cards?",
        costLife: { triggerValue: true },
        effect: { kind: "draw", amount: { triggerValue: true } },
      },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
