import { defineCard } from "../define.js";

export default defineCard({
  name: "Wilt in the Heat",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if one or more cards left your graveyard this turn.\nWilt in the Heat deals 5 damage to target creature. If that creature would die this turn, exile it instead.",
  selfCostReduction: {
    condition: { kind: "turn-stat", stat: "cards-left-graveyard", who: "you", atLeast: 1 },
    reduceGeneric: 2,
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
