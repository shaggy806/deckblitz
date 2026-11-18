import { CHOSEN_COLOR } from "../../effects.js";
import type { StaticAbility } from "../define.js";
import { defineCard } from "../define.js";

// EDHREC rank 14828.
//
// - The color is chosen as it becomes attached to a creature, however it
//   does (equipped, or attached by another effect), by its controller, and
//   kept on it (Psychic Paper's `asBecomesAttached`); each attaching chooses
//   again, and the last chosen stands. Equipping it to the creature it's
//   already attached to doesn't attach it, so no new color (rule 701.3b; the
//   ruling).
// - Attached with no color chosen yet, it grants no protection — not from
//   colorless (the ruling): one protection static per color, each applying
//   only while that color is the last chosen.

const AS_ATTACHED_TEXT = "As this Equipment becomes attached to a creature, choose a color.";
const STATIC_TEXT = "Equipped creature gets +2/+0 and has protection from the last chosen color.";

const COLORS = ["W", "U", "B", "R", "G"] as const;
const protections: StaticAbility[] = COLORS.map((color) => ({
  affects: { scope: "attached" },
  condition: { kind: "chosen-on-enter", value: color },
  protection: { colors: [color] },
  text: STATIC_TEXT,
}));

export default defineCard({
  name: "Sanctuary Blade",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${AS_ATTACHED_TEXT}\n${STATIC_TEXT}\nEquip {3}`,
  asBecomesAttached: {
    effect: { kind: "choose-value", value: "color", then: { kind: "note", word: CHOSEN_COLOR } },
  },
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: STATIC_TEXT }, ...protections],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
