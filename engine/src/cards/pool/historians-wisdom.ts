import { defineCard } from "../define.js";

// The trigger reads the permanent with this Aura's +2/+1 on it, as it enters
// and again as it resolves (rule 603.4).
const DRAW_TEXT =
  "When this Aura enters, if enchanted permanent is a creature with the greatest power among creatures on the battlefield, draw a card.";
const PT_TEXT = "As long as enchanted permanent is a creature, it gets +2/+1.";

export default defineCard({
  name: "Historian's Wisdom",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${DRAW_TEXT}\n${PT_TEXT}`,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "source",
        filter: {
          attachedTo: { type: "creature", greatestInZone: { of: "power", among: { type: "creature" } } },
        },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [2, 1],
      text: PT_TEXT,
    },
  ],
});
