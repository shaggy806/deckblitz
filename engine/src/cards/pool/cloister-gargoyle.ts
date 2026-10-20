import { defineCard } from "../define.js";

// EDHREC rank 14201.
//
// Rulings:
//   [2021-07-23] Cloister Gargoyle's last ability works even if it wasn't on the battlefield when
//     you completed a dungeon.

const VENTURE_TEXT = "When this creature enters, venture into the dungeon. (Enter the first room or advance to the next room.)";
const COMPLETED_TEXT = "As long as you've completed a dungeon, this creature gets +3/+0 and has flying.";

export default defineCard({
  name: "Cloister Gargoyle",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 0,
  toughness: 4,
  text: `${VENTURE_TEXT}\n${COMPLETED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: VENTURE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "completed-dungeon" },
      grantPt: [3, 0],
      grantKeywords: ["flying"],
      text: COMPLETED_TEXT,
    },
  ],
});
