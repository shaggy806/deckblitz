import { defineCard } from "../define.js";

const KHANS_TEXT = "Khans — At the beginning of your draw step, draw an additional card, then discard a card.";
const DRAGONS_TEXT = "Dragons — Spells your opponents cast that target you or a permanent you control cost {2} more to cast.";

export default defineCard({
  name: "Monastery Siege",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose Khans or Dragons.\n• ${KHANS_TEXT}\n• ${DRAGONS_TEXT}`,
  chooseOnEnter: ["Khans", "Dragons"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      condition: { kind: "chosen-on-enter", value: "Khans" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: KHANS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "chosen-on-enter", value: "Dragons" },
      targetedBySpellsCost: { payGeneric: 2, targetingYou: true, targeting: { controlledBy: "you" } },
      text: DRAGONS_TEXT,
    },
  ],
});
