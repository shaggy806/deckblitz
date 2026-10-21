import { defineCard } from "../define.js";

const ENTER =
  "When this Aura enters, tap enchanted creature and you create a 1/1 blue Fish creature token with \"This token can't be blocked.\"";
const LOCK = "Enchanted creature doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Sleep with the Fishes",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER}\n${LOCK}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "create-token", token: "Fish Token (Expendable Lackey)", count: 1 },
        ],
      },
      resolve: null,
      text: ENTER,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: LOCK,
    },
  ],
});
