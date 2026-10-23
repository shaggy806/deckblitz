import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 8451.
const TARGETS: TargetSpec[] = [];
const EFFECT: EffectSpec = { kind: "take-extra-turn" };

export default defineCard({
  name: "Part the Waterveil",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  exileOnResolve: true,
  text: "Take an extra turn after this one. Exile Part the Waterveil.\nAwaken 6—{6}{U}{U}{U} (If you cast this spell for {6}{U}{U}{U}, also put six +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(6, "{6}{U}{U}{U}", { targets: TARGETS, effect: EFFECT }),
});
