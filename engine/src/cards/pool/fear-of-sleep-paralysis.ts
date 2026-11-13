import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// - "This creature or another enchantment you control" is any enchantment
//   you control entering: this creature is one.
// - The static is a `lose-counters` prohibition: an opponent's stunned
//   permanent that would untap doesn't, and the stun counter stays (its
//   ruling); a stun counter can't be moved off one either.

const EERIE =
  "Eerie — Whenever this creature or another enchantment you control enters and whenever you fully unlock a Room, tap up to one target creature and put a stun counter on it.";
const LOCK = "Stun counters can't be removed from permanents your opponents control.";

const STUN: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "tap", target: 0 },
    { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
  ],
};
const UP_TO_ONE: readonly TargetSpec[] = [{ kind: "optional", of: "creature" }];

export default defineCard({
  name: "Fear of Sleep Paralysis",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${EERIE}\n${LOCK} (They won't untap if they have stun counters.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: UP_TO_ONE,
      effect: STUN,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: UP_TO_ONE,
      effect: STUN,
      resolve: null,
      text: EERIE,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "lose-counters", kind: "stun", object: { controlledBy: "opponent" } }],
      text: LOCK,
    },
  ],
});
