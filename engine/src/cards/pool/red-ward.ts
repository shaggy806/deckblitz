import { defineCard } from "../define.js";

// EDHREC rank 24851.
// "This effect doesn't remove this Aura" never matters here: Red Ward is
// white, so protection from red can't make it fall off (rule 702.16d).

export default defineCard({
  name: "Red Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has protection from red. This effect doesn't remove this Aura.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { colors: ["R"] },
      text: "Enchanted creature has protection from red. This effect doesn't remove this Aura.",
    },
  ],
});
