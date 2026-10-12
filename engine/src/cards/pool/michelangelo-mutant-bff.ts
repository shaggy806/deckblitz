import { defineCard } from "../define.js";

// EDHREC rank 8806.
//
// The block restriction is Challenger Troll's `blockedByAtMostOne` over
// creatures you control with a counter of any kind on them. It's checked as
// blockers are declared: a counter put on a creature after it's blocked
// doesn't undo the block (its ruling). "Enters or attacks" is two triggers.
const BLOCK = "Each creature you control with a counter on it can't be blocked by more than one creature.";
const MUTAGEN =
  "Whenever Michelangelo enters or attacks, create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")";

export default defineCard({
  name: "Michelangelo, Mutant BFF",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 4,
  toughness: 4,
  text: `${BLOCK}\n${MUTAGEN}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
      },
      blockedByAtMostOne: true,
      text: BLOCK,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: MUTAGEN,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: MUTAGEN,
    },
  ],
});
