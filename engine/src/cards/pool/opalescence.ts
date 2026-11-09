import { defineCard } from "../define.js";

const TEXT =
  "Each other non-Aura enchantment is a creature in addition to its other types and has base power and base toughness each equal to its mana value.";

export default defineCard({
  name: "Opalescence",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "enchantment", notSubtypes: ["Aura"] }, excludeSelf: true },
      addTypes: ["creature"],
      setBasePt: { power: "its-mana-value", toughness: "its-mana-value" },
      text: TEXT,
    },
  ],
});
