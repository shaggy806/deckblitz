import { defineCard } from "../define.js";

// EDHREC rank 20762. Any spell its controller cast this turn, from anywhere.
const HEXPROOF_TEXT = "This creature has hexproof as long as you haven't cast a spell this turn.";

export default defineCard({
  name: "Stoic Sphinx",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${HEXPROOF_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", atLeast: 0, atMost: 0 },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
});
