import type { Color } from "../../mana.js";
import { defineCard, type StaticAbility } from "../define.js";

// One layer-5 static per colour, each live only for the colour chosen as it
// entered (rule 614.1c) — Shifting Sky itself is a nonland permanent too.
const TEXT = "All nonland permanents are the chosen color.";
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];

const STATICS: StaticAbility[] = COLORS.map((color) => ({
  affects: { scope: "filter", filter: { notTypes: ["land"] } },
  condition: { kind: "chosen-on-enter", value: color },
  setColors: [color],
  text: TEXT,
}));

export default defineCard({
  name: "Shifting Sky",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose a color.\n${TEXT}`,
  chooseOnEnter: COLORS,
  static: STATICS,
});
