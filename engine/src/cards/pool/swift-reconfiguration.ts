import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 4025.
//
// Rulings:
//   [2022-02-18] If the enchanted permanent was attacking or blocking (or being attacked if it's a
//     planeswalker) when Swift Reconfiguration becomes attached to it, that permanent is removed
//     from combat.
//   [2022-02-18] The permanent keeps all of its abilities. Notably, if Swift Reconfiguration
//     enchants a Vehicle, that Vehicle gains crew 5 in addition to any crew abilities it already
//     had.
//   [2022-02-18] If Swift Reconfiguration becomes attached to a creature that is also an
//     Equipment, that permanent becomes a Vehicle and loses the Equipment subtype. If it is
//     attached to a creature, it becomes unattached from that creature.
//   [2022-02-18] If Swift Reconfiguration becomes attached to a creature that is also a
//     planeswalker, that permanent loses its planeswalker type. Its controller may still activate
//     its loyalty abilities as normal, but it can't be attacked and damage dealt to it doesn't
//     remove loyalty counters.

export default defineCard({
  name: "Swift Reconfiguration",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature or Vehicle\nEnchanted permanent is a Vehicle artifact with crew 5 and it loses all other card types. (It's not a creature unless it's crewed.)",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  static: [
    {
      // Layer 4: an artifact and nothing else (rule 205.1a — its creature
      // types go with the creature type), its artifact types replaced by
      // Vehicle (an Equipment stops being one — the ruling). It keeps its
      // abilities and gains crew 5 beside any crew it had; crewing it makes
      // it an artifact creature again until end of turn, a later effect. One
      // that was attacking or blocking is removed from combat (rule 506.4).
      affects: { scope: "attached" },
      setTypes: ["artifact"],
      setSubtypes: ["Vehicle"],
      grantsActivated: [crew(5)],
      text: "Enchanted permanent is a Vehicle artifact with crew 5 and it loses all other card types.",
    },
  ],
});
