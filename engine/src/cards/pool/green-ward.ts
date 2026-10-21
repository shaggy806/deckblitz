import { defineCard } from "../define.js";

// EDHREC rank 25024. "This effect doesn't remove this Aura" never matters
// here: Green Ward is white, so protection from green can't knock it off
// (rule 702.16c) — a plain protection Aura (Unquestioned Authority's shape).

const STATIC_TEXT = "Enchanted creature has protection from green. This effect doesn't remove this Aura.";

export default defineCard({
  name: "Green Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { colors: ["G"] },
      text: STATIC_TEXT,
    },
  ],
});
