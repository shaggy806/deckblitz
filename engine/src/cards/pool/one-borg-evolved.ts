import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 21276.

const GRANT_TEXT =
  "Artifact creatures you control have flying, double strike, vigilance, menace, lifelink, and ward {2}.";

export default defineCard({
  name: "One, Borg Evolved",
  manaCost: "{4}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg", "Artificer"],
  power: 3,
  toughness: 3,
  text: GRANT_TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["flying", "double-strike", "vigilance", "menace", "lifelink"],
      grantsTriggered: [ward({ mana: "{2}" })],
      text: GRANT_TEXT,
    },
  ],
});
