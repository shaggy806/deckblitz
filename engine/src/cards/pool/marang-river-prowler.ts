import { defineCard } from "../define.js";

// Gravecrawler's permission: checked as you begin to cast it (the ruling).

const CAST_TEXT = "You may cast this card from your graveyard as long as you control a black or green permanent.";

export default defineCard({
  name: "Marang River Prowler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  text: `This creature can't block and can't be blocked.\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      grantKeywords: ["unblockable"],
      text: "This creature can't block and can't be blocked.",
    },
  ],
  castFromGraveyardIf: {
    kind: "controls",
    filter: { anyOf: [{ colors: ["B"] }, { colors: ["G"] }] },
    atLeast: 1,
  },
});
