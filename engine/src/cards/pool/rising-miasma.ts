import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 28794.
const TARGETS: TargetSpec[] = [];
const EFFECT: EffectSpec = {
  kind: "modify-pt-all",
  filter: { type: "creature" },
  power: -2,
  toughness: -2,
  duration: "end-of-turn",
};

export default defineCard({
  name: "Rising Miasma",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -2/-2 until end of turn.\nAwaken 3—{5}{B}{B} (If you cast this spell for {5}{B}{B}, also put three +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(3, "{5}{B}{B}", { targets: TARGETS, effect: EFFECT }),
});
