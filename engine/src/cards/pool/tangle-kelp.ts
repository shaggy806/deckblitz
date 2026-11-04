import { defineCard } from "../define.js";

// The untap clause asks of the enchanted creature as its controller's untap step
// comes: that step's turn is the one under way, so their last is the one before.
const ENTERS_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT =
  "Enchanted creature doesn't untap during its controller's untap step if it attacked during its controller's last turn.";

export default defineCard({
  name: "Tangle Kelp",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS_TEXT}\n${UNTAP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { attackedDuringControllersLastTurn: true } } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
