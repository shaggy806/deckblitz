import { defineCard } from "../define.js";

// EDHREC rank 8866. The target is chosen as the trigger goes on the stack; how
// many counters move (none to all) as it resolves — and none at all if the
// target is illegal or this creature has left (the rulings: `from: "source"`
// names nothing once it's gone).

const ENTERS = "This creature enters with two +1/+1 counters on it.";
const UPKEEP =
  "At the beginning of your upkeep, you may move any number of +1/+1 counters from this creature onto another target creature.";

export default defineCard({
  name: "Scrounging Bandar",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Monkey"],
  power: 0,
  toughness: 0,
  text: `${ENTERS}\n${UPKEEP}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: ENTERS,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "move-counters", from: "source", to: 0, counter: "+1/+1", amount: "any" },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
