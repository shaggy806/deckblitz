import { defineCard } from "../define.js";
import type { Color } from "../../mana.js";

// EDHREC rank 28901.
// One protection per colour, each live while you control a permanent of that
// colour — this creature included (`countsSelf`), so it always has protection
// from white unless its colour changes.

const TEXT = "This creature has protection from each color among permanents you control.";
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];

export default defineCard({
  name: "Empty-Shrine Kannushi",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: COLORS.map((color) => ({
    affects: { scope: "self" } as const,
    condition: { kind: "controls", filter: { colors: [color] }, atLeast: 1, countsSelf: true } as const,
    protection: { colors: [color] },
    text: TEXT,
  })),
});
