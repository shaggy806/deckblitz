import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. "You may create that many Clue tokens
// instead": asked as the tokens would be created (614.1a), and the effect
// still makes them, as Clues — Jinnie Fay's shape, so what it says of its
// tokens besides what they are (tapped, exiled at end of combat) still holds.
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
        mayTokensInsteadOneOf: [{ token: "Clue Token", text: "Create that many Clue tokens instead" }],
      },
      text: REPLACE_TEXT,
    },
  ],
});
