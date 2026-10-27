import type { StaticAbility } from "../define.js";
import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 9813.
//
// "Protection from the chosen color": one protection static per colour over
// every Sliver on the battlefield, each player's, each applying only while
// that colour is the one chosen as this entered (`chosen-on-enter`) — the
// Order of the Stars shape with a Sliver filter.

const COLORS = ["W", "U", "B", "R", "G"] as const;
const TEXT = "All Slivers have protection from the chosen color.";

const statics: StaticAbility[] = COLORS.map((color) => ({
  affects: { scope: "filter", filter: { subtype: "Sliver" } },
  condition: { kind: "chosen-on-enter", value: color },
  protection: { colors: [color] },
  text: TEXT,
}));

export default defineCard({
  name: "Ward Sliver",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `As this creature enters, choose a color.\n${TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: statics,
});
