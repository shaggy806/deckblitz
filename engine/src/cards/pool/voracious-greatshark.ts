import { defineCard } from "../define.js";

// EDHREC rank 12332. Ikoria: Lair of Behemoths.
//
// Rulings:
//   - You can cast Voracious Greatshark without a target for its enters-the-battlefield triggered
//     ability. That ability will simply not happen. It won't cause Voracious Greatshark to counter
//     itself.
const TRIGGER_TEXT = "When this creature enters, counter target artifact or creature spell.";

export default defineCard({
  name: "Voracious Greatshark",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shark"],
  power: 5,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "spell", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
