import { defineCard } from "../define.js";

// The Brothers' War. Zoetic Glyph's static with no creature type: the
// artifact keeps its other types and subtypes, and its base P/T is set in
// layer 7b, so later P/T-setting effects overwrite it and modifiers and
// counters still apply (the rulings).
const DRAW_TEXT = "When this Aura enters, draw a card.";
const STATIC_TEXT = "Enchanted artifact is a creature with base power and toughness 4/4 in addition to its other types.";

export default defineCard({
  name: "Mightstone's Animation",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${DRAW_TEXT}\n${STATIC_TEXT}`,
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 4 },
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
