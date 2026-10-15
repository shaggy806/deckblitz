import { defineCard } from "../define.js";

// EDHREC rank 8652.
//
// Rulings:
//   [2025-06-06] Minwu's last ability triggers just once for each life-gaining event, whether it's
//     1 life from Al Bhed Salvagers or 3 life from Balamb T-Rexaur.
//   [2025-06-06] Each creature with lifelink dealing combat damage causes a separate life-gaining
//     event.
//
// `gains-life` fires once per life-gaining event (Archangel of Thune's shape),
// here only for Clerics.

const GAIN_TEXT = "Whenever you gain life, put a +1/+1 counter on each Cleric you control.";

export default defineCard({
  name: "Minwu, White Mage",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "lifelink"],
  text: `Vigilance, lifelink\n${GAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", subtype: "Cleric", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
