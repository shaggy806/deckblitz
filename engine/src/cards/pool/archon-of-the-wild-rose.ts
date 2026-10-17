import { defineCard } from "../define.js";

// EDHREC rank 10361.
//
// Rulings:
//   [2023-09-01] Effects that modify a creature's power and/or toughness without setting it will
//     apply to the affected creatures no matter when they started to take effect. The same is true
//     for counters that change a creature's power and/or toughness.
//   [2023-09-01] Archon of the Wild Rose's ability overwrites all previous effects that set the
//     affected creatures' power and/or toughness to specific values. Other effects that set these
//     characteristics to specific values that start to apply after Archon of the Wild Rose enters
//     the battlefield will overwrite this effect.
//
// A layer-7b `setBasePt` static (Sigarda's Summons' shape) over the other
// creatures you control with an Aura you control attached (`enchantedBy`).

const STATIC_TEXT =
  "Other creatures you control that are enchanted by Auras you control have base power and toughness 4/4 and have flying.";

export default defineCard({
  name: "Archon of the Wild Rose",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${STATIC_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", enchantedBy: "you" },
        excludeSelf: true,
      },
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying"],
      text: STATIC_TEXT,
    },
  ],
});
