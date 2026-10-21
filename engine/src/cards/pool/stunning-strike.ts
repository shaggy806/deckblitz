import { defineCard } from "../define.js";

// EDHREC rank 24384.
//
// Shield of the Oversoul's "as long as enchanted creature is …" condition
// (`attachedTo`), gating Charmed Sleep's doesn't-untap restriction.

const UNTAP_TEXT =
  "As long as enchanted creature isn't legendary, it doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Stunning Strike",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\nWhen this Aura enters, tap enchanted creature and remove it from combat.\n${UNTAP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "remove-from-combat", target: "attached" },
        ],
      },
      resolve: null,
      text: "When this Aura enters, tap enchanted creature and remove it from combat.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { notSupertype: "legendary" } } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
