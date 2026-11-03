import { defineCard } from "../define.js";

// "That player" is the enchanted creature's controller, read at each untap step
// (rule 502.3), whoever controls this Aura and however the monarchy has moved.
const ENTER_TEXT = "When this Aura enters, tap enchanted creature and you become the monarch.";
const UNTAP_TEXT =
  "Enchanted creature doesn't untap during its controller's untap step unless that player is the monarch.";

export default defineCard({
  name: "Fall from Favor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UNTAP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "tap", target: "attached" }, { kind: "become-monarch" }],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "not", of: { kind: "source", filter: { attachedTo: { controlledBy: "monarch" } } } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
