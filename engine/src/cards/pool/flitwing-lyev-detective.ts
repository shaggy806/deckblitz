import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. "You may create that many Clue tokens
// instead": a may-replacement of the whole creation (614.1a), the count
// carried over as `x` — Moonlit Meditation's shape, with Clues for the copies.
const REPLACE_TEXT =
  'If you would create one or more tokens, you may create that many Clue tokens instead. (They\'re artifacts with "{2}, Sacrifice this token: Draw a card.")';

export default defineCard({
  name: "Flitwing, Lyev Detective",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Faerie", "Detective"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${REPLACE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        may: true,
        becomes: {
          effect: { kind: "create-token", token: "Clue Token", count: "x" },
          text: "Create that many Clue tokens",
        },
      },
      text: REPLACE_TEXT,
    },
  ],
});
