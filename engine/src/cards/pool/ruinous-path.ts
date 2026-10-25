import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 17625.
const TARGETS: TargetSpec[] = [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }];
const EFFECT: EffectSpec = { kind: "destroy", target: 0 };

export default defineCard({
  name: "Ruinous Path",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature or planeswalker.\nAwaken 4—{5}{B}{B} (If you cast this spell for {5}{B}{B}, also put four +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(4, "{5}{B}{B}", { targets: TARGETS, effect: EFFECT }),
});
