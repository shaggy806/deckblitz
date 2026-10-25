import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 20147.
const TARGETS: TargetSpec[] = ["creature"];
const EFFECT: EffectSpec = { kind: "return-to-hand", target: 0 };

export default defineCard({
  name: "Clutch of Currents",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return target creature to its owner's hand.\nAwaken 3—{4}{U} (If you cast this spell for {4}{U}, also put three +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(3, "{4}{U}", { targets: TARGETS, effect: EFFECT }),
});
