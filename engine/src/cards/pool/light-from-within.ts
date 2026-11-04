import { defineCard } from "../define.js";

const TEXT = "Chroma — Each creature you control gets +1/+1 for each white mana symbol in its mana cost.";

// Each creature by its own cost (the ruling's {W/B}x5 gets +5/+5).
export default defineCard({
  name: "Light from Within",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPtPerCount: { ofAffected: { manaSymbols: "W" }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
