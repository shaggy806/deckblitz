import { defineCard } from "../define.js";
import { STORIED_TEXT } from "../helpers.js";

const STORY_TEXT = "As long as you have an enduring story, creatures you control get +1/+1.";
const DWARF_TEXT = "Whenever Fíli or another nontoken Dwarf you control enters, create a 2/2 red Dwarf creature token.";

export default defineCard({
  name: "Fíli the Pathfinder",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["storied"],
  text: `${STORIED_TEXT}\n${STORY_TEXT}\n${DWARF_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "enduring-story" },
      grantPt: [1, 1],
      text: STORY_TEXT,
    },
  ],
  triggered: [
    {
      // Fíli is a nontoken Dwarf himself.
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Dwarf", token: false } },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Red Dwarf Token", count: 1 },
      resolve: null,
      text: DWARF_TEXT,
    },
  ],
});
