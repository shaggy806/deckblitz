import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";
import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";

// Mystery Booster Commander. One optional slot per opponent seat (Vronos's
// shape); each creature chosen gets the counter and the upkeep trigger, the
// trigger lasting for as long as that creature has an odor counter on it —
// Olinda leaving changes nothing (the reminder text).
const TEXT =
  "Whenever Olinda enters or attacks, for each opponent, put an odor counter on up to one target creature that player controls without an odor counter on it. Each of those creatures has \"At the beginning of your upkeep, you lose 2 life\" for as long as it has an odor counter on it. (They continue to smell after Olinda has left the battlefield.)";

const SMELL: TriggeredAbility = {
  trigger: { on: "step-begins", step: "upkeep", who: "you" },
  targets: [],
  effect: { kind: "lose-life", amount: 2 },
  resolve: null,
  text: "At the beginning of your upkeep, you lose 2 life.",
};

const slot = (seat: 1 | 2 | 3): TargetSpec => ({
  kind: "optional",
  of: {
    kind: "permanent",
    whose: { seat },
    filter: { type: "creature", counters: { kind: "odor", compare: { op: "lte", n: 0 } } },
  },
});

const mark = (i: number): EffectSpec[] => [
  { kind: "add-counter", target: i, counter: "odor", amount: 1 },
  { kind: "grant-triggered", target: i, ability: SMELL, duration: { whileCounter: "odor" } },
];

const EFFECT: EffectSpec = { kind: "sequence", effects: [...mark(0), ...mark(1), ...mark(2)] };
const TARGETS: TargetSpec[] = [slot(1), slot(2), slot(3)];

export default defineCard({
  name: "Olinda the Oblivious",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skunk", "Rogue"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: TARGETS, effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: TARGETS, effect: EFFECT, resolve: null, text: TEXT },
  ],
});
