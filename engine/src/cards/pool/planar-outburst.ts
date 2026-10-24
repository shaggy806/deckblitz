import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 10368.
const TARGETS: TargetSpec[] = [];
const EFFECT: EffectSpec = { kind: "destroy-all", filter: { type: "creature", notTypes: ["land"] } };

export default defineCard({
  name: "Planar Outburst",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all nonland creatures.\nAwaken 4—{5}{W}{W}{W} (If you cast this spell for {5}{W}{W}{W}, also put four +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(4, "{5}{W}{W}{W}", { targets: TARGETS, effect: EFFECT }),
});
