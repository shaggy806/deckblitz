import { defineCard } from "../define.js";

// EDHREC rank 21382.

export default defineCard({
  name: "Fortified Area",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Wall creatures you control get +1/+0 and have banding. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Wall", controlledBy: "you" } },
      grantPt: [1, 0],
      grantKeywords: ["banding"],
      text: "Wall creatures you control get +1/+0 and have banding.",
    },
  ],
});
