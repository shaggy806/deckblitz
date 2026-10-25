import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 17192.
const TARGETS: TargetSpec[] = ["spell"];
const EFFECT: EffectSpec = { kind: "counter", target: 0 };

export default defineCard({
  name: "Scatter to the Winds",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell.\nAwaken 3—{4}{U}{U} (If you cast this spell for {4}{U}{U}, also put three +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(3, "{4}{U}{U}", { targets: TARGETS, effect: EFFECT }),
});
