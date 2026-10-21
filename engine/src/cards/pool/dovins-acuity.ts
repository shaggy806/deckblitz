import { defineCard } from "../define.js";

const ETB_TEXT = "When this enchantment enters, you gain 2 life and draw a card.";
const BOUNCE_TEXT =
  "Whenever you cast an instant spell during your main phase, you may return this enchantment to its owner's hand.";

// "During your main phase" is part of the trigger event (`whileCondition`,
// rule 603.1), not an intervening-if: asked as the instant is cast. The
// return resolves before that spell, countered or not (the ruling).
export default defineCard({
  name: "Dovin's Acuity",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${BOUNCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "instant" } },
      whileCondition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] }],
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Dovin's Acuity to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
