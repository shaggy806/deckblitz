import { defineCard } from "../define.js";
import type { Color } from "../../mana.js";
import type { TargetSpec } from "../../target.js";

// "For each color, up to one target creature card of that color": five
// optional slots, one per color, each a card of that color. "Target" is one
// word, so one card can't fill two slots (rule 115.3) — a multicolored card
// counts for only one of its colors — hence each slot is "other than" the
// ones before it. The cards return together.
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];
const SLOTS: TargetSpec[] = COLORS.map((color, i) => {
  const spec: TargetSpec = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", colors: [color] } };
  const earlier = Array.from({ length: i }, (_, j) => j);
  return { kind: "optional", of: i === 0 ? spec : { kind: "other", of: spec, than: { slots: earlier } } };
});

export default defineCard({
  name: "Rogues' Gallery",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "For each color, return up to one target creature card of that color from your graveyard to your hand.",
  targets: SLOTS,
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: COLORS.map((_, i) => ({ kind: "return-to-hand", target: i, from: "graveyard" }) as const),
  },
});
