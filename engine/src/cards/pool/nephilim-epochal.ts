import { defineCard } from "../define.js";

// Mystery Booster Commander. Each Nephilim counts the others (Sliver
// Legion's `relativeToAffected`); "monocolored" is one color exactly.
const SEARCH =
  "When Nephilim Epochal enters, search your library for a Nephilim card, reveal it, put it into your hand, then shuffle.";
const LORD =
  "Nephilim you control get +1/+1 for each other Nephilim you control and can't be blocked by monocolored creatures.";

export default defineCard({
  name: "Nephilim Epochal",
  manaCost: "{U/R}{R/G}{G/W}{W/B}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Nephilim"],
  power: 4,
  toughness: 4,
  text: `${SEARCH}\n${LORD}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Nephilim" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: SEARCH,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Nephilim" },
      grantPtPerCount: {
        filter: { subtype: "Nephilim", controlledBy: "you" },
        relativeToAffected: true,
        excludeSelf: true,
        pt: [1, 1],
      },
      restrictions: [{ kind: "cant-be-blocked", by: { type: "creature", colorless: false, multicolored: false } }],
      text: LORD,
    },
  ],
});
