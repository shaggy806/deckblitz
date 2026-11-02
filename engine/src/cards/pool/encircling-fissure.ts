import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { awaken } from "../helpers.js";

// `as-player` so the filter's "you" is the target opponent. A prevention effect
// locks in no set of creatures, so one that enters later this turn is covered.

const TARGETS: readonly TargetSpec[] = ["opponent"];
const EFFECT: EffectSpec = {
  kind: "as-player",
  who: { target: 0 },
  effect: { kind: "damage-rule", by: { filter: { type: "creature", controlledBy: "you" } }, combat: true },
};

export default defineCard({
  name: "Encircling Fissure",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn by creatures target opponent controls.\nAwaken 2—{4}{W} (If you cast this spell for {4}{W}, also put two +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(2, "{4}{W}", { targets: TARGETS, effect: EFFECT }),
});
