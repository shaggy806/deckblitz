import { defineCard } from "../define.js";
import { STORIED_TEXT } from "../helpers.js";

const STORY_TEXT = "As long as you have an enduring story, Ori gets +1/+0 and has vigilance.";

export default defineCard({
  name: "Ori, Keeper of Songs",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 3,
  toughness: 3,
  keywords: ["storied"],
  text: `${STORIED_TEXT}\n${STORY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "enduring-story" },
      grantPt: [1, 0],
      grantKeywords: ["vigilance"],
      text: STORY_TEXT,
    },
  ],
});
