import { defineCard } from "../define.js";

// EDHREC rank 16421. Rulings (2022-02-18): an attached reconfigure Equipment
// that loses reconfigure stays a noncreature until this unattaches it (the
// engine's reconfigure is an effect of the attaching, not the ability).

const TRIGGER_TEXT = "When this Aura enters, tap enchanted permanent. If it's an Equipment, unattach it.";
const STATIC_TEXT = "Enchanted permanent loses all abilities and doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Tamiyo's Compleation",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant artifact, creature, or planeswalker\n${TRIGGER_TEXT}\n${STATIC_TEXT}`,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "planeswalker"] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { attachedTo: { subtype: "Equipment" } } },
            then: { kind: "unattach", target: "attached" },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      restrictions: ["doesnt-untap"],
      text: STATIC_TEXT,
    },
  ],
});
