import { defineCard } from "../define.js";

// Its layer 4 part reaches each noncreature artifact and keeps that set for
// layer 7b (rule 613.6), so it doesn't switch itself off by making them
// creatures. Equipment that's a creature can't equip (rule 301.5c).
const TEXT =
  "Each noncreature artifact is an artifact creature with power and toughness each equal to its mana value. (Equipment that's a creature can't equip a creature.)";

export default defineCard({
  name: "March of the Machines",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", notTypes: ["creature"] } },
      addTypes: ["creature"],
      setBasePt: { power: "its-mana-value", toughness: "its-mana-value" },
      text: TEXT,
    },
  ],
});
