import { defineCard } from "../define.js";

// A playtest card (Mystery Booster). "All Slivers" — every player's (rule
// 702.22's banding lives in combat/banding.ts).

export default defineCard({
  name: "Banding Sliver",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: "All Slivers have banding. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantKeywords: ["banding"],
      text: "All Slivers have banding.",
    },
  ],
});
