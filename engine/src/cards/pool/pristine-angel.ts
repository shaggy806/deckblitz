import { defineCard } from "../define.js";

// EDHREC rank 19350. "Protection from each color" is protection from each of
// the five (Etched Champion's shape), white included.

const PROTECTION_TEXT = "As long as this creature is untapped, it has protection from artifacts and from each color.";

export default defineCard({
  name: "Pristine Angel",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${PROTECTION_TEXT}\nWhenever you cast a spell, you may untap this creature.`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      protection: { colors: ["W", "U", "B", "R", "G"], types: ["artifact"] },
      text: PROTECTION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Pristine Angel?",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: "Whenever you cast a spell, you may untap this creature.",
    },
  ],
});
