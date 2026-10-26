import { defineCard } from "../define.js";
import { flanking } from "../helpers.js";

// EDHREC rank 12179.

export default defineCard({
  name: "Sidewinder Sliver",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: "All Sliver creatures have flanking. (Whenever a creature without flanking blocks a Sliver, the blocking creature gets -1/-1 until end of turn.)",
  static: [
    {
      // Every player's Slivers. Flanking is a triggered ability (rule
      // 702.25a) and the keyword another creature's flanking asks about:
      // both are granted, as Agility does.
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["flanking"],
      grantsTriggered: [flanking()],
      text: "All Sliver creatures have flanking.",
    },
  ],
});
