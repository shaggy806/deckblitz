import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 22476.
const TARGETS: TargetSpec[] = [];
const EFFECT: EffectSpec = { kind: "draw", amount: 2 };

export default defineCard({
  name: "Coastal Discovery",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw two cards.\nAwaken 4—{5}{U} (If you cast this spell for {5}{U}, also put four +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(4, "{5}{U}", { targets: TARGETS, effect: EFFECT }),
});
