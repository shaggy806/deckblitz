import { defineCard } from "../define.js";

// EDHREC rank 23388.
// "This effect doesn't remove this Aura" never matters here: Black Ward is
// white, so protection from black can't make it fall off (rule 702.16d).

export default defineCard({
  name: "Black Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has protection from black. This effect doesn't remove this Aura.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { colors: ["B"] },
      text: "Enchanted creature has protection from black. This effect doesn't remove this Aura.",
    },
  ],
});
