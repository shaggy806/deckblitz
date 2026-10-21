import { defineCard } from "../define.js";

// EDHREC rank 30148.
//
// Rulings:
//   [2004-10-04] The term "enchanted creatures" means "creatures with an Aura on them".
//
// Argothian Pixies' shape, with the source filter "a creature with an Aura
// attached" (rule 303.4), asked as the damage would be dealt.
const PREVENT_TEXT = "Prevent all damage that would be dealt to this creature by enchanted creatures.";

export default defineCard({
  name: "Wall of Putrid Flesh",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 2,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\nProtection from white\n${PREVENT_TEXT}`,
  static: [
    { affects: { scope: "self" }, protection: { colors: ["W"] }, text: "Protection from white" },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        to: "self",
        source: { type: "creature", enchanted: true },
      },
      text: PREVENT_TEXT,
    },
  ],
});
