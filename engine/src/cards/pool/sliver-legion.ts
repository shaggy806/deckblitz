import { defineCard } from "../define.js";

// EDHREC rank 4679. "Other" is other than each Sliver it affects, so Sliver
// Legion counts itself for every other Sliver.
export default defineCard({
  name: "Sliver Legion",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Sliver"],
  power: 7,
  toughness: 7,
  text: "All Sliver creatures get +1/+1 for each other Sliver on the battlefield.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantPtPerCount: { filter: { subtype: "Sliver" }, relativeToAffected: true, excludeSelf: true, pt: [1, 1] },
      text: "All Sliver creatures get +1/+1 for each other Sliver on the battlefield.",
    },
  ],
});
