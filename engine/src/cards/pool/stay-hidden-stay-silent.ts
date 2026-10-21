import { defineCard } from "../define.js";

// EDHREC rank 17774.
//
// Rulings:
//   [2024-09-20] Only the controller of Stay Hidden, Stay Silent may activate its last ability.
//   [2024-09-20] If your library contains only one card when you manifest dread, you'll look at
//     that card and put it onto the battlefield face down. If your library contains no cards when
//     you manifest dread, you won't do anything.

const SHUFFLE =
  "{4}{U}{U}: Shuffle enchanted creature into its owner's library, then manifest dread. Activate only as a sorcery.";

export default defineCard({
  name: "Stay Hidden, Stay Silent",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.\n${SHUFFLE}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{4}{U}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "shuffle-into-library", target: "attached" }, { kind: "manifest-dread" }],
      },
      resolve: null,
      text: SHUFFLE,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, tap enchanted creature.",
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
