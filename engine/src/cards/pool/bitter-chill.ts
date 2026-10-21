import { defineCard } from "../define.js";

// EDHREC rank 13276. The last ability is a leaves-to-graveyard trigger
// (Nihil Spellbomb's shape): an Aura spell that fails to resolve goes to the
// graveyard from the stack, not the battlefield, and doesn't trigger it (the
// ruling).

const ENTER_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const DIES_TEXT =
  "When this Aura is put into a graveyard from the battlefield, you may pay {1}. If you do, scry 1, then draw a card.";

export default defineCard({
  name: "Bitter Chill",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UNTAP_TEXT}\n${DIES_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to scry 1, then draw a card?",
        cost: "{1}",
        effect: { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } },
      },
      resolve: null,
      text: DIES_TEXT,
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
