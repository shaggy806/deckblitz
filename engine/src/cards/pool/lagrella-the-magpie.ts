import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 14548.
//
// "Any number of other target creatures controlled by different players" is one
// optional slot per seat a game can have — four — each another creature than
// Lagrella and the slots before it, controlled by none of their controllers
// (Chaos Mutation's shape). They're exiled as one event, until Lagrella leaves
// (rule 610.3): nothing at all if it has left already (610.3b).
//
// The last sentence is a delayed triggered ability set up as this resolves (the
// ruling), so it triggers however Lagrella leaves, its abilities lost or not. "This
// way" is the cards coming back as Lagrella leaves (the ruling), each under its
// owner's control (610.3c): only those that enter under yours count. It triggers
// once (rule 603.7b) — with two of yours coming back at once, you choose which
// gets the counters, as it resolves.

const TEXT =
  "When Lagrella enters, exile any number of other target creatures controlled by different players until Lagrella leaves the battlefield. When an exiled card enters under your control this way, put two +1/+1 counters on it.";

const slot = (before: readonly number[]): TargetSpec => {
  const other: TargetSpec = { kind: "other", of: "creature", than: "source" };
  return before.length === 0
    ? { kind: "optional", of: other }
    : { kind: "optional", of: { kind: "other", of: other, than: { slots: before }, differentController: true } };
};

export default defineCard({
  name: "Lagrella, the Magpie",
  manaCost: "{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [slot([]), slot([0]), slot([0, 1]), slot([0, 1, 2])],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "exile", target: 0, untilSourceLeaves: true },
              { kind: "exile", target: 1, untilSourceLeaves: true },
              { kind: "exile", target: 2, untilSourceLeaves: true },
              { kind: "exile", target: 3, untilSourceLeaves: true },
            ],
          },
          {
            kind: "delayed-trigger",
            at: { returnsUntilLeaves: "source", underYourControl: true },
            effect: {
              kind: "choose-permanents",
              filter: { inSet: "trigger-batch" },
              upTo: 1,
              min: 1,
              prompt: "Put two +1/+1 counters on one of the cards that entered under your control",
              then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
            },
            text: "When an exiled card enters under your control this way, put two +1/+1 counters on it.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
