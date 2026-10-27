import type { StaticAbility } from "../define.js";
import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 20565.
//
// Order of the Stars' shape: one protection static per colour, each applying
// only while that colour is the one chosen as it entered.

const COLORS = ["W", "U", "B", "R", "G"] as const;
const TEXT = "This creature has protection from the chosen color.";

const statics: StaticAbility[] = COLORS.map((color) => ({
  affects: { scope: "self" },
  condition: { kind: "chosen-on-enter", value: color },
  protection: { colors: [color] },
  text: TEXT,
}));

export default defineCard({
  name: "Voice of All",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\nAs this creature enters, choose a color.\n${TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: statics,
});
