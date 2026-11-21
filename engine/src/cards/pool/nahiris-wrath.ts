import { defineCard } from "../define.js";

// EDHREC rank 18000.
//
// X is announced as it's cast (rule 601.2b) and that many cards discarded
// for the cost; the damage is the discarded cards' total mana value, each in
// whatever zone the discard put it (the ruling: madness's exile too, {X} as
// 0), the same to each target, not divided. A copy reads the original's
// discards (rule 707.10).

const TEXT =
  "Nahiri's Wrath deals damage equal to the total mana value of the discarded cards to each of up to X target creatures and/or planeswalkers.";

export default defineCard({
  name: "Nahiri's Wrath",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `As an additional cost to cast this spell, discard X cards.\n${TEXT}`,
  additionalCost: { discard: "x" },
  targets: [{ kind: "any-number", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }, max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: {
      kind: "damage",
      target: 0,
      amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { paid: "discarded" } },
    },
  },
});
