import { defineCard } from "../define.js";

// EDHREC rank 16033.
//
// Platypus-Bear's "can attack as though it didn't have defender" static, on a
// counter of any kind being on it (a `source` condition — `counters` with no
// `kind` counts every kind).

const ATTACK_TEXT = "As long as this creature has a counter on it, it can attack as though it didn't have defender.";
const GROW_TEXT = "{5}{B}: Put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Demon Wall",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Demon", "Wall"],
  power: 3,
  toughness: 3,
  keywords: ["defender", "menace"],
  text: `Defender\nMenace (This creature can't be blocked except by two or more creatures.)\n${ATTACK_TEXT}\n${GROW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { compare: { op: "gte", n: 1 } } } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{B}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
