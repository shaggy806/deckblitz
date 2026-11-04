import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

const TEXT =
  "Delirium — Whenever this creature enters or attacks, if there are four or more card types among cards in your graveyard, distribute two +1/+1 counters among one or two target creatures. Then if there are six or more card types among cards in your graveyard, double the number of +1/+1 counters on those creatures.";

/** Abzan Charm's distribution, then the same count as delirium's at six. */
const FEEDS: Omit<TriggeredAbility, "trigger"> = {
  condition: { kind: "delirium" },
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target-chosen", index: 1 },
        then: {
          kind: "sequence", together: true,
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          ],
        },
        else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      {
        kind: "conditional",
        condition: {
          kind: "aggregate",
          value: { aggregate: "distinct", of: "card-type", filter: { ownedBy: "you" }, in: "graveyards" },
          compare: { op: "gte", n: 6 },
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "double-counters", target: 0, counter: "+1/+1" },
            {
              kind: "conditional",
              condition: { kind: "target-chosen", index: 1 },
              then: { kind: "double-counters", target: 1, counter: "+1/+1" },
            },
          ],
        },
      },
    ],
  },
  resolve: null,
  text: TEXT,
};

// EDHREC rank 13713.
//
// Rulings:
//   [2024-09-20] To double the number of +1/+1 counters on a permanent, put a number of +1/+1
//     counters on it equal to the number it already has. Other effects that interact with putting
//     counters on it will interact with this effect accordingly.

export default defineCard({
  name: "Omnivorous Flytrap",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant"],
  power: 2,
  toughness: 4,
  text: "Delirium — Whenever this creature enters or attacks, if there are four or more card types among cards in your graveyard, distribute two +1/+1 counters among one or two target creatures. Then if there are six or more card types among cards in your graveyard, double the number of +1/+1 counters on those creatures.",
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, ...FEEDS },
    { trigger: { on: "attacks", who: "self" }, ...FEEDS },
  ],
});
