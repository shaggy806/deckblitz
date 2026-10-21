import { defineCard } from "../define.js";

// EDHREC rank 24830. Charmed Sleep with an intervening-if on the tap.

const ENTERS =
  "When this Aura enters, if there are five or more cards in your graveyard, tap enchanted creature.";

export default defineCard({
  name: "Locked in the Cemetery",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\nEnchanted creature doesn't untap during its controller's untap step.`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 5 },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
