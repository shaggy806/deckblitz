import { defineCard } from "../define.js";

// EDHREC rank 20211.
//
// Rulings:
//   Hope Against Hope's second ability counts the enchanted creature, so that creature will
//     normally get at least +1/+1.
//
// Horn of Valhalla's per-count bonus; Sea Legs' "as long as enchanted
// creature is a …" condition.

const PUMP_TEXT = "Enchanted creature gets +1/+1 for each creature you control.";
const STRIKE_TEXT = "As long as enchanted creature is a Human, it has first strike.";

export default defineCard({
  name: "Hope Against Hope",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${STRIKE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Human" } } },
      grantKeywords: ["first-strike"],
      text: STRIKE_TEXT,
    },
  ],
});
