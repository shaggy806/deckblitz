import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 27753.
//
// One ability with two trigger events (`sameAbilityAs`, Cockatrice's shape):
// "blocks a creature" (`object: "blocked"`, the blocked creature the trigger
// object) and "becomes blocked by a creature", once per blocker. Each phases
// in during its own controller's next untap step (rule 502.1).
const PHASE = {
  kind: "sequence",
  effects: [
    { kind: "phase-out", target: "source" },
    { kind: "phase-out", target: "trigger-object" },
  ],
} as const;

const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, this creature and that creature phase out. (While they're phased out, they're treated as though they don't exist. Each one phases in before its controller untaps during their next untap step.)";

export default defineCard({
  name: "Dream Fighter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: PHASE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: PHASE,
      resolve: null,
      text: TEXT,
    },
  ],
});
