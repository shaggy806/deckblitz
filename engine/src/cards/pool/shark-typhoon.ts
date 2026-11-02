import { defineCard } from "../define.js";

const CAST_TEXT = "Whenever you cast a noncreature spell, create an X/X blue Shark creature token with flying, where X is that spell's mana value.";
const CYCLING_TEXT = "Cycling {X}{1}{U} ({X}{1}{U}, Discard this card: Draw a card.)";
const CYCLE_TEXT = "When you cycle this card, create an X/X blue Shark creature token with flying.";

export default defineCard({
  name: "Shark Typhoon",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["enchantment"],
  cycling: { cost: "{X}{1}{U}" },
  text: `${CAST_TEXT}\n${CYCLING_TEXT}\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Shark Token (Shark Typhoon)",
        count: 1,
        basePt: { power: { manaValueOf: "trigger-object" }, toughness: { manaValueOf: "trigger-object" } },
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Shark Token (Shark Typhoon)",
        count: 1,
        basePt: { power: { triggerValue: true }, toughness: { triggerValue: true } },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
