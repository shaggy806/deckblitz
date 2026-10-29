import { defineCard } from "../define.js";

// Unattached, the redirection has nowhere to go and you're dealt the damage
// normally (the ruling).
export default defineCard({
  name: "Pariah's Shield",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "All damage that would be dealt to you is dealt to equipped creature instead.\nEquip {3}",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", redirect: "attached" },
      text: "All damage that would be dealt to you is dealt to equipped creature instead.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
