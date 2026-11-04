import { defineCard } from "../define.js";

// A creature attacking you, whoever controls it: not one attacking another player
// or a planeswalker of yours.
export default defineCard({
  name: "Heroic Return",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if a creature is attacking you.\nReturn target creature card from your graveyard to the battlefield. If a Hero enters this way, it enters with two additional +1/+1 counters on it.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { type: "creature", attackingYou: true }, atLeast: 1, anyController: true },
    reduceGeneric: 2,
  },
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { subtype: "Hero" } },
    then: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 2 } },
    else: { kind: "put-onto-battlefield", target: 0 },
  },
});
