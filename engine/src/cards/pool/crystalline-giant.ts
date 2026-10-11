import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";

// Rulings: with all ten kinds on it, the ability triggers and puts nothing on
// it; a kind it has the keyword of some other way (not a counter) can still be
// chosen; the kind is chosen and the counter put on as it resolves. A
// resolution-time `random` modal: each kind is a mode, eligible while there's
// no counter of that kind on it.

const TEXT =
  "At the beginning of combat on your turn, choose a kind of counter at random that this creature doesn't have on it from among flying, first strike, deathtouch, hexproof, lifelink, menace, reach, trample, vigilance, and +1/+1. Put a counter of that kind on this creature.";

const KINDS: readonly [counter: string, label: string][] = [
  ["flying", "Flying"],
  ["first-strike", "First strike"],
  ["deathtouch", "Deathtouch"],
  ["hexproof", "Hexproof"],
  ["lifelink", "Lifelink"],
  ["menace", "Menace"],
  ["reach", "Reach"],
  ["trample", "Trample"],
  ["vigilance", "Vigilance"],
  ["+1/+1", "+1/+1"],
];

const modes: ModeOption[] = KINDS.map(([counter, label]) => ({
  text: `${label} counter`,
  onlyIf: { kind: "self-counters", counter, compare: { op: "eq", n: 0 } },
  effect: { kind: "add-counter", target: "source", counter, amount: 1 },
}));

export default defineCard({
  name: "Crystalline Giant",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "modal", random: true, minModes: 1, maxModes: 1, modes },
      resolve: null,
      text: TEXT,
    },
  ],
});
