import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 25851.
const TARGETS: TargetSpec[] = [{ kind: "permanent", filter: { tapped: true, type: "creature" } }];
const EFFECT: EffectSpec = { kind: "destroy", target: 0 };

export default defineCard({
  name: "Sheer Drop",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target tapped creature.\nAwaken 3—{5}{W} (If you cast this spell for {5}{W}, also put three +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(3, "{5}{W}", { targets: TARGETS, effect: EFFECT }),
});
