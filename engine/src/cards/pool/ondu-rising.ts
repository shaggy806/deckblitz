import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { awaken } from "../helpers.js";

// EDHREC rank 24416.
const TARGETS: TargetSpec[] = [];
const EFFECT: EffectSpec = {
  kind: "delayed-trigger",
  at: { whenever: { on: "attacks", who: "any", filter: { type: "creature" } } },
  effect: {
    kind: "grant-keyword",
    target: "trigger-object",
    keyword: "lifelink",
    duration: "end-of-turn",
  },
  text: "Whenever a creature attacks this turn, it gains lifelink until end of turn.",
};

export default defineCard({
  name: "Ondu Rising",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Whenever a creature attacks this turn, it gains lifelink until end of turn.\nAwaken 4—{4}{W} (If you cast this spell for {4}{W}, also put four +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
  targets: TARGETS,
  effect: EFFECT,
  overload: awaken(4, "{4}{W}", { targets: TARGETS, effect: EFFECT }),
});
