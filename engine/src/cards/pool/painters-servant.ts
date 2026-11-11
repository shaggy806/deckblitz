import type { Color } from "../../mana.js";
import { defineCard, type StaticAbility } from "../define.js";

// Rulings:
//   This ability doesn't overwrite any previous colors. Rather, it adds another color.
//   This ability affects every card in every game zone, all tokens on the battlefield, and all
//     spell copies on the stack, regardless of who controls or owns them.
//   If something affected by Painter's Servant is normally colorless, it will simply be the new color.
//   The effects of multiple Painter's Servants are cumulative.

// One layer-5 static per colour, each live only for the colour chosen as it
// entered (rule 614.1c), as Shifting Sky's: permanents, and every card and
// spell anywhere else (Mycosynth Lattice's reach), gain that colour.
const TEXT =
  "All cards that aren't on the battlefield, spells, and permanents are the chosen color in addition to their other colors.";
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];

const STATICS: StaticAbility[] = COLORS.map((color) => ({
  affects: { scope: "filter", filter: {} },
  condition: { kind: "chosen-on-enter", value: color },
  addColors: [color],
  outsideBattlefield: { whose: "all", addColors: [color] },
  text: TEXT,
}));

export default defineCard({
  name: "Painter's Servant",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 1,
  toughness: 3,
  chooseOnEnter: COLORS,
  text: `As this creature enters, choose a color.\n${TEXT}`,
  static: STATICS,
});
