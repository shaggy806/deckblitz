import type { StaticAbility } from "../define.js";
import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 25292.
//
// "Protection from the chosen color": one protection static per colour, each
// applying only while that colour is the one chosen as it entered
// (`chosen-on-enter`), so exactly one applies — none with no colour chosen.

const COLORS = ["W", "U", "B", "R", "G"] as const;
const TEXT = "This creature has protection from the chosen color.";

const statics: StaticAbility[] = COLORS.map((color) => ({
  affects: { scope: "self" },
  condition: { kind: "chosen-on-enter", value: color },
  protection: { colors: [color] },
  text: TEXT,
}));

export default defineCard({
  name: "Order of the Stars",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 0,
  toughness: 1,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\nAs this creature enters, choose a color.\n${TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: statics,
});
