import { defineCard } from "../define.js";
import type { Color } from "../../mana.js";
import type { TargetSpec } from "../../target.js";

// EDHREC rank 17041. Fifth Dawn.
//
// Rogues' Gallery's shape without its creature clause: five optional slots,
// one per color, each "other than" the ones before it, so one multicolored
// card fills only one of them (the ruling: two blue-and-white cards may be
// the blue one and the white one). A card no longer of its slot's color as
// this resolves is an illegal target (the ruling). The cards return together.

const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];
const SLOTS: TargetSpec[] = COLORS.map((color, i) => {
  const spec: TargetSpec = { kind: "card-in-graveyard", whose: "you", filter: { colors: [color] } };
  const earlier = Array.from({ length: i }, (_, j) => j);
  return { kind: "optional", of: i === 0 ? spec : { kind: "other", of: spec, than: { slots: earlier } } };
});

export default defineCard({
  name: "All Suns' Dawn",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "For each color, return up to one target card of that color from your graveyard to your hand. Exile All Suns' Dawn.",
  targets: SLOTS,
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: COLORS.map((_, i) => ({ kind: "return-to-hand", target: i, from: "graveyard" }) as const),
  },
  exileOnResolve: true,
});
