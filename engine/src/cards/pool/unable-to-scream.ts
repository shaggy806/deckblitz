import { defineCard } from "../define.js";

const TOY_TEXT =
  "Enchanted creature loses all abilities and is a Toy artifact creature with base power and toughness 0/2 in addition to its other types.";
const FACE_UP_TEXT = "As long as enchanted creature is face down, it can't be turned face up.";

// Only a face-down permanent can be turned face up, so "as long as it's face
// down, it can't be turned face up" is the `cant-turn-face-up` restriction on
// enchanted creature: none of the special actions (rules 701.40b, 701.58b,
// 702.37e, 702.168d) may turn it.

export default defineCard({
  name: "Unable to Scream",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TOY_TEXT}\n${FACE_UP_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      addTypes: ["artifact", "creature"],
      addSubtypes: ["Toy"],
      setBasePt: { power: 0, toughness: 2 },
      text: TOY_TEXT,
    },
    {
      affects: { scope: "attached" },
      restrictions: ["cant-turn-face-up"],
      text: FACE_UP_TEXT,
    },
  ],
});
