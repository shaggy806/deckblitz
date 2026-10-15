import { defineCard } from "../define.js";

const BASE_TEXT = "As long as there are eight or more cards in your graveyard, Doc Ock has base power and toughness 8/8.";
const HEXPROOF_TEXT =
  "As long as you control another Villain, Doc Ock has hexproof. (He can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "Doc Ock, Sinister Scientist",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 4,
  toughness: 5,
  text: `${BASE_TEXT}\n${HEXPROOF_TEXT}`,
  static: [
    {
      // Layer 7b: counters and pumps still apply on top of the 8/8.
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 8 },
      setBasePt: { power: 8, toughness: 8 },
      text: BASE_TEXT,
    },
    {
      // A static's `controls` leaves Doc Ock himself out: "another Villain".
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Villain" }, atLeast: 1 },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
});
