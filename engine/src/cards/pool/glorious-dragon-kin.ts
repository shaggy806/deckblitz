import type { StaticAbility } from "../define.js";
import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Ward Sliver's shape: one protection
// static per colour, each live only while that colour is the one chosen as
// this entered. "Artifact creatures and Dragons you control" is an `anyOf`
// over the controller's permanents — itself among them, both ways.

const COLORS = ["W", "U", "B", "R", "G"] as const;
const TEXT = "Artifact creatures and Dragons you control have protection from the chosen color.";

const statics: StaticAbility[] = COLORS.map((color) => ({
  affects: {
    scope: "filter",
    filter: { controlledBy: "you", anyOf: [{ types: ["artifact", "creature"] }, { subtype: "Dragon" }] },
  },
  condition: { kind: "chosen-on-enter", value: color },
  protection: { colors: [color] },
  text: TEXT,
}));

export default defineCard({
  name: "Glorious Dragon-Kin",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\nAs Glorious Dragon-Kin enters the battlefield, choose a color.\n${TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: statics,
});
