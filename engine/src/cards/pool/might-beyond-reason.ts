import { defineCard } from "../define.js";

export default defineCard({
  name: "Might Beyond Reason",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put two +1/+1 counters on target creature.\nDelirium — Put three +1/+1 counters on that creature instead if there are four or more card types among cards in your graveyard.",
  targets: ["creature"],
  effect: {
    kind: "add-counter",
    target: 0,
    counter: "+1/+1",
    amount: { ifCondition: { kind: "delirium" }, then: 3, else: 2 },
  },
});
