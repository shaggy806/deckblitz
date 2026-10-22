import { defineCard } from "../define.js";

// Ice Age. The first strike is a static on the enchanted creature gated on
// both halves at once: the creature it's attached to is blocking, and the
// Aura's controller ("you") controls a snow land.

const FLYING_TEXT = "Enchanted creature has flying.";
const FIRST_STRIKE_TEXT = "Enchanted creature has first strike as long as it's blocking and you control a snow land.";

export default defineCard({
  name: "Snow Devil",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${FLYING_TEXT}\n${FIRST_STRIKE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { attachedTo: { blocking: true } } },
          { kind: "controls", filter: { type: "land", supertype: "snow" }, atLeast: 1 },
        ],
      },
      grantKeywords: ["first-strike"],
      text: FIRST_STRIKE_TEXT,
    },
  ],
});
