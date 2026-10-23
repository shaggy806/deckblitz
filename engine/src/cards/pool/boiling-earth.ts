import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 12111.
const TARGETS: TargetSpec[] = [];
const EFFECT: EffectSpec = { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } };

export default defineCard({
  name: "Boiling Earth",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Boiling Earth deals 1 damage to each creature your opponents control.\nAwaken 4—{6}{R} (If you cast this spell for {6}{R}, also put four +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(4, "{6}{R}", { targets: TARGETS, effect: EFFECT }),
});
