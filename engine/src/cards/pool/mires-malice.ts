import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 29145.
const TARGETS: TargetSpec[] = ["opponent"];
const EFFECT: EffectSpec = { kind: "discard", target: 0, amount: 2 };

export default defineCard({
  name: "Mire's Malice",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards.\nAwaken 3—{5}{B} (If you cast this spell for {5}{B}, also put three +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(3, "{5}{B}", { targets: TARGETS, effect: EFFECT }),
});
