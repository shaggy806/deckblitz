import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 26598.
const TARGETS: TargetSpec[] = ["creature"];
const EFFECT: EffectSpec = { kind: "put-on-library", target: 0, position: "top" };

export default defineCard({
  name: "Roil Spout",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Put target creature on top of its owner's library.\nAwaken 4—{4}{W}{U} (If you cast this spell for {4}{W}{U}, also put four +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(4, "{4}{W}{U}", { targets: TARGETS, effect: EFFECT }),
});
