import { defineCard } from "../define.js";

// EDHREC rank 15138.
//
// Rulings:
//   [2025-07-25] If the enchanted creature is tapped as a cost to cast a spell or to activate an
//     ability that's not a mana ability, Cryoshatter's last ability will go on the stack on top of
//     that spell or activated ability.
//   [2025-07-25] An ability that triggers when a creature "becomes tapped" won't trigger until the
//     creature changes from being untapped to being tapped.
//   [2025-07-25] That creature will be destroyed when the ability resolves, even if Cryoshatter
//     has left the battlefield or is somehow enchanting a different creature by then.
//
// "Becomes tapped or is dealt damage" is one ability with two trigger events,
// written as two triggers (Appa's "enters or attacks" shape). Each destroys
// the creature it triggered on (the trigger object), not whatever the Aura is
// attached to as it resolves — the ruling.

const DESTROY_TEXT = "When enchanted creature becomes tapped or is dealt damage, destroy it.";

export default defineCard({
  name: "Cryoshatter",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets -5/-0.\n${DESTROY_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-5, 0],
      text: "Enchanted creature gets -5/-0.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DESTROY_TEXT,
    },
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
