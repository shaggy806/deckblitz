import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 22040.
const TARGETS: TargetSpec[] = ["permanent"];
const EFFECT: EffectSpec = { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 };

export default defineCard({
  name: "Earthen Arms",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put two +1/+1 counters on target permanent.\nAwaken 4—{6}{G} (If you cast this spell for {6}{G}, also put four +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(4, "{6}{G}", { targets: TARGETS, effect: EFFECT }),
});
