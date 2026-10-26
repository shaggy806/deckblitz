import { defineCard } from "../define.js";

// EDHREC rank 27242.
//
// Rulings:
//   [2005-08-01] It can only target “Enchantment - Aura” cards, which includes cards changed into
//     Auras, such as Licids.

const TEXT = "{T}: Destroy target Aura attached to a creature.";

export default defineCard({
  name: "Devout Harpist",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Aura", attachedTo: { type: "creature" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
