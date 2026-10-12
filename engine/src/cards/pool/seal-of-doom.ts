import { defineCard } from "../define.js";

export default defineCard({
  name: "Seal of Doom",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Sacrifice this enchantment: Destroy target nonblack creature. It can't be regenerated.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "Sacrifice this enchantment: Destroy target nonblack creature. It can't be regenerated.",
    },
  ],
});
