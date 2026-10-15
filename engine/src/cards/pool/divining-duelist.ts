import { defineCard } from "../define.js";

// EDHREC rank 27287.

const ENTER_TEXT = "When this creature enters, choose one —";
const TAP_MODE = "• Tap target creature.";
const UNTAP_MODE = "• Untap target creature.";
const LOOT_MODE = "• Draw a card, then discard a card.";

// The mode is chosen as the trigger goes on the stack (rule 700.2b —
// `announced`).
export default defineCard({
  name: "Divining Duelist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${TAP_MODE}\n${UNTAP_MODE}\n${LOOT_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: TAP_MODE, targets: ["creature"], effect: { kind: "tap", target: 0 } },
          { text: UNTAP_MODE, targets: ["creature"], effect: { kind: "untap", target: 0 } },
          {
            text: LOOT_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "discard", target: "you", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: `${ENTER_TEXT} ${TAP_MODE} ${UNTAP_MODE} ${LOOT_MODE}`,
    },
  ],
});
