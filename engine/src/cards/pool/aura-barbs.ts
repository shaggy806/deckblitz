import { defineCard } from "../define.js";

// Dealt by the enchantments, not by Aura Barbs (its ruling).
export default defineCard({
  name: "Aura Barbs",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Each enchantment deals 2 damage to its controller, then each Aura attached to a creature deals 2 damage to the creature it's attached to.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "creatures-damage-controllers", filter: { type: "enchantment" }, amount: 2 },
      { kind: "each-deals-damage", filter: { subtype: "Aura", attachedTo: { type: "creature" } }, amount: 2, to: "host" },
    ],
  },
});
