import { defineCard } from "../define.js";

// EDHREC rank 25944.
//
// Rulings:
//   The middle ability of Enthralling Hold affects only the choice of target as the spell is cast.
//     If the creature becomes untapped before the spell resolves, it still resolves. If a player is
//     allowed to change the spell's target while it's on the stack, they may choose an untapped
//     creature. If you put Enthralling Hold onto the battlefield without casting it, you may attach
//     it to an untapped creature.
//   Gaining control of a permanent doesn't cause you to gain control of any Auras or Equipment
//     attached to it.

export default defineCard({
  name: "Enthralling Hold",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text:
    "Enchant creature\nYou can't choose an untapped creature as this spell's target as you cast it.\nYou control enchanted creature.",
  // Dream Leash's shape on a creature: the enchant ability is "creature"; the
  // tapped requirement is only the cast's choice (`asChosen`), so neither
  // resolution, a changed target nor the enchant ability reads it (the
  // rulings).
  targets: [{ kind: "permanent", filter: { type: "creature" }, asChosen: { tapped: true } }],
  controlEnchanted: true,
});
