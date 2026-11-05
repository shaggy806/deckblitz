import { defineCard } from "../define.js";

// EDHREC rank 13527.
//
// The upkeep's player may pay {2} (`each-player-may` with a mana option);
// paid, they put the rope counter on a creature of their own choice (a
// `choose-permanents` they answer, not a target — Sunken Hope's shape).
// Otherwise this artifact and every creature without a rope counter are
// exiled together, then every rope counter comes off every creature.
const ENTER_TEXT = "When this artifact enters, put a rope counter on target creature you control.";
const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, that player may pay {2}. If they do, they put a rope counter on a creature they control. Otherwise, exile this artifact and each creature without a rope counter on it, then remove all rope counters from all creatures.";

export default defineCard({
  name: "Fraying Line",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "rope", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        ifDid: {
          kind: "choose-permanents",
          chooser: "active-player",
          filter: { type: "creature", controlledBy: "you" },
          min: 1,
          upTo: 1,
          then: { kind: "add-counter", target: 0, counter: "rope", amount: 1 },
          prompt: "Put a rope counter on a creature you control",
        },
        ifDidnt: {
          kind: "sequence",
          effects: [
            {
              kind: "sequence",
              simultaneous: true,
              effects: [
                { kind: "exile", target: "source" },
                { kind: "exile-all", filter: { type: "creature", counters: { kind: "rope", compare: { op: "eq", n: 0 } } } },
              ],
            },
            { kind: "remove-counter-all", filter: { type: "creature" }, counter: "rope", amount: "all" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
