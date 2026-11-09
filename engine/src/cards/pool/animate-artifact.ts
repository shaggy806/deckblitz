import { defineCard } from "../define.js";

// March of the Machines' "noncreature artifact" reading for the one enchanted
// artifact: an artifact that's already a creature isn't changed (the ruling).
const TEXT = "As long as enchanted artifact isn't a creature, it's an artifact creature with power and toughness each equal to its mana value.";

export default defineCard({
  name: "Animate Artifact",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${TEXT}`,
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "filter", filter: { hostOfSource: true, type: "artifact", notTypes: ["creature"] } },
      addTypes: ["creature"],
      setBasePt: { power: "its-mana-value", toughness: "its-mana-value" },
      text: TEXT,
    },
  ],
});
