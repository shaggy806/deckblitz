import { defineCard } from "../define.js";

// EDHREC rank 26228. "If you control a token" is an intervening-if (rule
// 603.4), checked as it triggers and again as it resolves — not necessarily
// the same token (the ruling).

const ENTER_TEXT = "When this Aura enters, if you control a token, tap enchanted creature, then scry 2.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";

export default defineCard({
  name: "So Shiny",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UNTAP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { token: true }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
