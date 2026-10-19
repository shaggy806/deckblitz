import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";
import type { TriggeredAbility } from "../../abilities.js";

// X, "the greatest power and/or toughness among other creatures you
// control", is the larger of the greatest power and the greatest toughness
// among them, read as the ability resolves. There's no max-of-two amount, so
// it's written as max(a, b) = (a + b + |a − b|) / 2 — exact, since the sum is
// always even. Each aggregate is clamped at 0, which can't lower the answer:
// a creature on the battlefield has toughness 1 or more.
const OTHERS = { type: "creature", controlledBy: "you" } as const;
const MAX_POWER: EffectAmount = { aggregate: "max", of: "power", filter: OTHERS, excludeSelf: true };
const MAX_TOUGHNESS: EffectAmount = { aggregate: "max", of: "toughness", filter: OTHERS, excludeSelf: true };
const X: EffectAmount = {
  half: { sum: [MAX_POWER, MAX_TOUGHNESS, { difference: [MAX_POWER, MAX_TOUGHNESS], absolute: true }] },
  round: "down",
};

const TEXT =
  "Whenever this creature attacks or blocks, it gets +X/+X until end of turn, where X is the greatest power and/or toughness among other creatures you control.";

const ability = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: { kind: "modify-pt", target: "source", power: X, toughness: X, duration: "end-of-turn" },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Freelance Muscle",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [ability("attacks"), ability("blocks")],
});
