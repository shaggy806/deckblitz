import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 29393. Bloodghast's condition.
const TEXT = "This creature gets +2/+1 as long as an opponent has 10 or less life.";

export default defineCard({
  name: "Ruthless Cullblade",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", who: "opponent", atMost: 10 },
      grantPt: [2, 1],
      text: TEXT,
    },
  ],
});
