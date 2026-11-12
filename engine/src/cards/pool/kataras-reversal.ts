import { defineCard } from "../define.js";

// EDHREC rank 11632. Four optional, distinct spell-or-ability slots (Disallow's
// one slot), countered together; then an "up to four" group of artifacts and
// creatures (a group must be the last slot of its list).

const STACK = { kind: "stack", spells: "any", abilities: true } as const;
const other = (slots: readonly number[]) =>
  ({ kind: "optional", of: { kind: "other", of: STACK, than: { slots } } }) as const;

export default defineCard({
  name: "Katara's Reversal",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter up to four target spells and/or abilities.\nUntap up to four target artifacts and/or creatures.",
  targets: [
    { kind: "optional", of: STACK },
    other([0]),
    other([0, 1]),
    other([0, 1, 2]),
    { kind: "any-number", of: "artifact-or-creature", max: 4 },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "counter", target: 0 },
          { kind: "counter", target: 1 },
          { kind: "counter", target: 2 },
          { kind: "counter", target: 3 },
        ],
      },
      { kind: "for-each-target", from: 4, effect: { kind: "untap", target: 4 } },
    ],
  },
});
