import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 22865.
const TARGETS: TargetSpec[] = ["creature"];
const EFFECT: EffectSpec = { kind: "tap", target: 0, doesntUntapNext: true };

export default defineCard({
  name: "Rush of Ice",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap target creature. It doesn't untap during its controller's next untap step.\nAwaken 3—{4}{U} (If you cast this spell for {4}{U}, also put three +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(3, "{4}{U}", { targets: TARGETS, effect: EFFECT }),
});
