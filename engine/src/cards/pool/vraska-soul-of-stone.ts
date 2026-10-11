import { defineCard } from "../define.js";

// EDHREC rank 12970.
// Makes Sculpture Treasure → "Sculpture Treasure Token".
//
// Rulings:
//   [2026-08-21] Sculpture is a creature type. Treasure is an artifact type.
//   [2026-08-21] Vraska's last ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.

const VIGILANCE_TEXT = "Artifact creatures you control have vigilance.";
const CAST_TEXT =
  "Whenever you cast a noncreature spell, create a 1/1 colorless Sculpture Treasure artifact creature token with \"{T}, Sacrifice this token: Add one mana of any color.\"";

export default defineCard({
  name: "Vraska, Soul of Stone",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${VIGILANCE_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Sculpture Treasure Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
